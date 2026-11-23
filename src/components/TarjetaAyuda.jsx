import { TELEFONO_AMAC, TELEFONO_AMAC_HREF } from '../utils/formato'

export default function TarjetaAyuda({ titulo = '¿Necesitas ayuda?', texto, className = '' }) {
  return (
    <aside className={`tarjeta tarjeta--ayuda ${className}`.trim()} aria-label={titulo}>
      <h2>{titulo}</h2>
      <p>{texto || 'Llama a AMAC y una persona te ayuda a buscar o postularte.'}</p>
      <a className="telefono-destacado" href={TELEFONO_AMAC_HREF}>{TELEFONO_AMAC}</a>
    </aside>
  )
}
