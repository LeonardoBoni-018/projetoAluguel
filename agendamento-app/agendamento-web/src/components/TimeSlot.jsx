import React from 'react';
import styles from '../styles/Components.module.css';

export default function TimeSlot({ start, end, selected, disabled, onClick }) {
  const className = `${styles.timeSlot} ${selected ? styles.selected : ''} ${disabled ? styles.disabled : ''}`;
  
  return (
    <div className={className} onClick={disabled ? undefined : onClick}>
      <div>{formatTime(start)} - {formatTime(end)}</div>
    </div>
  );
}

function formatTime(time) {
  return new Date(time).toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit'
  });
}