// src/App.tsx
import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import Tablero from './components/Tablero';
import RegistrarGasto from './components/RegistrarGasto';
import CrearObra from './components/CrearObra';
import MisObras from './components/MisObras'; // <-- NUEVO COMPONENTE
import Login from './components/Login';
import { supabase } from './supabase';

document.body.style.backgroundColor = '#121212';

// Tipo para el proyecto actual
interface Proyecto {
  id: string;
  nombre: string;
  presupuesto_total: number;
}

function App() {
  // --- Autenticación ---
  const [session, setSession] = useState<Session | null>(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);

  // --- Estados de la Obra ---
  const [proyectoActual, setProyectoActual] = useState<Proyecto | null>(null); // <-- ID y datos del proyecto
  const [historialGastos, setHistorialGastos] = useState<any[]>([]);
  const [pantallaActual, setPantallaActual] = useState('mis-obras'); // <-- Ahora inicia aquí

  // 1. Escuchar la sesión
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCargandoAuth(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSession(nuevaSesion);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  // 2. Cargar de la nube solo cuando hay sesión y proyecto seleccionado
  useEffect(() => {
    if (!proyectoActual || !session) return;

    let cancelado = false;
    const cargarDatosNube = async () => {
      // AHORA FILTRAMOS POR proyecto_id
      const { data, error } = await supabase
        .from('gastos')
        .select('*')
        .eq('proyecto_id', proyectoActual.id) 
        .order('created_at', { ascending: false });

      if (cancelado) return;

      if (data && !error) {
        setHistorialGastos(data.map((gastoDb) => ({
          id: gastoDb.id,
          monto: gastoDb.monto_gasto,
          categoria: gastoDb.categoria,
          fecha: new Date(gastoDb.created_at).toLocaleDateString('es-MX'),
          foto: gastoDb.foto_base64
        })));
      } else if (error) {
        console.error("Error al cargar de Supabase:", error);
      }
    };

    cargarDatosNube();
    return () => { cancelado = true; };
  }, [proyectoActual, session]); 

  const totalGastado = historialGastos.reduce((suma, gasto) => suma + gasto.monto, 0);

  // --- Funciones ---

  const seleccionarObra = (proyecto: Proyecto) => {
    setProyectoActual(proyecto);
    setPantallaActual('tablero');
  };

  const crearNuevaObra = (proyecto: Proyecto) => {
    setProyectoActual(proyecto);
    setHistorialGastos([]);
    setPantallaActual('tablero');
  };

  const manejarNuevoGasto = async (monto: number, foto: string | null, categoria: string) => {
    if (!proyectoActual) return;

    const nuevoGasto = {
      id: Date.now(),
      monto: monto,
      categoria: categoria,
      fecha: new Date().toLocaleDateString('es-MX'),
      foto: foto
    };

    setHistorialGastos([nuevoGasto, ...historialGastos]); 
    setPantallaActual('tablero');

    // AHORA ENVIAMOS proyecto_id EN LUGAR DE nombre_obra y presupuesto
    const { error } = await supabase.from('gastos').insert([
      {
        proyecto_id: proyectoActual.id, // <-- ID del proyecto
        monto_gasto: monto,
        categoria: categoria,
        foto_base64: foto
      }
    ]);

    if (error) {
      console.error("Error al guardar en la nube:", error);
      alert("Hubo un error al guardar en la nube.");
    }
  };

  const cerrarSesion = async () => {
    if(window.confirm("¿Seguro que quieres cerrar sesión?")) {
      await supabase.auth.signOut();
      setProyectoActual(null);
      setHistorialGastos([]);
      setPantallaActual('mis-obras');
      localStorage.clear();
    }
  };

  const volverAMisObras = () => {
    setProyectoActual(null);
    setHistorialGastos([]);
    setPantallaActual('mis-obras');
  }

  // --- Renderizado ---
  if (cargandoAuth) {
    return <div style={{ color: 'white', textAlign: 'center', paddingTop: '50vh', fontFamily: 'sans-serif' }}>Cargando...</div>;
  }

  if (!session) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto', backgroundColor: '#121212', color: 'white', minHeight: '100dvh', boxSizing: 'border-box' }}>
        <Login />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto', backgroundColor: '#121212', color: 'white', minHeight: '100dvh', width: '100%', boxSizing: 'border-box' }}>
      
      {/* NUEVA PANTALLA: Lista de Obras */}
      {pantallaActual === 'mis-obras' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
            <button onClick={cerrarSesion} style={{ background: 'none', border: 'none', color: '#aaaaaa', fontSize: '12px', cursor: 'pointer' }}>
              Cerrar Sesión
            </button>
          </div>
          <MisObras 
            alSeleccionarObra={seleccionarObra} 
            alCrearNueva={() => setPantallaActual('crear')} 
          />
        </>
      )}

      {/* PANTALLA: Crear Obra */}
      {pantallaActual === 'crear' && (
        <CrearObra alCrear={crearNuevaObra} alCancelar={volverAMisObras} />
      )}

      {/* PANTALLA: Tablero de la Obra seleccionada */}
      {pantallaActual === 'tablero' && proyectoActual && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <button onClick={volverAMisObras} style={{ background: 'none', border: 'none', color: '#2196f3', fontSize: '12px', cursor: 'pointer' }}>
              ← Mis Obras
            </button>
            <button onClick={cerrarSesion} style={{ background: 'none', border: 'none', color: '#aaaaaa', fontSize: '12px', cursor: 'pointer' }}>
              Cerrar Sesión
            </button>
          </div>
          <Tablero 
            nombreObra={proyectoActual.nombre}
            presupuesto={proyectoActual.presupuesto_total} 
            gastado={totalGastado} 
            historial={historialGastos}
            alRegistrarClick={() => setPantallaActual('registrar')} 
          />
        </>
      )}

      {/* PANTALLA: Registrar Gasto */}
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