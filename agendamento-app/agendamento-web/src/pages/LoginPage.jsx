import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Box, Paper, Typography, TextField, Button, Alert, Container, Link } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export default function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const sucesso = await login(usuario, senha);
    if (sucesso) navigate('/home');
    else setMensagem('Usuário ou senha inválidos / bloqueado');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.default',
        py: 3,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography variant="h4" color="primary" textAlign="center" fontWeight="bold" gutterBottom>
            Login
          </Typography>
          
          <Box component="form" onSubmit={handleLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Usuário"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              fullWidth
              required
              autoFocus
            />
            
            <TextField
              label="Senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              fullWidth
              required
            />

            {mensagem && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {mensagem}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<LoginIcon />}
              fullWidth
              sx={{ mt: 2 }}
            >
              Entrar
            </Button>

            <Button
              variant="outlined"
              startIcon={<PersonAddIcon />}
              fullWidth
              onClick={() => navigate('/cadastro')}
            >
              Criar Nova Conta
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
