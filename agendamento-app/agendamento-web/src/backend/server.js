// backend/server.js
import express from "express";
import cors from "cors";
import { router as authRoutes } from "./routes/authRoutes.js";
import { router as reservaRoutes } from "./routes/reservaRoutes.js";
import { router as logRoutes } from "./routes/logRoutes.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/reservas", reservaRoutes);
app.use("/logs", logRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
