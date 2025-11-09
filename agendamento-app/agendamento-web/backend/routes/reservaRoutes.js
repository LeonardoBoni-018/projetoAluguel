// backend/routes/reservaRoutes.js
import express from "express";

import {
  criarReserva,
  excluirReserva,
  buscarReservasDoUsuario,
  buscarReservasPorInstalacao
} from "../controllers/reservaController.js";

export const router = express.Router();

router.post("/criar", criarReserva);
router.post("/excluir", excluirReserva);
router.get("/usuario/:id", buscarReservasDoUsuario);
router.get("/instalacao/:id", buscarReservasPorInstalacao);

