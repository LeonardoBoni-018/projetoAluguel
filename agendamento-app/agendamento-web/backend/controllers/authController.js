// backend/controllers/authController.js
import { db } from "../db.js";
import crypto from "crypto";


export const validaLogin = async (req, res) => {
const { usuario, senha } = req.body;
try {
// Se a sua procedure espera senha já com hash (CHAR(64)), aplique SHA256 aqui.
// Ajuste conforme seu script SQL (você já usou CHAR(64) no exemplo).
const senhaHash = crypto.createHash("sha256").update(senha).digest("hex");


const [resultSets] = await db.query("CALL sp_ValidaLogin(?, ?)", [usuario, senhaHash]);
// procedures geralmente retornam arrays aninhados
const resposta = Array.isArray(resultSets) ? resultSets[0] : resultSets;
res.json(resposta);
} catch (err) {
console.error(err);
res.status(500).json({ status: "erro", mensagem: "Erro ao validar login" });
}
};


export const desbloquearUsuario = async (req, res) => {
const { id } = req.body;
try {
const [resultSets] = await db.query("CALL sp_DesbloquearUsuario(?)", [id]);
res.json(Array.isArray(resultSets) ? resultSets[0] : resultSets);
} catch (err) {
console.error(err);
res.status(500).json({ status: "erro", mensagem: "Erro ao desbloquear usuário" });
}
};


export const trocarSenha = async (req, res) => {
const { id, novaSenha } = req.body;
try {
const novaHash = crypto.createHash("sha256").update(novaSenha).digest("hex");
const [resultSets] = await db.query("CALL sp_TrocarSenha(?, ?)", [id, novaHash]);
res.json(Array.isArray(resultSets) ? resultSets[0] : resultSets);
} catch (err) {
console.error(err);
res.status(500).json({ status: "erro", mensagem: "Erro ao trocar senha" });
}
};