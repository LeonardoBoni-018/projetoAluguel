import { db } from "../db.js";
import crypto from "crypto";

export const cadastrarUsuario = async (req, res) => {
  const {
    usuario,
    email,
    senha,
    papel,
    ra,
    nome,
    telefone,
    termo,
    idCurso
  } = req.body;

  try {
    const senhaHash = crypto.createHash("sha256").update(senha).digest("hex");

    const [usuarioResult] = await db.query(
      "INSERT INTO usuario (usuario, email, senha_hash, papel) VALUES (?, ?, ?, ?)",
      [usuario, email, senhaHash, papel]
    );

    const id_usuario = usuarioResult.insertId;

    if (papel === "aluno") {
      await db.query(
        "INSERT INTO aluno (ra_aluno, nome_aluno, email_aluno, telefone, termo, id_curso, id_usuario) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [ra, nome, email, telefone, termo, idCurso, id_usuario]
      );
    }

    res.status(201).json({ status: "sucesso", mensagem: "Usuário cadastrado com sucesso" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "erro", mensagem: "Erro ao cadastrar usuário" });
  }
};
