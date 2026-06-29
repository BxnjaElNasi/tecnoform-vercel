const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'tecnoform2024';

// Crear tabla si no existe
async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS productos (
      id          SERIAL PRIMARY KEY,
      cat         VARCHAR(50)  NOT NULL,
      nombre      TEXT         NOT NULL,
      spec        TEXT,
      precio      VARCHAR(30),
      stock       VARCHAR(10)  DEFAULT 'ok',
      imagen_url  TEXT,
      activo      BOOLEAN      DEFAULT true,
      creado_en   TIMESTAMP    DEFAULT NOW()
    )
  `);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-secret');

  if (req.method === 'OPTIONS') return res.status(200).end();

  await ensureTable();

  // GET público — para la página principal
  if (req.method === 'GET') {
    const result = await pool.query(
      'SELECT * FROM productos WHERE activo = true ORDER BY cat, id'
    );
    return res.json(result.rows);
  }

  // POST y DELETE requieren auth
  const secret = req.headers['x-admin-secret'];
  if (secret !== ADMIN_SECRET) return res.status(401).json({ error: 'No autorizado' });

  // POST — agregar producto
  if (req.method === 'POST') {
    const { cat, nombre, spec, precio, stock, imagen_url } = req.body;
    if (!cat || !nombre) return res.status(400).json({ error: 'cat y nombre son requeridos' });
    const r = await pool.query(
      'INSERT INTO productos (cat, nombre, spec, precio, stock, imagen_url) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [cat, nombre, spec || '', precio || '', stock || 'ok', imagen_url || '']
    );
    return res.json(r.rows[0]);
  }

  // DELETE — eliminar producto
  if (req.method === 'DELETE') {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: 'Falta id' });
    await pool.query('UPDATE productos SET activo = false WHERE id = $1', [id]);
    return res.json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
