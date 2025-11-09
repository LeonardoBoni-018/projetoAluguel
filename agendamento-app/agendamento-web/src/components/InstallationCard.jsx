import React from 'react';
import styles from '../styles/Components.module.css';

export default function InstallationCard({ title, children }) {
  return (
    <div className={styles.installationCard}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}