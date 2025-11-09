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