const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'POST') {
    const { nombre, email, telefono, asunto, mensaje } = req.body;
    try {
      let result = await pool.query(
        'SELECT id_cliente FROM clientes WHERE email = $1', [email]
      );
      let id_cliente;
      if (result.rows.length > 0) {
        id_cliente = result.rows[0].id_cliente;
      } else {
        const nuevo = await pool.query(
          'INSERT INTO clientes (nombre, email, telefono) VALUES ($1, $2, $3) RETURNING id_cliente',
          [nombre, email, telefono]
        );
        id_cliente = nuevo.rows[0].id_cliente;
      }
      await pool.query(
        'INSERT INTO consultas (asunto, mensaje, id_cliente) VALUES ($1, $2, $3)',
        [asunto, mensaje, id_cliente]
      );
      return res.json({ ok: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ ok: false, error: err.message });
    }
  }

  if (req.method === 'GET') {
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
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
