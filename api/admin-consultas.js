const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Contraseña simple para el admin (en producción usar bcrypt y JWT)
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'tecnoform2024';

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

  // GET /api/admin-consultas → listar todas con estado
  if (req.method === 'GET') {
    try {
      // Asegurarse que la columna estado exista
      await pool.query(`
        ALTER TABLE consultas ADD COLUMN IF NOT EXISTS estado TEXT DEFAULT 'espera';
        ALTER TABLE consultas ADD COLUMN IF NOT EXISTS respuesta TEXT DEFAULT '';
      `).catch(() => {}); // ignorar si ya existen

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
