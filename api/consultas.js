const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
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
