const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

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
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    await ensureTables();
    const result = await pool.query(`
      SELECT c.id_consulta, cl.nombre, cl.email, cl.telefono,
             c.asunto, c.mensaje, c.fecha
      FROM consultas c
      JOIN clientes cl ON c.id_cliente = cl.id_cliente
      ORDER BY c.fecha DESC
    `);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
