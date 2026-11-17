// src/components/MisObras.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

interface Proyecto {
  id: string;
  nombre: string;
  presupuesto_total: number;
  estado: string;
}

interface MisObrasProps {
  alSeleccionarObra: (proyecto: Proyecto) => void;
  alCrearNueva: () => void;
}

export default function MisObras({ alSeleccionarObra, alCrearNueva }: MisObrasProps) {
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarProyectos = async () => {
      const { data, error } = await supabase
        .from('proyectos')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && !error) {
        setProyectos(data);
      } else {
        console.error('Error al cargar proyectos:', error);
      }
      setCargando(false);
    };

    cargarProyectos();
  }, []);

  const formatearDinero = (cantidad: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(cantidad);
  };

  if (cargando) {
    return <p style={{ textAlign: 'center', marginTop: '50px', color: '#aaa' }}>Cargando tus obras...</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh' }}>
      <h1 style={{ fontSize: '28px', marginBottom: '20px' }}>Mis Obras</h1>
      
      <button 
        onClick={alCrearNueva}
        style={{ width: '100%', padding: '15px', fontSize: '16px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '30px' }}
      >
        + Crear Nueva Obra
      </button>

      {proyectos.length === 0 ? (
        <p style={{ color: '#aaaaaa', textAlign: 'center' }}>Aún no tienes obras registradas.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {proyectos.map((proyecto) => (
            <div 
              key={proyecto.id} 
              onClick={() => alSeleccionarObra(proyecto)}
              style={{ backgroundColor: '#222', padding: '20px', borderRadius: '8px', cursor: 'pointer', borderLeft: proyecto.estado === 'activo' ? '4px solid #2196f3' : '4px solid #555' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '18px' }}>{proyecto.nombre}</strong>
                <span style={{ fontSize: '12px', color: '#aaa', textTransform: 'uppercase' }}>{proyecto.estado}</span>
              </div>
              <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: '#aaa' }}>
                Presupuesto: {formatearDinero(proyecto.presupuesto_total)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}