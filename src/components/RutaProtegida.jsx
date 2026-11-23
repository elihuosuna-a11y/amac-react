import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Cargando from './Cargando'

export default function RutaProtegida({ rol, children }) {
  const { perfil, cargando } = useAuth()
  const location = useLocation()

  if (cargando) return <div className="contenedor"><Cargando /></div>
  if (!perfil) return <Navigate to="/login" replace state={{ desde: location.pathname }} />

  const permitidos = rol ? [].concat(rol) : null
  if (permitidos && !permitidos.includes(perfil.rol)) return <Navigate to="/" replace />

  return children
}
