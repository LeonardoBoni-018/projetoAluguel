import express from "express";
import {
  cadastrarUsuario,
  desbloquearUsuario,
  trocarSenha
} from "../controllers/usuarioController.js";


export const router = express.Router();

router.post("/cadastrar", cadastrarUsuario);
router.post("/desbloquear", desbloquearUsuario);
router.post("/trocar-senha", trocarSenha);


