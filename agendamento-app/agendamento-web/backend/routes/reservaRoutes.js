// backend/routes/reservaRoutes.js
import express from "express";

import {
  criarReserva,
  excluirReserva,
  buscarReservasDoUsuario,
  buscarReservasPorInstalacao,
  buscarReservaPorId,
  editarReserva,
} from "../controllers/reservaController.js";

export const router = express.Router();

router.post("/criar", criarReserva);
router.post("/excluir", excluirReserva);
router.get("/usuario/:id", buscarReservasDoUsuario);
router.get("/instalacao/:id", buscarReservasPorInstalacao);
router.get("/:id", buscarReservaPorId);
router.put("/editar", editarReserva);
