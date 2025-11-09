// backend/routes/authRoutes.js
import express from "express";
import { validaLogin, desbloquearUsuario, trocarSenha } from "../controllers/authController.js";

export const router = express.Router();

router.post("/login", validaLogin);
router.post("/desbloquear", desbloquearUsuario);
router.post("/trocar-senha", trocarSenha);
