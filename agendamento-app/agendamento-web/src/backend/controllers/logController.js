// backend/controllers/logController.js
import { pool } from "../db.js";

export const listarLogs = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM log_operacao ORDER BY criado_em DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao listar logs" });
  }
};
