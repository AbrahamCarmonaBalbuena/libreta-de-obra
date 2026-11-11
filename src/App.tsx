// src/App.tsx
import { useState, useEffect } from 'react';
import Tablero from './components/Tablero';
import RegistrarGasto from './components/RegistrarGasto';
import CrearObra from './components/CrearObra';
import { supabase } from './supabase';


document.body.style.backgroundColor = '#121212';

function App() {
  // Estados
  const [nombreObra, setNombreObra] = useState(() => localStorage.getItem('nombreObra') || '');
  const [presupuesto, setPresupuesto] = useState(() => Number(localStorage.getItem('presupuesto')) || 0);
  const [historialGastos, setHistorialGastos] = useState<any[]>(() => {
    const guardado = localStorage.getItem('historial');
    return guardado ? JSON.parse(guardado) : [];
  });
  
  const [pantallaActual, setPantallaActual] = useState(nombreObra ? 'tablero' : 'crear');

  // Efectos para guardar en LocalStorage
  useEffect(() => {
    // 1. Guardamos en el teléfono por si se va el internet (Modo Offline)
    localStorage.setItem('nombreObra', nombreObra);
    localStorage.setItem('presupuesto', presupuesto.toString());
    localStorage.setItem('historial', JSON.stringify(historialGastos));

    // 2. Buscamos los datos reales en Supabase al abrir la app
    const cargarDatosNube = async () => {
      const { data, error } = await supabase
        .from('gastos')
        .select('*')
        .order('created_at', { ascending: false }); // Traer los más recientes primero

      if (data && !error) {
        // Formateamos los datos de la base de datos al formato que usa nuestra app
        const gastosFormateados = data.map((gastoDb) => ({
          id: gastoDb.id,
          monto: gastoDb.monto_gasto,
          categoria: gastoDb.categoria,
          fecha: new Date(gastoDb.created_at).toLocaleDateString('es-MX'),
          foto: gastoDb.foto_base64
        }));
        setHistorialGastos(gastosFormateados);
      } else {
        console.error("Error al cargar de Supabase:", error);
      }
    };

    // Solo cargamos si ya hay una obra creada
    if (nombreObra) {
      cargarDatosNube();
    }
  }, [nombreObra, presupuesto, historialGastos]); 
  
  const totalGastado = historialGastos.reduce((suma, gasto) => suma + gasto.monto, 0);

  // Funciones



  const crearNuevaObra = (nombre: string, monto: number) => {
    setNombreObra(nombre);
    setPresupuesto(monto);
    setHistorialGastos([]); // Empezamos con el historial vacío
    setPantallaActual('tablero');
  };

  const manejarNuevoGasto = async (monto: number, foto: string | null, categoria: string) => {
    const nuevoGasto = {
      id: Date.now(),
      monto: monto,
      categoria: categoria,
      fecha: new Date().toLocaleDateString('es-MX'),
      foto: foto
    };

    // 1. Guardamos en la pantalla del teléfono inmediatamente
    setHistorialGastos([nuevoGasto, ...historialGastos]); 
    setPantallaActual('tablero');

    // 2. Enviamos a la base de datos en la nube (en segundo plano)
    const { error } = await supabase.from('gastos').insert([
      {
        nombre_obra: nombreObra,
        presupuesto: presupuesto,
        monto_gasto: monto,
        categoria: categoria,
        foto_base64: foto
      }
    ]);

    if (error) {
      console.error("Error al guardar en la nube:", error);
      alert("Hubo un error al guardar en la nube.");
    } else {
      console.log("¡Gasto guardado exitosamente en Supabase!");
    }
  };

  const cerrarObra = () => {
    if(window.confirm("¿Seguro que quieres cerrar esta obra? Se borrarán los datos actuales.")) {
      setNombreObra('');
      setPresupuesto(0);
      setHistorialGastos([]);
      setPantallaActual('crear');
      localStorage.clear();
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto', backgroundColor: '#121212', color: 'white', minHeight: '100dvh', width: '100%', boxSizing: 'border-box' }}>
      
      {pantallaActual === 'crear' && (
        <CrearObra alCrear={crearNuevaObra} />
      )}

      {pantallaActual === 'tablero' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <button onClick={cerrarObra} style={{ background: 'none', border: 'none', color: '#f44336', fontSize: '12px', cursor: 'pointer' }}>Cerrar Obra</button>
          </div>
          <Tablero 
            nombreObra={nombreObra}
            presupuesto={presupuesto} 
            gastado={totalGastado} 
            historial={historialGastos}
            alRegistrarClick={() => setPantallaActual('registrar')} 
          />
        </>
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