import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import NavBar from '../components/NavBar';
import Card from '../components/Card';
import FormButton from '../components/FormButton';
import styles from '../styles/Components.module.css';

export default function HomePage() {
  const { usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const sair = () => {
    logout();
    navigate('/');
  };

  return (
    <div className={styles.page}>
      <NavBar usuario={usuario} onLogout={sair} />
      
      <div className={styles.content}>
        <div className={styles.grid}>
          <Card>
            <h3 style={{ margin: 0, color: '#2d7be4' }}>
              Bem-vindo, {usuario?.nome || usuario?.usuario}
            </h3>
            <p style={{ color: '#666', margin: '8px 0 16px' }}>
              Selecione uma opção abaixo:
            </p>

            <div className={styles.buttonGroup}>
              <FormButton onClick={() => navigate('/reserva')}>
                Nova Reserva
              </FormButton>
              <FormButton onClick={sair}>
                Sair
              </FormButton>
            </div>
          </Card>

          {/* Card de Informações */}
          <Card>
            <h3 style={{ margin: 0, color: '#2d7be4' }}>Informações</h3>
            <div style={{ marginTop: 12 }}>
              <p style={{ margin: '8px 0', fontSize: 14, color: '#666' }}>
                • Reservas podem ter no máximo 2 horas de duração
              </p>
              <p style={{ margin: '8px 0', fontSize: 14, color: '#666' }}>
                • Horário de funcionamento: 8h às 23h
              </p>
              <p style={{ margin: '8px 0', fontSize: 14, color: '#666' }}>
                • Instalações disponíveis:
              </p>
              <ul style={{ margin: '4px 0', paddingLeft: 24 }}>
                <li style={{ fontSize: 14, color: '#666' }}>Campo 1 e 2</li>
                <li style={{ fontSize: 14, color: '#666' }}>Quadra 1 e 2</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}