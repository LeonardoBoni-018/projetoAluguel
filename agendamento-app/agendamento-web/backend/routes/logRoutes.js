// backend/routes/logRoutes.js
import express from "express";
import { consultarLogs, listarLogs } from "../controllers/logController.js";


export const router = express.Router();


router.get("/", listarLogs);
router.get("/", consultarLogs);
