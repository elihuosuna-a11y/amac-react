import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import TituloPagina from '../components/TituloPagina'
import SeccionFormulario from '../components/SeccionFormulario'
import Campo from '../components/Campo'
import Casilla from '../components/Casilla'
import Boton from '../components/Boton'
import Aviso from '../components/Aviso'
import {
  contrasenaValida, correoValido, enfocarPrimerError, mensajeAuth,
  requerido, soloErrores, telefonoValido,
} from '../utils/validar'

const ORDEN = ['nombre', 'edad', 'telefono', 'colonia', 'experiencia', 'correo', 'contrasena', 'contrasena2', 'terminos']

const VACIO = {
  nombre: '', edad: '', telefono: '', colonia: '', experiencia: '',
  correo: '', contrasena: '', contrasena2: '', terminos: false,
}

export default function RegistroCandidato() {
  const navigate = useNavigate()
  const [datos, setDatos] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const cambiar = (e) => {
    const { name, value, type, checked } = e.target
    setDatos({ ...datos, [name]: type === 'checkbox' ? checked : value })
  }

  function validar() {
    const edad = Number(datos.edad)
    return soloErrores({
      nombre: requerido(datos.nombre, 'tu nombre completo'),
      edad: !datos.edad ? 'Escribe tu edad.'
        : (!Number.isInteger(edad) || edad < 18 || edad > 120) ? 'La edad debe ser un número entre 18 y 120.' : null,
      telefono: telefonoValido(datos.telefono),
      colonia: requerido(datos.colonia, 'tu colonia'),
      experiencia: requerido(datos.experiencia, 'tu experiencia (si no tienes, escribe «Sin experiencia»)'),
      correo: correoValido(datos.correo),
      contrasena: contrasenaValida(datos.contrasena),
      contrasena2: datos.contrasena2 !== datos.contrasena ? 'Las contraseñas no coinciden.' : null,
      terminos: datos.terminos ? null : 'Para crear tu cuenta debes aceptar los términos y el aviso de privacidad.',
    })
  }

  async function registrar(e) {
    e.preventDefault()
    setMensaje(null)
    const nuevosErrores = validar()
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
          rol: 'candidato',
          nombre: datos.nombre.trim(),
          telefono: datos.telefono.replace(/\D/g, ''),
          edad: datos.edad,
          colonia: datos.colonia.trim(),
          experiencia: datos.experiencia.trim(),
        },
      },
    })
    setEnviando(false)

    if (error) {
      setMensaje({ tipo: 'error', titulo: mensajeAuth(error) })
      return
    }
    if (data.session) {
      navigate('/cuenta', { state: { bienvenida: true } })
    } else {
      setMensaje({
        tipo: 'exito',
        titulo: 'Tu cuenta fue creada',
        texto: 'Te enviamos un correo para confirmarla. Después, AMAC revisará tu registro.',
      })
    }
  }

  const props = (id) => ({ id, value: datos[id], onChange: cambiar, error: errores[id] })

  return (
    <div className="contenedor contenedor--medio">
      <TituloPagina
        titulo="Crea tu cuenta para buscar empleo"
        descripcion="Son 4 partes. Todos los campos se piden. Si necesitas ayuda, llama a AMAC."
      />

      <form className="registro__formulario" onSubmit={registrar} noValidate>
        {Object.keys(errores).length > 0 && (
          <Aviso tipo="error" titulo="Revisa los campos marcados">
            Hay {Object.keys(errores).length} {Object.keys(errores).length === 1 ? 'dato' : 'datos'} por corregir.
          </Aviso>
        )}

        <SeccionFormulario numero={1} id="parte-datos" titulo="Tus datos personales">
          <div className="fila-campos">
            <Campo {...props('nombre')} etiqueta="Nombre completo" autoComplete="name" className="fila-campos__completo" />
            <Campo {...props('edad')} etiqueta="Edad" type="number" inputMode="numeric" min="18" max="120" />
            <Campo {...props('telefono')} etiqueta="Número de celular" ayuda="10 dígitos, sin espacios." type="tel" autoComplete="tel-national" inputMode="numeric" />
          </div>
        </SeccionFormulario>

        <SeccionFormulario numero={2} id="parte-experiencia" titulo="¿Dónde vives y qué sabes hacer?">
          <Campo {...props('colonia')} etiqueta="Colonia y municipio" ayuda="Por ejemplo: Col. Mitras Centro, Monterrey." />
          <Campo
            {...props('experiencia')}
            como="textarea"
            etiqueta="Tu experiencia"
            ayuda="Escribe tus trabajos anteriores y lo que sabes hacer. Ejemplo: «Encargada de tienda, 12 años. Manejo de caja»."
            rows={4}
          />
        </SeccionFormulario>

        <SeccionFormulario numero={3} id="parte-acceso" titulo="Tu correo y contraseña">
          <Campo {...props('correo')} etiqueta="Correo electrónico" type="email" autoComplete="email" />
          <div className="fila-campos">
            <Campo {...props('contrasena')} etiqueta="Crea una contraseña" ayuda="Mínimo 8 letras o números." type="password" autoComplete="new-password" />
            <Campo {...props('contrasena2')} etiqueta="Escribe otra vez la contraseña" type="password" autoComplete="new-password" />
          </div>
        </SeccionFormulario>

        <SeccionFormulario numero={4} id="parte-terminos" titulo="Acepta los términos">
          <Casilla id="terminos" checked={datos.terminos} onChange={cambiar} error={errores.terminos}>
            Acepto los <Link to="/conoce-amac#terminos">Términos y condiciones</Link> y el{' '}
            <Link to="/conoce-amac#privacidad">Aviso de privacidad</Link>
          </Casilla>
        </SeccionFormulario>

        <Aviso titulo="Después de crear tu cuenta">
          AMAC revisará tu registro. Mientras tanto puedes ver vacantes, pero todavía no postularte.
        </Aviso>

        {mensaje && <Aviso tipo={mensaje.tipo} titulo={mensaje.titulo}>{mensaje.texto}</Aviso>}

        <div className="registro__enviar">
          <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
          <Boton type="submit" disabled={enviando}>{enviando ? 'Creando tu cuenta…' : 'Crear mi cuenta'}</Boton>
        </div>
      </form>
    </div>
  )
}
