const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Contraseña simple para el admin (en producción usar bcrypt y JWT)
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'tecnoform2024';

// Crear tablas si no existen (clientes y consultas)
async function ensureTables() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clientes (
      id_cliente  SERIAL PRIMARY KEY,
      nombre      TEXT,
      email       TEXT UNIQUE,
      telefono    TEXT,
      creado_en   TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS consultas (
      id_consulta SERIAL PRIMARY KEY,
      id_cliente  INTEGER REFERENCES clientes(id_cliente),
      asunto      TEXT,
      mensaje     TEXT,
      estado      TEXT DEFAULT 'espera',
      respuesta   TEXT DEFAULT '',
      fecha       TIMESTAMP DEFAULT NOW()
    )
  `);
  // Por si la tabla ya existía con "fecha" como DATE (sin hora),
  // se corrige el tipo y el default para que guarde fecha y hora reales
  await pool.query(`
    ALTER TABLE consultas ALTER COLUMN fecha TYPE TIMESTAMP USING fecha::timestamp;
    ALTER TABLE consultas ALTER COLUMN fecha SET DEFAULT NOW();
  `).catch(() => {});
  await pool.query(`
    ALTER TABLE consultas ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'espera';
    ALTER TABLE consultas ADD COLUMN IF NOT EXISTS respuesta TEXT DEFAULT '';
  `).catch(() => {});
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-secret');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Verificar clave de admin en el header
  const secret = req.headers['x-admin-secret'];
  if (secret !== ADMIN_SECRET) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  try {
    await ensureTables();
  } catch (err) {
    console.error('Error creando tablas:', err);
    return res.status(500).json({ error: 'Error de base de datos: ' + err.message });
  }

  // GET /api/admin-consultas → listar todas con estado
  if (req.method === 'GET') {
    try {
      const result = await pool.query(`
        SELECT c.id_consulta, cl.nombre, cl.email, cl.telefono,
               c.asunto, c.mensaje, c.fecha,
               COALESCE(c.estado, 'espera') AS estado,
               COALESCE(c.respuesta, '') AS respuesta
        FROM consultas c
        JOIN clientes cl ON c.id_cliente = cl.id_cliente
        ORDER BY c.fecha DESC
      `);
      return res.json(result.rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  // PATCH /api/admin-consultas → actualizar estado o respuesta
  if (req.method === 'PATCH') {
    const { id_consulta, estado, respuesta } = req.body;
    if (!id_consulta) return res.status(400).json({ error: 'Falta id_consulta' });

    try {
      await pool.query(
        `UPDATE consultas
         SET estado = COALESCE($1, estado),
             respuesta = COALESCE($2, respuesta)
         WHERE id_consulta = $3`,
        [estado || null, respuesta !== undefined ? respuesta : null, id_consulta]
      );
      return res.json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
