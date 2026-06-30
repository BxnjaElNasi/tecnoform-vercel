const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'tecnoform2024';

// Categorías por defecto (se insertan si la tabla está vacía)
const CATS_DEFAULT = [
  { value: 'ram',     label: 'RAM',      orden: 1 },
  { value: 'ssd',     label: 'SSD',      orden: 2 },
  { value: 'teclado', label: 'Teclado',  orden: 3 },
  { value: 'mouse',   label: 'Mouse',    orden: 4 },
  { value: 'monitor', label: 'Monitor',  orden: 5 },
];

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categorias (
      id        SERIAL PRIMARY KEY,
      value     VARCHAR(60)  UNIQUE NOT NULL,
      label     VARCHAR(80)  NOT NULL,
      orden     INTEGER      DEFAULT 99,
      activo    BOOLEAN      DEFAULT true,
      creado_en TIMESTAMP    DEFAULT NOW()
    )
  `);
  // Si no hay filas, insertar las por defecto
  const { rows } = await pool.query('SELECT COUNT(*) FROM categorias WHERE activo = true');
  if (parseInt(rows[0].count) === 0) {
    for (const c of CATS_DEFAULT) {
      await pool.query(
        'INSERT INTO categorias (value, label, orden) VALUES ($1, $2, $3) ON CONFLICT (value) DO NOTHING',
        [c.value, c.label, c.orden]
      );
    }
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-secret');

  if (req.method === 'OPTIONS') return res.status(200).end();

  await ensureTable();

  // GET público — devuelve todas las categorías activas
  if (req.method === 'GET') {
    const result = await pool.query(
      'SELECT id, value, label, orden FROM categorias WHERE activo = true ORDER BY orden, id'
    );
    return res.json(result.rows);
  }

  // Rutas que requieren auth de admin
  const secret = req.headers['x-admin-secret'];
  if (secret !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  // POST — agregar categoría
  if (req.method === 'POST') {
    const { value, label, orden } = req.body;
    if (!value || !label) {
      return res.status(400).json({ error: 'value y label son requeridos' });
    }
    try {
      const r = await pool.query(
        'INSERT INTO categorias (value, label, orden) VALUES ($1, $2, $3) RETURNING *',
        [value, label, orden || 99]
      );
      return res.json(r.rows[0]);
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ error: 'Ya existe una categoría con ese valor interno.' });
      }
      return res.status(500).json({ error: err.message });
    }
  }

  // PUT — editar label u orden de una categoría
  if (req.method === 'PUT') {
    const { id, label, orden } = req.body;
    if (!id || !label) {
      return res.status(400).json({ error: 'id y label son requeridos' });
    }
    const r = await pool.query(
      'UPDATE categorias SET label = $1, orden = COALESCE($2, orden) WHERE id = $3 RETURNING *',
      [label, orden ?? null, id]
    );
    return res.json(r.rows[0] || { error: 'No encontrado' });
  }

  // DELETE — desactivar categoría (soft delete)
  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Falta id' });
    await pool.query('UPDATE categorias SET activo = false WHERE id = $1', [id]);
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
