const CLASES = {
  'Enviada': 'enviada',
  'En revisión': 'revision',
  'Aceptada': 'aceptada',
  'Rechazada': 'rechazada',
  'Cancelada': 'cancelada',
  activa: 'activa',
  pausada: 'pausada',
  cerrada: 'cerrada',
}

const TEXTOS = { activa: 'Activa', pausada: 'Pausada', cerrada: 'Cerrada' }

export default function EtiquetaEstatus({ estatus }) {
  return (
    <span className={`estatus estatus--${CLASES[estatus] || 'enviada'}`}>
      {TEXTOS[estatus] || estatus}
    </span>
  )
}
