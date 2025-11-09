import express from "express";
import { cadastrarUsuario } from "../controllers/usuarioController.js";

export const router = express.Router();

router.post("/cadastrar", cadastrarUsuario);
