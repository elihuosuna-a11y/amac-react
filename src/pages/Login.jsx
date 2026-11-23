import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { inicioSegunRol, useAuth } from '../context/AuthContext'
import TituloPagina from '../components/TituloPagina'
import Campo from '../components/Campo'
import Boton from '../components/Boton'
import Aviso from '../components/Aviso'
import { TELEFONO_AMAC, TELEFONO_AMAC_HREF } from '../utils/formato'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { perfil, cargando: cargandoSesion } = useAuth()
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [verContrasena, setVerContrasena] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)

  const desde = location.state?.desde

  useEffect(() => {
    if (!cargandoSesion && perfil) navigate(desde || inicioSegunRol(perfil.rol), { replace: true })
  }, [cargandoSesion, perfil, desde, navigate])

  async function entrar(e) {
    e.preventDefault()
    setMensaje('')
    if (!correo.trim() || !contrasena) {
      setMensaje('Escribe tu correo y tu contraseña.')
      return
    }
    setEnviando(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo.trim(),
      password: contrasena,
    })
    if (error) {
      setMensaje('Correo o contraseña incorrectos.')
      setEnviando(false)
      return
    }
    const { data: p } = await supabase.from('perfiles').select('rol').eq('id', data.user.id).single()
    navigate(desde || inicioSegunRol(p?.rol), { replace: true })
  }

  return (
    <div className="acceso">
      <section className="acceso__marca fondo-oscuro" aria-label="Sobre AMAC">
        <p className="acceso__lema">Envejecer es <strong>vivir.</strong></p>
        <p>La bolsa de trabajo de AMAC para personas adultas mayores en Nuevo León.</p>
        <p>
          ¿Necesitas ayuda para entrar?<br />
          <a href={TELEFONO_AMAC_HREF}>Llama a AMAC: {TELEFONO_AMAC}</a>
        </p>
      </section>

      <div className="acceso__contenido">
        <div className="contenedor acceso__formulario pila">
          <TituloPagina titulo="Iniciar sesión" descripcion="Entra para postularte o publicar vacantes." />

          <form className="pila" onSubmit={entrar} noValidate>
            {mensaje && <Aviso tipo="error" titulo={mensaje} />}

            <Campo
              id="correo"
              etiqueta="Correo electrónico"
              type="email"
              autoComplete="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />

            <div className="campo-con-boton">
              <Campo
                id="contrasena"
                etiqueta="Contraseña"
                type={verContrasena ? 'text' : 'password'}
                autoComplete="current-password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
              <Boton
                variante="secundario"
                aria-controls="contrasena"
                aria-pressed={verContrasena}
                onClick={() => setVerContrasena(!verContrasena)}
              >
                {verContrasena ? 'Ocultar' : 'Mostrar'}
              </Boton>
            </div>

            <p>¿Olvidaste tu contraseña? Llama a AMAC al <a href={TELEFONO_AMAC_HREF}>{TELEFONO_AMAC}</a>.</p>

            <Boton type="submit" bloque disabled={enviando}>
              {enviando ? 'Entrando…' : 'Entrar'}
            </Boton>
          </form>

          <p className="separador-texto">¿No tienes cuenta?</p>
          <div className="grupo-botones">
            <Boton to="/registro" variante="secundario">Busco empleo</Boton>
            <Boton to="/registro-empresa" variante="secundario">Soy una empresa</Boton>
          </div>
          <p><Link to="/">Ver vacantes sin iniciar sesión</Link></p>
        </div>
      </div>
    </div>
  )
}
