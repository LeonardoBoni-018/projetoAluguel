// backend/controllers/reservaController.js
import { db } from "../db.js";


export const criarReserva = async (req, res) => {
const { ra_aluno, id_instalacao, id_curso, inicio, fim, created_by } = req.body;
try {
const [resultSets] = await db.query("CALL sp_CriarReserva(?, ?, ?, ?, ?, ?)", [
ra_aluno,
id_instalacao,
id_curso,
inicio,
fim,
created_by,
]);
res.json(Array.isArray(resultSets) ? resultSets[0] : resultSets);
} catch (err) {
console.error(err);
res.status(500).json({ status: "erro", mensagem: "Erro ao criar reserva" });
}
};


export const excluirReserva = async (req, res) => {
const { id_reserva, usuario_id } = req.body;
try {
const [resultSets] = await db.query("CALL sp_ExcluirReserva(?, ?)", [id_reserva, usuario_id]);
res.json(Array.isArray(resultSets) ? resultSets[0] : resultSets);
} catch (err) {
console.error(err);
res.status(500).json({ status: "erro", mensagem: "Erro ao excluir reserva" });
}
};