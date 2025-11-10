// backend/controllers/reservaController.js
import { db } from "../db.js";

export const criarReserva = async (req, res) => {
  const { ra_aluno, id_instalacao, id_curso, inicio, fim, created_by } =
    req.body;
  try {
    const [resultSets] = await db.query(
      "CALL sp_CriarReserva(?, ?, ?, ?, ?, ?)",
      [ra_aluno, id_instalacao, id_curso, inicio, fim, created_by]
    );
    res.json(Array.isArray(resultSets) ? resultSets[0] : resultSets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "erro", mensagem: "Erro ao criar reserva" });
  }
};

export const excluirReserva = async (req, res) => {
  console.log("Excluir reserva chamada com body:", req.body);
  const { id_reserva, usuario_id } = req.body;
  try {
    const [resultSets] = await db.query("CALL sp_ExcluirReserva(?, ?)", [
      id_reserva,
      usuario_id,
    ]);
    res.json(Array.isArray(resultSets) ? resultSets[0] : resultSets);
  } catch (err) {
    console.error("Erro ao excluir reserva:", err);
    res.status(500).json({ status: "erro", mensagem: "Erro ao excluir reserva" });
  }
};



export const buscarReservasDoUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const [resultSets] = await db.query("CALL sp_BuscarReservasDoUsuario(?)", [
      id,
    ]);
    res.json({ status: "sucesso", reservas: resultSets[0] || [] });
  } catch (err) {
    console.error("Erro ao buscar reservas do usuário:", err);
    res
      .status(500)
      .json({ status: "erro", mensagem: "Erro ao buscar reservas" });
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
    res
      .status(500)
      .json({ status: "erro", mensagem: "Erro ao buscar reservas" });
  }
};

export const buscarReservaPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query(
      "SELECT * FROM reserva WHERE id_reserva = ?",
      [id]
    );
    if (result.length === 0) {
      return res
        .status(404)
        .json({ status: "erro", mensagem: "Reserva não encontrada" });
    }
    res.json({ status: "sucesso", reserva: result[0] });
  } catch (err) {
    console.error("Erro ao buscar reserva:", err);
    res
      .status(500)
      .json({ status: "erro", mensagem: "Erro ao buscar reserva" });
  }
};

export const editarReserva = async (req, res) => {
  const { id_reserva, inicio, fim, usuario_id } = req.body;

  try {
    await db.query("CALL sp_AtualizarReserva(?, ?, ?, ?, ?)", [
      id_reserva,
      inicio,
      fim,
      "confirmada",
      usuario_id,
    ]);

    res.json({ status: "sucesso", mensagem: "Reserva atualizada com sucesso" });
  } catch (err) {
    console.error("Erro ao editar reserva:", err);
    res
      .status(500)
      .json({ status: "erro", mensagem: "Erro ao editar reserva" });
  }
};
