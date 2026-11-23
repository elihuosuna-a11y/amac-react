import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import TituloPagina from '../components/TituloPagina'
import Boton from '../components/Boton'
import Aviso from '../components/Aviso'
import { formatoFecha, formatoTelefono } from '../utils/formato'

const ROLES = { candidato: 'Persona candidata', empresa: 'Empresa', admin: 'Administrador de AMAC' }

export default function MiCuenta() {
  const { sesion, perfil, recargarPerfil, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => { recargarPerfil() }, [recargarPerfil])

  async function salir() {
    await cerrarSesion()
    navigate('/')
  }

  return (
    <div className="contenedor contenedor--angosto pila">
      <TituloPagina titulo="Mi cuenta" descripcion={ROLES[perfil.rol]} />

      {location.state?.bienvenida && (
        <Aviso tipo="exito" titulo={`Tu cuenta fue creada, ${perfil.nombre}`}>
          Ya puedes ver las vacantes. AMAC revisará tu registro para que puedas postularte.
        </Aviso>
      )}

      {perfil.rol === 'candidato' && (
        perfil.aprobado
          ? <Aviso tipo="exito" titulo="Tu registro está aprobado">Ya puedes postularte a las vacantes.</Aviso>
          : <Aviso tipo="advertencia" titulo="Tu registro está en revisión">Cuando AMAC lo apruebe podrás postularte.</Aviso>
      )}

      <section className="tarjeta tarjeta--amplia" aria-label="Mis datos">
        <dl className="resumen">
          <div><dt>{perfil.rol === 'empresa' ? 'Empresa' : 'Nombre'}</dt><dd>{perfil.nombre}</dd></div>
          <div><dt>Correo</dt><dd>{sesion?.user.email}</dd></div>
          {perfil.telefono && <div><dt>Teléfono</dt><dd>{formatoTelefono(perfil.telefono)}</dd></div>}
          {perfil.edad && <div><dt>Edad</dt><dd>{perfil.edad} años</dd></div>}
          {perfil.colonia && <div><dt>Colonia</dt><dd>{perfil.colonia}</dd></div>}
          {perfil.giro && <div><dt>Giro</dt><dd>{perfil.giro}</dd></div>}
          <div><dt>Cuenta creada el</dt><dd>{formatoFecha(perfil.creado_en)}</dd></div>
        </dl>
      </section>

      <div className="grupo-botones">
        {perfil.rol === 'candidato' && <Boton to="/mis-solicitudes" variante="secundario">Ver mis solicitudes</Boton>}
        {perfil.rol === 'empresa' && <Boton to="/empresa/vacantes" variante="secundario">Ver mis vacantes</Boton>}
        <Boton onClick={salir}>Cerrar sesión</Boton>
      </div>
    </div>
  )
}
