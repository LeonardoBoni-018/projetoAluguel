// backend/routes/logRoutes.js
import express from "express";
import { listarLogs } from "../controllers/logController.js";


export const router = express.Router();


router.get("/", listarLogs);