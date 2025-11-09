import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import NavBar from '../components/NavBar';
import Card from '../components/Card';
import FormButton from '../components/FormButton';
import TimeSlot from '../components/TimeSlot';
import InstallationCard from '../components/InstallationCard';
import styles from '../styles/Components.module.css';

const INSTALLATIONS = [
  { id: 1, nome: 'Campo 1', tipo: 'campo' },
  { id: 2, nome: 'Campo 2', tipo: 'campo' },
  { id: 3, nome: 'Quadra 1', tipo: 'quadra' },
  { id: 4, nome: 'Quadra 2', tipo: 'quadra' }
];

export default function ReservaPage() {
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [selectedInstallation, setSelectedInstallation] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [raAluno, setRaAluno] = useState('');
  const [idCurso, setIdCurso] = useState('1');
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const { usuario } = useContext(AuthContext);

  useEffect(() => {
    if (selectedDate) {
      generateTimeSlots(selectedDate);
    }
  }, [selectedDate]);

  function getTodayString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  function generateTimeSlots(date) {
    const slots = [];
    const start = new Date(date + 'T08:00:00'); // Começa às 8h
    const end = new Date(date + 'T23:00:00');   // Termina às 23h

    while (start < end) {
      const slotEnd = new Date(start.getTime() + 2 * 60 * 60 * 1000); // +2 horas
      if (slotEnd <= end) {
        slots.push({
          start: start.toISOString(),
          end: slotEnd.toISOString(),
          disabled: false // aqui você pode verificar conflitos
        });
      }
      start.setTime(start.getTime() + 30 * 60 * 1000); // Próximo slot em 30min
    }

    setTimeSlots(slots);
  }

  const reservar = async () => {
    if (!selectedInstallation || !selectedTimeSlot || !raAluno) {
      setMensagem('Selecione instalação, horário e informe o RA');
      return;
    }

    setLoading(true);
    setMensagem('');

    try {
      const res = await axios.post('http://localhost:3000/reserva/criar', {
        ra_aluno: raAluno,
        id_instalacao: selectedInstallation.id,
        id_curso: Number(idCurso),
        inicio: selectedTimeSlot.start,
        fim: selectedTimeSlot.end,
        created_by: usuario?.id || usuario?.id_usuario
      });

      const data = Array.isArray(res.data) ? res.data[0] : res.data;
      setMensagem(data?.mensagem || 'Reserva realizada com sucesso!');
      
      // Limpar seleção após sucesso
      setSelectedTimeSlot(null);
      setRaAluno('');
      
    } catch (err) {
      console.error(err.response?.data || err.message);
      setMensagem(err.response?.data?.erro || 'Erro ao reservar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <NavBar usuario={usuario} onLogout={() => {}} />
      
      <div className={styles.content}>
        <Card title="Nova Reserva">
          <div style={{ marginBottom: 20 }}>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              min={getTodayString()}
              style={{ padding: 10, borderRadius: 6, border: '1px solid #ddd' }}
            />
          </div>

          <div className={styles.grid}>
            {INSTALLATIONS.map(installation => (
              <InstallationCard key={installation.id} title={installation.nome}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {timeSlots.map((slot, index) => (
                    <TimeSlot
                      key={index}
                      start={slot.start}
                      end={slot.end}
                      selected={selectedTimeSlot === slot && selectedInstallation?.id === installation.id}
                      disabled={slot.disabled}
                      onClick={() => {
                        setSelectedInstallation(installation);
                        setSelectedTimeSlot(slot);
                      }}
                    />
                  ))}
                </div>
              </InstallationCard>
            ))}
          </div>

          {selectedTimeSlot && selectedInstallation && (
            <div style={{ marginTop: 20 }}>
              <h4 style={{ margin: '0 0 10px 0' }}>
                Confirmar reserva para {selectedInstallation.nome}
              </h4>
              <input
                placeholder="RA do Aluno"
                value={raAluno}
                onChange={e => setRaAluno(e.target.value)}
                style={{ padding: 10, borderRadius: 6, border: '1px solid #ddd', width: '100%', marginBottom: 10 }}
              />
              <select
                value={idCurso}
                onChange={e => setIdCurso(e.target.value)}
                className={styles.select}
                style={{ width: '100%', marginBottom: 10 }}
              >
                <option value="1">Curso 1</option>
                <option value="2">Curso 2</option>
              </select>

              <div className={styles.buttonGroup}>
                <FormButton onClick={() => {
                  setSelectedInstallation(null);
                  setSelectedTimeSlot(null);
                }}>
                  Cancelar
                </FormButton>
                <FormButton onClick={reservar} disabled={loading}>
                  {loading ? 'Reservando...' : 'Confirmar Reserva'}
                </FormButton>
              </div>
            </div>
          )}

          {mensagem && (
            <p style={{ 
              textAlign: 'center', 
              color: mensagem.includes('sucesso') ? '#27ae60' : '#e74c3c',
              margin: '16px 0 0 0'
            }}>
              {mensagem}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}