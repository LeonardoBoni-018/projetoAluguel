// backend/controllers/authController.js
import { pool } from "../db.js";
import crypto from "crypto";

export const validaLogin = async (req, res) => {
  const { usuario, senha } = req.body;
  const senhaHash = crypto.createHash("sha256").update(senha).digest("hex");

  try {
    const [rows] = await pool.query("CALL sp_ValidaLogin(?, ?)", [usuario, senhaHash]);
    res.json(rows[0][0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao validar login" });
  }
};

export const desbloquearUsuario = async (req, res) => {
  const { id } = req.body;
  try {
    const [rows] = await pool.query("CALL sp_DesbloquearUsuario(?)", [id]);
    res.json(rows[0][0]);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao desbloquear usuário" });
  }
};

export const trocarSenha = async (req, res) => {
  const { id, novaSenha } = req.body;
  const novaHash = crypto.createHash("sha256").update(novaSenha).digest("hex");
  try {
    const [rows] = await pool.query("CALL sp_TrocarSenha(?, ?)", [id, novaHash]);
    res.json(rows[0][0]);
  } catch (err) {
    res.status(500).json({ erro: "Erro ao trocar senha" });
  }
};
