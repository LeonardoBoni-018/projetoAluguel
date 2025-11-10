// backend/controllers/logController.js
import { db } from "../db.js";


export const listarLogs = async (req, res) => {
try {
const [rows] = await db.query("SELECT * FROM log_operacao ORDER BY criado_em DESC");
res.json(rows);
} catch (err) {
console.error(err);
res.status(500).json({ status: "erro", mensagem: "Erro ao listar logs" });
}
};

export const consultarLogs = async (req, res) => {
  const { usuario_id, tipo_operacao, data } = req.query;
  try {
    const [resultSets] = await db.query("CALL sp_ConsultarLogs(?, ?, ?)", [
      usuario_id || null,
      tipo_operacao || null,
      data || null,
    ]);
    res.json(resultSets);
  } catch (err) {
    console.error("Erro ao consultar logs:", err);
    res.status(500).json({ status: "erro", mensagem: "Erro ao consultar logs" });
  }
};
