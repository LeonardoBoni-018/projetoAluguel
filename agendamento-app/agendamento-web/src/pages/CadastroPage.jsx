import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Alert, Container, MenuItem } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function CadastroPage() {
  const [usuario, setUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [papel, setPapel] = useState('aluno');
  const [ra, setRa] = useState('');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [termo, setTermo] = useState('');
  const [idCurso, setIdCurso] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Lista de cursos disponíveis
  const cursos = [
    { id: 1, nome: 'Educação Física' },
    { id: 2, nome: 'Fisioterapia' },
    { id: 3, nome: 'Enfermagem' },
    { id: 4, nome: 'Medicina' },
    { id: 5, nome: 'Psicologia' }
  ];

  const handleCadastro = async (e) => {
    e.preventDefault();
    setMensagem('');

    const dados = {
      usuario,
      email,
      senha,
      papel,
      ra: papel === 'aluno' ? parseInt(ra) : null,
      nome: papel === 'aluno' ? nome : null,
      telefone: papel === 'aluno' ? telefone : null,
      termo: papel === 'aluno' ? termo : null,
      idCurso: papel === 'aluno' ? parseInt(idCurso) : null
    };

    try {
      const response = await fetch('http://localhost:3000/usuario/cadastrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });

      const data = await response.json();

      if (response.ok && data.status === 'sucesso') {
        navigate('/');
      } else {
        setMensagem(data.erro || 'Erro ao cadastrar');
      }
    } catch (err) {
      console.error(err);
      setMensagem('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
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
            Cadastro
          </Typography>
          
          <Box component="form" onSubmit={handleCadastro} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Usuário"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              fullWidth
              required
              autoFocus
            />
            
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              required
            />

            {papel === 'aluno' && (
              <>
                <TextField
                  label="RA"
                  value={ra}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '');
                    setRa(value);
                  }}
                  fullWidth
                  required
                  type="number"
                  helperText="Número de Registro do Aluno (somente números)"
                />

                <TextField
                  label="Nome Completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  fullWidth
                  required
                />

                <TextField
                  label="Telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  fullWidth
                />

                <TextField
                  label="Termo"
                  value={termo}
                  onChange={(e) => setTermo(e.target.value)}
                  fullWidth
                  helperText="Ex: 1º, 2º, etc."
                />

                <TextField
                  select
                  label="Curso"
                  value={idCurso}
                  onChange={(e) => setIdCurso(e.target.value)}
                  fullWidth
                  required
                >
                  {cursos.map((curso) => (
                    <MenuItem key={curso.id} value={curso.id.toString()}>
                      {curso.nome}
                    </MenuItem>
                  ))}
                </TextField>
              </>
            )}
            
            <TextField
              label="Senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              fullWidth
              required
              helperText="Mínimo de 6 caracteres"
            />
            
            <TextField
              label="Confirme a Senha"
              type="password"
              value={confirmaSenha}
              onChange={(e) => setConfirmaSenha(e.target.value)}
              fullWidth
              required
            />

            <TextField
              select
              label="Papel"
              value={papel}
              onChange={(e) => setPapel(e.target.value)}
              fullWidth
            >
              <MenuItem value="aluno">Aluno</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>

            {mensagem && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {mensagem}
              </Alert>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<PersonAddIcon />}
              disabled={loading}
              fullWidth
              sx={{ mt: 2 }}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>

            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              fullWidth
              onClick={() => navigate('/')}
            >
              Voltar para Login
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}