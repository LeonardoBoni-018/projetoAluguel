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

export const buscarReservasDoUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const [resultSets] = await db.query("CALL sp_BuscarReservasDoUsuario(?)", [id]);
    res.json({ status: "sucesso", reservas: resultSets[0] || [] });
  } catch (err) {
    console.error("Erro ao buscar reservas do usuário:", err);
    res.status(500).json({ status: "erro", mensagem: "Erro ao buscar reservas" });
  }
};

export const buscarReservasPorInstalacao = async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  try {
    const [resultSets] = await db.query(
      "CALL sp_BuscarReservasPorInstalacaoData(?, ?)",
      [id, date]
    );
    res.json({ status: "sucesso", reservas: resultSets[0] || [] });
  } catch (err) {
    console.error("Erro ao buscar reservas:", err);
    res.status(500).json({ status: "erro", mensagem: "Erro ao buscar reservas" });
  }
};

