import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import TituloPagina from '../components/TituloPagina'
import SeccionFormulario from '../components/SeccionFormulario'
import Campo from '../components/Campo'
import Casilla from '../components/Casilla'
import Boton from '../components/Boton'
import Aviso from '../components/Aviso'
import { GIROS } from '../utils/formato'
import {
  contrasenaValida, correoValido, enfocarPrimerError, mensajeAuth,
  requerido, soloErrores, telefonoValido,
} from '../utils/validar'

const ORDEN = ['nombre', 'giro', 'telefono', 'correo', 'contrasena', 'contrasena2', 'terminos']

export default function RegistroEmpresa() {
  const navigate = useNavigate()
  const [datos, setDatos] = useState({
    nombre: '', giro: '', telefono: '', correo: '', contrasena: '', contrasena2: '', terminos: false,
  })
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const cambiar = (e) => {
    const { name, value, type, checked } = e.target
    setDatos({ ...datos, [name]: type === 'checkbox' ? checked : value })
  }

  async function registrar(e) {
    e.preventDefault()
    setMensaje(null)
    const nuevosErrores = soloErrores({
      nombre: requerido(datos.nombre, 'el nombre de la empresa'),
      giro: datos.giro ? null : 'Elige el giro de la empresa.',
      telefono: telefonoValido(datos.telefono),
      correo: correoValido(datos.correo),
      contrasena: contrasenaValida(datos.contrasena),
      contrasena2: datos.contrasena2 !== datos.contrasena ? 'Las contraseñas no coinciden.' : null,
      terminos: datos.terminos ? null : 'Debes aceptar los términos y el aviso de privacidad.',
    })
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length) {
      enfocarPrimerError(nuevosErrores, ORDEN)
      return
    }

    setEnviando(true)
    const { data, error } = await supabase.auth.signUp({
      email: datos.correo.trim(),
      password: datos.contrasena,
      options: {
        data: {
          rol: 'empresa',
          nombre: datos.nombre.trim(),
          giro: datos.giro,
          telefono: datos.telefono.replace(/\D/g, ''),
        },
      },
    })
    setEnviando(false)

    if (error) {
      setMensaje({ tipo: 'error', titulo: mensajeAuth(error) })
      return
    }
    if (data.session) navigate('/empresa/vacantes', { state: { bienvenida: true } })
    else setMensaje({ tipo: 'exito', titulo: 'Tu cuenta fue creada', texto: 'Te enviamos un correo para confirmarla.' })
  }

  const props = (id) => ({ id, value: datos[id], onChange: cambiar, error: errores[id] })

  return (
    <div className="contenedor contenedor--medio">
      <TituloPagina
        titulo="Registra tu empresa"
        descripcion="Publica vacantes para personas adultas mayores. Todos los campos se piden."
      />

      <form className="registro__formulario" onSubmit={registrar} noValidate>
        {Object.keys(errores).length > 0 && (
          <Aviso tipo="error" titulo="Revisa los campos marcados" />
        )}

        <SeccionFormulario numero={1} id="parte-empresa" titulo="Datos de la empresa">
          <div className="fila-campos">
            <Campo {...props('nombre')} etiqueta="Nombre de la empresa" autoComplete="organization" />
            <Campo {...props('giro')} como="select" etiqueta="Giro" opciones={GIROS} />
            <Campo {...props('telefono')} etiqueta="Teléfono de la empresa" ayuda="10 dígitos." type="tel" autoComplete="tel-national" inputMode="numeric" />
            <Campo {...props('correo')} etiqueta="Correo de la empresa" type="email" autoComplete="email" />
          </div>
        </SeccionFormulario>

        <SeccionFormulario numero={2} id="parte-contrasena" titulo="Contraseña">
          <div className="fila-campos">
            <Campo {...props('contrasena')} etiqueta="Crea una contraseña" ayuda="Mínimo 8 letras o números." type="password" autoComplete="new-password" />
            <Campo {...props('contrasena2')} etiqueta="Escribe otra vez la contraseña" type="password" autoComplete="new-password" />
          </div>
        </SeccionFormulario>

        <SeccionFormulario numero={3} id="parte-terminos" titulo="Acepta los términos">
          <Casilla id="terminos" checked={datos.terminos} onChange={cambiar} error={errores.terminos}>
            Acepto los <Link to="/conoce-amac#terminos">Términos y condiciones</Link> y el{' '}
            <Link to="/conoce-amac#privacidad">Aviso de privacidad</Link>
          </Casilla>
        </SeccionFormulario>

        {mensaje && <Aviso tipo={mensaje.tipo} titulo={mensaje.titulo}>{mensaje.texto}</Aviso>}

        <div className="registro__enviar">
          <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
          <Boton type="submit" disabled={enviando}>{enviando ? 'Enviando…' : 'Registrar mi empresa'}</Boton>
        </div>
      </form>
    </div>
  )
}
