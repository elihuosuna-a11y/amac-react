import { Link } from 'react-router-dom'
import Icono from './Icono'

export default function EnlaceRegresar({ to, children }) {
  return (
    <Link className="enlace-regresar" to={to}>
      <Icono nombre="regresar" tamano={24} />
      {children}
    </Link>
  )
}
