// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { router as authRoutes } from "./routes/authRoutes.js";
import { router as reservaRoutes } from "./routes/reservaRoutes.js";
import { router as logRoutes } from "./routes/logRoutes.js";
import { router as usuarioRoutes } from "./routes/usuarioRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/usuario", usuarioRoutes);

app.use("/auth", authRoutes);
app.use("/reservas", reservaRoutes);
app.use("/logs", logRoutes);

app.get("/", (req, res) =>
  res.json({ status: "ok", env: process.env.NODE_ENV || "dev" })
);

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
