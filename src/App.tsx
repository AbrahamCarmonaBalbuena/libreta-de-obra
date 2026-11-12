// src/App.tsx
import { useState, useEffect } from 'react';
import type { Session } from '@supabase/supabase-js';
import Tablero from './components/Tablero';
import RegistrarGasto from './components/RegistrarGasto';
import CrearObra from './components/CrearObra';
import Login from './components/Login';
import { supabase } from './supabase';

document.body.style.backgroundColor = '#121212';

function App() {
  // --- 1. Estados de Autenticación ---
  const [session, setSession] = useState<Session | null>(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);

  // --- 2. Estados de la Obra ---
  const [nombreObra, setNombreObra] = useState(() => localStorage.getItem('nombreObra') || '');
  const [presupuesto, setPresupuesto] = useState(() => Number(localStorage.getItem('presupuesto')) || 0);
  const [historialGastos, setHistorialGastos] = useState<any[]>(() => {
    const guardado = localStorage.getItem('historial');
    return guardado ? JSON.parse(guardado) : [];
  });
  
  const [pantallaActual, setPantallaActual] = useState(nombreObra ? 'tablero' : 'crear');

  // --- 3. Efecto para escuchar la sesión de Supabase ---
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

  // --- 4. Efecto para guardar SOLO en el teléfono (LocalStorage) ---
  useEffect(() => {
    localStorage.setItem('nombreObra', nombreObra);
    localStorage.setItem('presupuesto', presupuesto.toString());
    localStorage.setItem('historial', JSON.stringify(historialGastos));
  }, [nombreObra, presupuesto, historialGastos]);

  // --- 5. Efecto para cargar de Supabase (solo si hay sesión y obra) ---
  useEffect(() => {
    if (!nombreObra || !session) return;

    let cancelado = false;
    const cargarDatosNube = async () => {
      // Filtramos por el nombre de la obra para no mezclar proyectos
      const { data, error } = await supabase
        .from('gastos')
        .select('*')
        .eq('nombre_obra', nombreObra) 
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
  }, [nombreObra, session]); 

  const totalGastado = historialGastos.reduce((suma, gasto) => suma + gasto.monto, 0);

  // --- 6. Funciones de la app ---
  const crearNuevaObra = (nombre: string, monto: number) => {
    setNombreObra(nombre);
    setPresupuesto(monto);
    setHistorialGastos([]); 
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

    // Guardamos en la pantalla inmediatamente
    setHistorialGastos([nuevoGasto, ...historialGastos]); 
    setPantallaActual('tablero');

    // Enviamos a Supabase
    const { error } = await supabase.from('gastos').insert([
      {
        nombre_obra: nombreObra,
        presupuesto: presupuesto,
        monto_gasto: monto,
        categoria: categoria,
        foto_base64: foto
        // user_id se llena solo gracias al default auth.uid() en Supabase
      }
    ]);

    if (error) {
      console.error("Error al guardar en la nube:", error);
      alert("Hubo un error al guardar en la nube.");
    }
  };

  const cerrarObra = () => {
    if(window.confirm("¿Seguro que quieres cerrar esta obra? Se borrarán los datos actuales de este teléfono.")) {
      setNombreObra('');
      setPresupuesto(0);
      setHistorialGastos([]);
      setPantallaActual('crear');
      localStorage.clear();
    }
  };

  const cerrarSesion = async () => {
    if(window.confirm("¿Seguro que quieres cerrar sesión?")) {
      await supabase.auth.signOut();
      // Limpiamos el estado y el teléfono al salir
      setNombreObra('');
      setPresupuesto(0);
      setHistorialGastos([]);
      setPantallaActual('crear');
      localStorage.clear();
    }
  };

  // --- 7. Renderizado ---

  // Mientras Supabase verifica si hay sesión, mostramos un mensaje
  if (cargandoAuth) {
    return (
      <div style={{ color: 'white', textAlign: 'center', paddingTop: '50vh', fontFamily: 'sans-serif' }}>
        Cargando...
      </div>
    );
  }

  // Si no hay sesión, mostramos la pantalla de Login
  if (!session) {
    return (
      <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto', backgroundColor: '#121212', color: 'white', minHeight: '100dvh', boxSizing: 'border-box' }}>
        <Login />
      </div>
    );
  }

  // Si hay sesión, mostramos la app normal
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '400px', margin: '0 auto', backgroundColor: '#121212', color: 'white', minHeight: '100dvh', width: '100%', boxSizing: 'border-box' }}>
      
      {pantallaActual === 'crear' && (
        <CrearObra alCrear={crearNuevaObra} />
      )}

      {pantallaActual === 'tablero' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <button onClick={cerrarObra} style={{ background: 'none', border: 'none', color: '#f44336', fontSize: '12px', cursor: 'pointer' }}>
              Cerrar Obra
            </button>
            <button onClick={cerrarSesion} style={{ background: 'none', border: 'none', color: '#aaaaaa', fontSize: '12px', cursor: 'pointer' }}>
              Cerrar Sesión
            </button>
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