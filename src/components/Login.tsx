// src/components/Login.tsx
import { useState } from 'react';
import { supabase } from '../supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [esRegistro, setEsRegistro] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('');
    setCargando(true);

    if (esRegistro) {
      const { error } = await supabase.auth.signUp({ email, password });
      setMensaje(
        error
          ? error.message
          : 'Cuenta creada. Si la confirmación por correo está activa, revisa tu bandeja.'
      );
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setMensaje(error ? error.message : 'Entrando...');
    }

    setCargando(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '15px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '1px solid #444',
    backgroundColor: '#222',
    color: 'white',
    marginBottom: '15px',
    boxSizing: 'border-box',
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '80vh',
      }}
    >
      <h1 style={{ fontSize: '32px', marginBottom: '10px' }}>Libreta de Obra</h1>
      <p style={{ color: '#aaaaaa', marginBottom: '30px' }}>
        {esRegistro
          ? 'Crea tu cuenta para guardar tus obras.'
          : 'Inicia sesión para ver tus obras.'}
      </p>

      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        style={inputStyle}
      />

      <input
        type="password"
        placeholder="Contraseña (mín. 6 caracteres)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
        style={inputStyle}
      />

      <button
        type="submit"
        disabled={cargando}
        style={{
          width: '100%',
          padding: '15px',
          fontSize: '18px',
          backgroundColor: cargando ? '#555' : '#2196f3',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: cargando ? 'wait' : 'pointer',
          marginBottom: '15px',
        }}
      >
        {cargando ? 'Espera...' : esRegistro ? 'Crear cuenta' : 'Entrar'}
      </button>

      <button
        type="button"
        onClick={() => {
          setEsRegistro(!esRegistro);
          setMensaje('');
        }}
        style={{
          background: 'none',
          border: 'none',
          color: '#2196f3',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        {esRegistro ? 'Ya tengo cuenta, iniciar sesión' : 'No tengo cuenta, registrarme'}
      </button>

      {mensaje && (
        <p style={{ color: '#ffb74d', marginTop: '20px', textAlign: 'center' }}>{mensaje}</p>
      )}
    </form>
  );
}