import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Box, Container, Grid, TextField, Button, Alert, Typography, MenuItem, InputAdornment } from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptBR from 'date-fns/locale/pt-BR';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';
import SchoolIcon from '@mui/icons-material/School';
import NavBar from '../components/NavBar';
import Card from '../components/Card';

const formatDateForMySQL = (date) => {
  if (!date) return null;
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

const INSTALACOES = [
  { id: 1, nome: 'Campo 1', tipo: 'campo' },
  { id: 2, nome: 'Campo 2', tipo: 'campo' },
  { id: 3, nome: 'Quadra 1', tipo: 'quadra' },
  { id: 4, nome: 'Quadra 2', tipo: 'quadra' }
];

const CURSOS = [
  { id: 1, nome: 'Educação Física' },
  { id: 2, nome: 'Fisioterapia' },
  { id: 3, nome: 'Enfermagem' },
  { id: 4, nome: 'Medicina' },
  { id: 5, nome: 'Psicologia' }
];

export default function ReservaPage() {
  const navigate = useNavigate();
  const [inicio, setInicio] = useState(null);
  const [fim, setFim] = useState(null);
  const [raAluno, setRaAluno] = useState('');
  const [idInstalacao, setIdInstalacao] = useState('1');
  const [idCurso, setIdCurso] = useState('1');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const { usuario } = useContext(AuthContext);

  const [formValues, setFormValues] = useState({
    ra_aluno: '',
    id_instalacao: '',
    id_curso: 1, // Valor padrão para Educação Física
    inicio: '',
    fim: '',
  });

  const [reservas, setReservas] = useState([]);
  const [slots, setSlots] = useState([]);
  const [dataSelecionada, setDataSelecionada] = useState(() => {
    // usar data local (formato en-CA) para evitar diferenças UTC
    return new Date().toLocaleDateString('en-CA');
  });

  // Gera slots horários de 08:00 até 23:00 (1h)
  const gerarSlots = (dateStr) => {
    const slotsArr = [];
    // incluir slot 23:00 -> 00:00 (h = 23)
    for (let h = 8; h <= 23; h++) {
      const inicio = new Date(`${dateStr}T${String(h).padStart(2, '0')}:00:00`);
      // se h == 23, fim será no dia seguinte; new Date trata isso automaticamente com ISO
      const fim = new Date(`${dateStr}T${String(h + 1).padStart(2, '0')}:00:00`);
      slotsArr.push({ inicio, fim, ocupado: false, ocupante: null });
    }
    return slotsArr;
  };

  // Normaliza string datetime do DB ("YYYY-MM-DD HH:MM:SS") para objeto Date local
  const parseDBDate = (dbDate) => {
    if (!dbDate) return null;
    if (dbDate instanceof Date) return dbDate;
    // "2025-11-03 23:00:00" => "2025-11-03T23:00:00"
    const s = String(dbDate).trim().replace(' ', 'T');
    return new Date(s);
  };

  // carregarReservas: mantenha log para debug
  const carregarReservas = async (instId, dateStr) => {
    if (!instId || !dateStr) return;
    try {
      console.log('Carregando reservas para', instId, dateStr);
      const res = await fetch(`http://localhost:3000/reserva/instalacao/${instId}?date=${dateStr}`);
      const data = await res.json();
      console.log('Reservas recebidas:', data);
      if (data && data.status === 'sucesso') {
        setReservas(data.reservas || []);
      } else {
        setReservas([]);
      }
    } catch (err) {
      console.error('Erro ao buscar reservas:', err);
      setReservas([]);
    }
  };

  // Marca slots ocupados verificando overlap
  useEffect(() => {
    const s = gerarSlots(dataSelecionada);
    s.forEach((slot) => {
      const reservado = reservas.find((r) => {
        const rInicio = parseDBDate(r.inicio);
        const rFim = parseDBDate(r.fim);
        if (!rInicio || !rFim) return false;
        return slot.inicio < rFim && slot.fim > rInicio;
      });
      if (reservado) {
        slot.ocupado = true;
        slot.ocupante = {
          nome: reservado.nome_aluno || `RA ${reservado.ra_aluno}`,
          ra: reservado.ra_aluno,
          inicio: reservado.inicio,
          fim: reservado.fim
        };
      }
    });
    setSlots(s);
  }, [reservas, dataSelecionada]);

  // Recarrega reservas quando mudar instalação ou data
  useEffect(() => {
    carregarReservas(idInstalacao, dataSelecionada);
  }, [idInstalacao, dataSelecionada]);

  const formatDateTime = (date, time) => {
    if (!date || !time) return null;
    return `${date}T${time}:00`;
  };

  const reservar = async (e) => {
    e.preventDefault();
    setMensagem('');
    setLoading(true);

    try {
      // Log para debug
      console.log('Dados a serem enviados:', {
        ra_aluno: raAluno,
        id_instalacao: idInstalacao,
        id_curso: idCurso,
        inicio: formatDateForMySQL(inicio),
        fim: formatDateForMySQL(fim),
        usuario_id: usuario?.id_usuario
      });

      const response = await fetch('http://localhost:3000/reserva/criar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ra_aluno: parseInt(raAluno),
          id_instalacao: parseInt(idInstalacao),
          id_curso: parseInt(idCurso),
          inicio: formatDateForMySQL(inicio),
          fim: formatDateForMySQL(fim),
          usuario_id: usuario?.id_usuario
        })
      });

      const data = await response.json();
      console.log('Resposta da API:', data);

      if (data.status === 'erro') {
        setMensagem(data.mensagem);
      } else {
        navigate('/home');
      }
    } catch (error) {
      console.error('Erro:', error);
      setMensagem('Erro ao criar reserva');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <NavBar usuario={usuario} onLogout={() => {}} />
      
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Card elevation={3}>
          <Box component="form" onSubmit={reservar} sx={{ p: 2 }}>
            <Typography variant="h5" color="primary" gutterBottom align="center" sx={{ mb: 3 }}>
              Nova Reserva
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="RA do Aluno"
                  value={raAluno}
                  onChange={(e) => {
                    // Permite apenas números
                    const value = e.target.value.replace(/\D/g, '');
                    setRaAluno(value);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  type="number"
                  helperText="Número de Registro do Aluno (somente números)"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  required
                  fullWidth
                  label="Instalação"
                  value={idInstalacao}
                  onChange={(e) => setIdInstalacao(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SportsSoccerIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                >
                  {INSTALACOES.map((inst) => (
                    <MenuItem key={inst.id} value={inst.id.toString()}>
                      {inst.nome}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  required
                  fullWidth
                  label="Curso"
                  value={idCurso}
                  onChange={(e) => setIdCurso(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SchoolIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                >
                  {CURSOS.map((curso) => (
                    <MenuItem key={curso.id} value={curso.id.toString()}>
                      {curso.nome}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <DateTimePicker
                        label="Início"
                        value={inicio}
                        onChange={setInicio}
                        slotProps={{
                          textField: { 
                            fullWidth: true,
                            required: true
                          }
                        }}
                        minTime={new Date().setHours(8, 0)}
                        maxTime={new Date().setHours(23, 0)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <DateTimePicker
                        label="Fim"
                        value={fim}
                        onChange={setFim}
                        slotProps={{
                          textField: { 
                            fullWidth: true,
                            required: true
                          }
                        }}
                        minTime={new Date().setHours(8, 0)}
                        maxTime={new Date().setHours(23, 0)}
                      />
                    </Grid>
                  </Grid>
                </LocalizationProvider>
              </Grid>

              {mensagem && (
                <Grid item xs={12}>
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {mensagem}
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  startIcon={<SaveIcon />}
                  size="large"
                  sx={{ mt: 2 }}
                >
                  {loading ? 'Reservando...' : 'Confirmar Reserva'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Card>
      </Container>

      {/* campo para escolher data (YYYY-MM-DD) */}
      <div style={{ marginTop: 12 }}>
        <label>Data: </label>
        <input
          type="date"
          value={dataSelecionada}
          onChange={(e) => setDataSelecionada(e.target.value)}
        />
      </div>

      {/* Lista de horários com status */}
      <div style={{ marginTop: 18 }}>
        <h4>Horários ({dataSelecionada})</h4>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {slots.map((slot, idx) => {
            const inicioStr = slot.inicio.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const fimStr = slot.fim.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <li key={idx} style={{
                padding: '8px 12px',
                borderRadius: 6,
                marginBottom: 8,
                background: slot.ocupado ? '#ffecec' : '#e8ffef',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>{inicioStr} - {fimStr}</strong>
                  <div style={{ fontSize: 12, color: '#444' }}>
                    {slot.ocupado ? `Ocupado por ${slot.ocupante.nome} (RA ${slot.ocupante.ra})` : 'Livre'}
                  </div>
                </div>
                {slot.ocupado ? <span style={{ color: '#c0392b' }}>Ocupado</span> : <span style={{ color: '#27ae60' }}>Livre</span>}
              </li>
            );
          })}
        </ul>
      </div>
    </Box>
  );
}
