import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'
import BotonAyuda from './BotonAyuda'
import Icono from './Icono'

const MENUS = {
  publico: [
    { to: '/', texto: 'Vacantes', icono: 'maletin' },
    { to: '/conoce-amac', texto: 'Conoce a AMAC', icono: 'info' },
    { to: '/login', texto: 'Entrar', icono: 'usuario', solo: 'movil' },
  ],
  candidato: [
    { to: '/', texto: 'Vacantes', icono: 'maletin' },
    { to: '/mis-solicitudes', texto: 'Mis solicitudes', corto: 'Solicitudes', icono: 'lista' },
    { to: '/cuenta', texto: 'Mi cuenta', icono: 'usuario', solo: 'movil' },
  ],
  empresa: [
    { to: '/empresa/vacantes', texto: 'Mis vacantes', corto: 'Vacantes', icono: 'maletin' },
    { to: '/empresa/solicitudes', texto: 'Solicitudes recibidas', corto: 'Solicitudes', icono: 'lista' },
    { to: '/cuenta', texto: 'Mi cuenta', icono: 'usuario', solo: 'movil' },
  ],
  admin: [
    { to: '/', texto: 'Vacantes', icono: 'maletin' },
    { to: '/admin', texto: 'Aprobar candidatos', corto: 'Candidatos', icono: 'check' },
    { to: '/cuenta', texto: 'Mi cuenta', icono: 'usuario', solo: 'movil' },
  ],
}

function ElementoMenu({ item }) {
  const clase = item.solo === 'movil' ? 'menu__solo-movil' : item.solo === 'escritorio' ? 'menu__solo-escritorio' : undefined
  return (
    <li className={clase}>
      <NavLink className="menu__enlace" to={item.to} end={item.to === '/'}>
        <Icono nombre={item.icono} tamano={24} className="menu__icono" />
        {item.corto ? (
          <>
            <span className="menu__texto-largo">{item.texto}</span>
            <span className="menu__texto-corto">{item.corto}</span>
          </>
        ) : (
          item.texto
        )}
      </NavLink>
    </li>
  )
}

export default function Encabezado() {
  const { perfil, cargando, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const menu = MENUS[perfil?.rol] || MENUS.publico

  async function salir() {
    await cerrarSesion()
    navigate('/')
  }

  return (
    <header className="encabezado">
      <div className="encabezado__interior">
        <Logo />

        <nav className="menu" aria-label="Navegación principal">
          <ul className="menu__lista">
            {menu.map((item) => <ElementoMenu key={item.to} item={item} />)}
          </ul>
        </nav>

        <div className="encabezado__acciones">
          <BotonAyuda />
          {!cargando && perfil && (
            <>
              <Link className="cuenta" to="/cuenta">
                <Icono nombre={perfil.rol === 'empresa' ? 'edificio' : 'usuario'} />
                <span className="cuenta__nombre">{perfil.nombre}</span>
                <span className="solo-lector">, mi cuenta</span>
              </Link>
              <button className="boton boton--secundario boton--chico solo-escritorio-ancho" type="button" onClick={salir}>
                Cerrar sesión
              </button>
            </>
          )}
          {!cargando && !perfil && (
            <Link className="boton boton--secundario boton--chico solo-escritorio" to="/login">
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
