// src/App.tsx
import { useState, useEffect } from 'react';
import Tablero from './components/Tablero';
import RegistrarGasto from './components/RegistrarGasto';

document.body.style.backgroundColor = '#121212';

function App() {
  const [pantallaActual, setPantallaActual] = useState('tablero');
  
  const [presupuesto] = useState(() => {
    const guardado = localStorage.getItem('presupuesto');
    return guardado ? Number(guardado) : 80000;
  });

  // Ahora guardamos un ARRAY de gastos en lugar de un número simple
  const [historialGastos, setHistorialGastos] = useState<any[]>(() => {
    const guardado = localStorage.getItem('historial');
    return guardado ? JSON.parse(guardado) : [];
  });

  // Guardamos el historial en el teléfono cada vez que cambie
  useEffect(() => {
    localStorage.setItem('historial', JSON.stringify(historialGastos));
  }, [historialGastos]);

  // Calculamos el total gastado sumando los montos del historial
  const totalGastado = historialGastos.reduce((suma, gasto) => suma + gasto.monto, 0);

  const manejarNuevoGasto = (monto: number, foto: string | null, categoria: string) => {
    const nuevoGasto = {
      id: Date.now(), // Un ID único basado en la hora
      monto: monto,
      categoria: categoria,
      fecha: new Date().toLocaleDateString('es-MX'),
      foto: foto
    };
    
    // Agregamos el nuevo gasto al principio de la lista
    setHistorialGastos([nuevoGasto, ...historialGastos]); 
    setPantallaActual('tablero');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto', backgroundColor: '#121212', color: 'white', minHeight: '100dvh', width: '100%', boxSizing: 'border-box' }}>
      
      {pantallaActual === 'tablero' && (
        <Tablero 
          presupuesto={presupuesto} 
          gastado={totalGastado} 
          historial={historialGastos}
          alRegistrarClick={() => setPantallaActual('registrar')} 
        />
      )}

      {pantallaActual === 'registrar' && (
        <RegistrarGasto 
          alVolver={() => setPantallaActual('tablero')} 
          alGuardar={manejarNuevoGasto} 
        />
      )}

    </div>
  );
}

export default App;