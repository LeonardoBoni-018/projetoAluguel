import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import SportsBasketballIcon from "@mui/icons-material/SportsBasketball";
import NavBar from "../components/NavBar";
import Card from "../components/Card";
import TrocarSenhaModal from "../components/TrocarSenhaModal";

export default function HomePage() {
  const { usuario, logout } = useContext(AuthContext);
  const [minhasReservas, setMinhasReservas] = useState([]);
  const navigate = useNavigate();
  const [modalAberto, setModalAberto] = useState(false);
  const abrirModalSenha = () => setModalAberto(true);
  const fecharModalSenha = () => setModalAberto(false);

  const formatDisplay = (dbDate) => {
    if (!dbDate) return "";
    const iso = String(dbDate).replace(" ", "T");
    const d = new Date(iso);
    return d.toLocaleString();
  };

  // carregarMinhasReservas separado para reutilizar (chamar após delete)
  const carregarMinhasReservas = async () => {
    const uid = usuario?.id_usuario || usuario?.id || null;
    console.log("HomePage: usuario no contexto =", usuario, " -> uid =", uid);
    if (!uid) {
      setMinhasReservas([]);
      return;
    }

    try {
      const res = await fetch(`http://localhost:3000/reservas/usuario/${uid}`);

      const data = await res.json();
      console.log("Resposta API /reserva/usuario:", data);
      if (data && data.status === "sucesso") {
        setMinhasReservas(data.reservas || []);
      } else {
        setMinhasReservas([]);
      }
    } catch (err) {
      console.error("Erro ao buscar reservas do usuário:", err);
      setMinhasReservas([]);
    }
  };

  useEffect(() => {
    carregarMinhasReservas();
  }, [usuario]);

  const handleEditar = (reserva) => {
    if (!reserva || !reserva.id_reserva) return;
    navigate(`/reserva/editar/${reserva.id_reserva}`);
  };

  const handleExcluir = async (reserva) => {
    if (!reserva || !reserva.id_reserva) return;
    if (!confirm(`Confirma exclusão da reserva #${reserva.id_reserva}?`))
      return;

    try {
      const body = {
        id_reserva: reserva.id_reserva,
        usuario_id: usuario?.id_usuario || usuario?.id || null,
      };
      const res = await fetch("http://localhost:3000/reservas/excluir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      const resposta = Array.isArray(data) ? data[0] : data;

      if (resposta && resposta.status === "sucesso") {
        carregarMinhasReservas();
      } else {
        alert(resposta.mensagem || "Erro ao excluir reserva");
      }
    } catch (err) {
      console.error("Erro ao excluir reserva:", err);
      alert("Erro de conexão ao excluir reserva");
    }
  };

  const sair = () => {
    logout();
    navigate("/login");
  };

  const trocarSenha = async () => {
    const nova = prompt("Digite a nova senha:");
    if (!nova) return;

    const hash = crypto.SHA256(nova).toString();

    const res = await fetch("http://localhost:3000/usuario/trocar-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_usuario: usuario.id_usuario,
        nova_senha_hash: hash,
      }),
    });

    const data = await res.json();
    alert(data.mensagem || "Senha atualizada");
  };

  console.log("usuarios", usuario);
  console.log("minhasReservas", minhasReservas);
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <NavBar
        usuario={usuario}
        onLogout={sair}
        onChangePassword={abrirModalSenha}
      />

      <TrocarSenhaModal
        open={modalAberto}
        onClose={fecharModalSenha}
        usuario={usuario}
      />

      <Container sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {/* Card de Boas-vindas */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <Box sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h5" color="primary" gutterBottom>
                  Bem-vindo, {usuario?.nome || usuario?.usuario}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  Selecione uma opção abaixo:
                </Typography>
                <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate("/reserva")}
                  >
                    Nova Reserva
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<LogoutIcon />}
                    onClick={sair}
                  >
                    Sair
                  </Button>
                </Box>
              </Box>
            </Card>
          </Grid>

          {/* Card de Informações */}
          <Grid item xs={12} md={6}>
            <Card elevation={3}>
              <Typography variant="h6" color="primary" gutterBottom>
                Informações Importantes
              </Typography>

              <Box sx={{ "& > *": { mb: 1.5 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <SportsSoccerIcon color="primary" />
                  <Typography variant="body2">
                    Campos disponíveis das 8h às 23h
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <SportsBasketballIcon color="primary" />
                  <Typography variant="body2">
                    Quadras disponíveis das 8h às 23h
                  </Typography>
                </Box>

                <Typography variant="subtitle2" color="primary" sx={{ mt: 2 }}>
                  Instalações Disponíveis:
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    • Campo 1 e 2
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Quadra 1 e 2
                  </Typography>
                </Box>

                <Typography variant="subtitle2" color="primary" sx={{ mt: 2 }}>
                  Regras:
                </Typography>
                <Box sx={{ pl: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    • Máximo de 2 horas por reserva
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    • Cancelamentos devem ser feitos com 24h de antecedência
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Minhas Reservas */}
        <div style={{ marginTop: 24 }}>
          <Typography variant="h6" sx={{ mt: 3 }}>
            Minhas Reservas
          </Typography>
          {minhasReservas.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Nenhuma reserva encontrada.
            </Typography>
          ) : (
            <List>
              {minhasReservas.map((r) => (
                <React.Fragment key={r.id_reserva}>
                  <ListItem
                    secondaryAction={
                      <>
                        <IconButton
                          edge="end"
                          aria-label="editar"
                          onClick={() => handleEditar(r)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="excluir"
                          onClick={() => handleExcluir(r)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </>
                    }
                  >
                    <ListItemText
                      primary={`${
                        r.instalacao || `Instalação ${r.id_instalacao}`
                      } — ${r.status || ""}`}
                      secondary={
                        <>
                          <div>
                            {r.nome_aluno
                              ? `Aluno: ${r.nome_aluno} (RA ${r.ra_aluno})`
                              : `RA ${r.ra_aluno}`}
                          </div>
                          <div>Início: {formatDisplay(r.inicio)}</div>
                          <div>Fim: {formatDisplay(r.fim)}</div>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </div>
      </Container>
    </Box>
  );
}
