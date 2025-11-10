import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
  Box,
  Container,
  Button,
  Alert,
  Grid,
  TextField,
  MenuItem,
  Typography,
} from "@mui/material";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import ptBR from "date-fns/locale/pt-BR";

const formatDateForMySQL = (date) => {
  if (!date) return null;
  return date.toISOString().slice(0, 19).replace("T", " ");
};

const INSTALACOES = [
  { id: 1, nome: "Campo 1" },
  { id: 2, nome: "Campo 2" },
  { id: 3, nome: "Quadra 1" },
  { id: 4, nome: "Quadra 2" },
];

export default function EditarReservaPage() {
  const { id } = useParams();
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();

  const [reserva, setReserva] = useState(null);
  const [ra, setRa] = useState("");
  const [idInst, setIdInst] = useState("1");
  const [inicio, setInicio] = useState(null);
  const [fim, setFim] = useState(null);
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const carregar = async () => {
      try {
        const res = await fetch(`http://localhost:3000/reservas/${id}`);

        const data = await res.json();
        if (data?.status === "sucesso" && data.reserva) {
          setReserva(data.reserva);
          setRa(String(data.reserva.ra_aluno));
          setIdInst(String(data.reserva.id_instalacao));
          setInicio(new Date(String(data.reserva.inicio).replace(" ", "T")));
          setFim(new Date(String(data.reserva.fim).replace(" ", "T")));
        } else {
          setMensagem(data.mensagem || "Reserva não encontrada");
        }
      } catch (err) {
        console.error(err);
        setMensagem("Erro ao carregar reserva");
      }
    };
    carregar();
  }, [id]);

  const handleSalvar = async (e) => {
    e.preventDefault();
    setMensagem("");
    setLoading(true);

    try {
      const body = {
        id_reserva: parseInt(id),
        ra_aluno: parseInt(ra),
        id_instalacao: parseInt(idInst),
        id_curso: usuario?.id_curso || 1, // usa o id do curso do usuário se disponível
        inicio: formatDateForMySQL(inicio),
        fim: formatDateForMySQL(fim),
        usuario_id: usuario?.id_usuario || 0, // importante: não pode ser undefined
      };

      const res = await fetch("http://localhost:3000/reservas/editar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.status === "sucesso") {
        navigate("/home");
      } else {
        setMensagem(data.mensagem || "Erro ao editar reserva");
      }
    } catch (err) {
      console.error(err);
      setMensagem("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  };

  if (!reserva) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Carregando reserva...</Typography>
        {mensagem && <Alert severity="error">{mensagem}</Alert>}
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Box component="form" onSubmit={handleSalvar}>
        <Typography variant="h5" gutterBottom>
          Editar Reserva #{id}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="RA do Aluno"
              value={ra}
              onChange={(e) => setRa(e.target.value.replace(/\D/g, ""))}
              fullWidth
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              select
              label="Instalação"
              value={idInst}
              onChange={(e) => setIdInst(e.target.value)}
              fullWidth
            >
              {INSTALACOES.map((i) => (
                <MenuItem key={i.id} value={i.id.toString()}>
                  {i.nome}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={ptBR}
            >
              <DateTimePicker
                label="Início"
                value={inicio}
                onChange={setInicio}
                renderInput={(params) => (
                  <TextField {...params} fullWidth required />
                )}
              />
            </LocalizationProvider>
          </Grid>

          <Grid item xs={12} sm={6}>
            <LocalizationProvider
              dateAdapter={AdapterDateFns}
              adapterLocale={ptBR}
            >
              <DateTimePicker
                label="Fim"
                value={fim}
                onChange={setFim}
                renderInput={(params) => (
                  <TextField {...params} fullWidth required />
                )}
              />
            </LocalizationProvider>
          </Grid>

          {mensagem && (
            <Grid item xs={12}>
              <Alert severity="error">{mensagem}</Alert>
            </Grid>
          )}

          <Grid item xs={12} sx={{ display: "flex", gap: 2 }}>
            <Button variant="contained" type="submit" disabled={loading}>
              Salvar
            </Button>
            <Button variant="outlined" onClick={() => navigate("/home")}>
              Cancelar
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
