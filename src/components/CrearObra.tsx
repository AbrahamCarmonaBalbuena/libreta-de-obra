// src/components/CrearObra.tsx
import { useState } from 'react';

interface CrearObraProps {
  alCrear: (nombre: string, presupuesto: number) => void;
}

export default function CrearObra({ alCrear }: CrearObraProps) {
  const [nombre, setNombre] = useState('');
  const [presupuesto, setPresupuesto] = useState('');

  const handleCrear = () => {
    if (nombre.trim() === '' || Number(presupuesto) <= 0) {
      alert("Por favor, llena ambos campos correctamente.");
      return;
    }
    alCrear(nombre, Number(presupuesto));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '80vh' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Nueva Obra</h1>
      <p style={{ color: '#aaaaaa', marginBottom: '30px' }}>Ingresa los datos para empezar a controlar tus gastos.</p>

      <label style={{ marginBottom: '8px', fontSize: '14px' }}>Nombre de la obra (Ej. Casa Juan Pérez)</label>
      <input 
        type="text" 
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre del cliente o proyecto"
        style={{ padding: '15px', fontSize: '16px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#222', color: 'white', marginBottom: '20px' }}
      />

      <label style={{ marginBottom: '8px', fontSize: '14px' }}>Presupuesto total (MXN)</label>
      <input 
        type="number" 
        value={presupuesto}
        onChange={(e) => setPresupuesto(e.target.value)}
        placeholder="Ej. 80000"
        style={{ padding: '15px', fontSize: '16px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#222', color: 'white', marginBottom: '30px' }}
      />

      <button 
        onClick={handleCrear}
        style={{ width: '100%', padding: '15px', fontSize: '18px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
      >
        Comenzar Obra
      </button>
    </div>
  );
}