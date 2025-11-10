import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import crypto from "crypto-js";

export default function TrocarSenhaModal({ open, onClose, usuario }) {
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [mensagem, setMensagem] = useState("");

  const handleTrocarSenha = async () => {
    if (!novaSenha || !confirmacao) {
      setMensagem("Preencha todos os campos.");
      return;
    }

    if (novaSenha !== confirmacao) {
      setMensagem("As senhas não coincidem.");
      return;
    }

    const hash = crypto.SHA256(novaSenha).toString();

    try {
      const res = await fetch("http://localhost:3000/usuario/trocar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: usuario.id_usuario,
          nova_senha_hash: hash,
        }),
      });

      const data = await res.json();
      setMensagem(data.mensagem || "Senha atualizada com sucesso.");
      setNovaSenha("");
      setConfirmacao("");
    } catch (err) {
      console.error("Erro ao trocar senha:", err);
      setMensagem("Erro ao trocar senha.");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          p: 4,
          borderRadius: 2,
          boxShadow: 24,
          width: 400,
        }}
      >
        <Typography variant="h6" color="primary" gutterBottom>
          Trocar Senha
        </Typography>

        <TextField
          label="Nova Senha"
          type="password"
          fullWidth
          margin="normal"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
        />

        <TextField
          label="Confirmar Nova Senha"
          type="password"
          fullWidth
          margin="normal"
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
        />

        {mensagem && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {mensagem}
          </Alert>
        )}

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3, gap: 2 }}>
          <Button variant="outlined" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="contained" onClick={handleTrocarSenha}>
            Confirmar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
