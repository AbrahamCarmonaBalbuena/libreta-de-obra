// src/components/CrearObra.tsx
import { useState } from 'react';
import { supabase } from '../supabase';

interface CrearObraProps {
  alCrear: (proyecto: { id: string; nombre: string; presupuesto_total: number }) => void;
  alCancelar: () => void; // Por si quiere regresar a la lista sin crear nada
}

export default function CrearObra({ alCrear, alCancelar }: CrearObraProps) {
  const [nombre, setNombre] = useState('');
  const [presupuesto, setPresupuesto] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleCrear = async () => {
    if (nombre.trim() === '' || Number(presupuesto) <= 0) {
      alert("Por favor, llena ambos campos correctamente.");
      return;
    }
    
    setCargando(true);

    // 1. Insertamos en la tabla de proyectos de Supabase
    const { data, error } = await supabase
      .from('proyectos')
      .insert([
        { 
          nombre: nombre, 
          presupuesto_total: Number(presupuesto) 
          // El user_id se llena solito por el default auth.uid()
        }
      ])
      .select(); // Importante para que nos devuelva el ID recién creado

    if (error) {
      console.error("Error al crear la obra:", error);
      alert("Hubo un error al crear la obra en la nube.");
      setCargando(false);
      return;
    }

    // 2. Si todo salió bien, avisamos a App.tsx con el proyecto nuevo
    if (data && data.length > 0) {
      alCrear({
        id: data[0].id,
        nombre: data[0].nombre,
        presupuesto_total: data[0].presupuesto_total
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '80vh' }}>
      <button onClick={alCancelar} style={{ background: 'none', border: 'none', color: '#2196f3', fontSize: '16px', cursor: 'pointer', padding: 0, marginBottom: '20px', textAlign: 'left' }}>
        ← Volver a mis obras
      </button>

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
        disabled={cargando}
        style={{ width: '100%', padding: '15px', fontSize: '18px', backgroundColor: cargando ? '#555' : '#2196f3', color: 'white', border: 'none', borderRadius: '8px', cursor: cargando ? 'wait' : 'pointer' }}
      >
        {cargando ? 'Creando obra...' : 'Comenzar Obra'}
      </button>
    </div>
  );
}