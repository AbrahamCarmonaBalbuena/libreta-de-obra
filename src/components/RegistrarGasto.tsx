// src/components/RegistrarGasto.tsx
import { useState } from 'react';

interface RegistrarGastoProps {
  alVolver: () => void;
  alGuardar: (monto: number, foto: string | null, categoria: string) => void; 
}

export default function RegistrarGasto({ alVolver, alGuardar }: RegistrarGastoProps) {
  const [monto, setMonto] = useState('');
  const [foto, setFoto] = useState<string | null>(null);
  const [categoria, setCategoria] = useState('Material');

  // NUEVA FUNCIÓN: Comprime la imagen antes de guardarla
  const manejarFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    const lector = new FileReader();
    lector.onloadend = () => {
      const img = new Image();
      img.src = lector.result as string;
      
      img.onload = () => {
        // Creamos un lienzo (canvas) para redibujar la imagen más pequeña
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600; // Ancho máximo en píxeles
        const scale = MAX_WIDTH / img.width;
        
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          // Convertimos la imagen a un texto comprimido (JPEG al 40% de calidad)
          const fotoComprimida = canvas.toDataURL('image/jpeg', 0.4);
          setFoto(fotoComprimida);
        }
      };
    };
    lector.readAsDataURL(archivo);
  };

  const handleGuardar = () => {
    const montoNumerico = Number(monto);
    if (montoNumerico > 0) {
      alGuardar(montoNumerico, foto, categoria); 
    } else {
      alert("Por favor, ingresa un monto válido");
    }
  };

  const btnStyle = { flex: 1, padding: '15px', border: 'none', borderRadius: '8px', cursor: 'pointer', color: 'white' };

  return (
    <div>
      <button onClick={alVolver} style={{ background: 'none', border: 'none', color: '#2196f3', fontSize: '16px', cursor: 'pointer', padding: 0, marginBottom: '20px' }}>
        ← Volver
      </button>
      
      <h2>¿Cuánto gastaste?</h2>
      
      <input 
        type="number" 
        placeholder="Ej. 1500" 
        value={monto}
        onChange={(e) => setMonto(e.target.value)}
        style={{ width: '100%', padding: '15px', fontSize: '24px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#222', color: 'white', marginBottom: '20px', boxSizing: 'border-box' }} 
      />

      <h3>Selecciona categoría:</h3>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button 
          onClick={() => setCategoria('Material')}
          style={{ ...btnStyle, backgroundColor: categoria === 'Material' ? '#2196f3' : '#333' }}
        >
          🧱 Material
        </button>
        <button 
          onClick={() => setCategoria('Mano de obra')}
          style={{ ...btnStyle, backgroundColor: categoria === 'Mano de obra' ? '#2196f3' : '#333' }}
        >
          👷 Mano de obra
        </button>
      </div>

      <h3>Ticket o Factura (Opcional)</h3>
      {!foto ? (
        <label style={{ display: 'block', textAlign: 'center', padding: '20px', border: '2px dashed #555', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px', color: '#aaa' }}>
          📷 Tomar foto del ticket
          <input type="file" accept="image/*" capture="environment" onChange={manejarFoto} style={{ display: 'none' }} />
        </label>
      ) : (
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <img src={foto} alt="Ticket" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }} />
          <button onClick={() => setFoto(null)} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer' }}>Volver a tomar</button>
        </div>
      )}

      <button 
        onClick={handleGuardar}
        style={{ width: '100%', padding: '15px', fontSize: '18px', backgroundColor: '#4caf50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
      >
        Guardar Gasto
      </button>
    </div>
  );
}