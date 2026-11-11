interface TableroProps {
  nombreObra: string;  
  presupuesto: number;
  gastado: number;
  historial: any[];
  alRegistrarClick: () => void;
}

export default function Tablero({ nombreObra, presupuesto, gastado, historial, alRegistrarClick }: TableroProps) {
  const restante = presupuesto - gastado;
  const porcentajeGastado = presupuesto > 0 ? (gastado / presupuesto) * 100 : 0;

  const formatearDinero = (cantidad: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(cantidad);
  };
  const enviarWhatsApp = () => {
    const texto = `*Reporte de Obra: ${nombreObra}*%0A%0A` +
                  `💰 Presupuesto: ${formatearDinero(presupuesto)}%0A` +
                  `💸 Gastado: ${formatearDinero(gastado)}%0A` +
                  `✅ Restante: ${formatearDinero(restante)}%0A%0A` +
                  `_Enviado desde Libreta de Obra_`;
    // Abre WhatsApp con el mensaje precargado
    window.open(`https://wa.me/?text=${texto}`, '_blank');
  };

  return (
    <>
      <h2>{nombreObra}</h2>
      
      {/* Barra de progreso */}
      <div style={{ width: '100%', backgroundColor: '#333333', height: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <div style={{ width: `${porcentajeGastado}%`, backgroundColor: porcentajeGastado > 90 ? '#f44336' : '#4caf50', height: '100%', borderRadius: '10px' }}></div>
      </div>

      {/* Números del Tablero */}
      <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'center', marginBottom: '30px' }}>
        <div>
          <p style={{ margin: 0, fontSize: '12px', color: '#aaaaaa' }}>Presupuesto</p>
          <strong style={{ fontSize: '18px' }}>{formatearDinero(presupuesto)}</strong>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '12px', color: '#aaaaaa' }}>Gastado</p>
          <strong style={{ fontSize: '18px', color: '#f44336' }}>{formatearDinero(gastado)}</strong>
        </div>
        <div>
          <p style={{ margin: 0, fontSize: '12px', color: '#aaaaaa' }}>Restante</p>
          <strong style={{ fontSize: '18px', color: restante < 0 ? '#f44336' : '#4caf50' }}>
            {formatearDinero(restante)}
          </strong>
        </div>
      </div>

      {/* Botón para ir al formulario */}
      <button 
        onClick={alRegistrarClick}
        style={{ width: '100%', padding: '15px', fontSize: '18px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '30px' }}
      >
        Registrar gasto
      </button>

      <button 
        onClick={enviarWhatsApp}
        style={{ width: '100%', padding: '15px', fontSize: '18px', backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
      >
        <span>💬</span> Enviar reporte por WhatsApp
      </button>

      {/* Sección de Historial */}
      <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>Últimos gastos</h3>
      
      {historial.length === 0 ? (
        <p style={{ color: '#aaaaaa', textAlign: 'center' }}>Aún no hay gastos registrados.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {historial.map((gasto) => (
            <div key={gasto.id} style={{ backgroundColor: '#222', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '16px' }}>{formatearDinero(gasto.monto)}</strong>
                <p style={{ margin: 0, fontSize: '12px', color: '#aaaaaa' }}>
                  {gasto.categoria} • {gasto.fecha}
                </p>
              </div>
              {gasto.foto && (
                <img src={gasto.foto} alt="Ticket" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}