// backend/controllers/reservaController.js
import { pool } from "../db.js";

export const criarReserva = async (req, res) => {
  const { ra_aluno, id_instalacao, id_curso, inicio, fim, created_by } = req.body;
  try {
    const [rows] = await pool.query("CALL sp_CriarReserva(?, ?, ?, ?, ?, ?)", [
      ra_aluno, id_instalacao, id_curso, inicio, fim, created_by
    ]);
    res.json(rows[0][0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao criar reserva" });
  }
};

export const excluirReserva = async (req, res) => {
  const { id_reserva, usuario_id } = req.body;
  try {
    const [rows] = await pool.query("CALL sp_ExcluirReserva(?, ?)", [id_reserva, usuario_id]);
    res.json(rows[0][0]);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao excluir reserva" });
  }
};
