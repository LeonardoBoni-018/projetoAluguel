// backend/routes/reservaRoutes.js
import express from "express";
import { criarReserva, excluirReserva } from "../controllers/reservaController.js";

export const router = express.Router();

router.post("/criar", criarReserva);
router.post("/excluir", excluirReserva);
