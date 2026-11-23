import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import TituloPagina from '../components/TituloPagina'
import EnlaceRegresar from '../components/EnlaceRegresar'
import SeccionFormulario from '../components/SeccionFormulario'
import Campo from '../components/Campo'
import Boton from '../components/Boton'
import Aviso from '../components/Aviso'
import { CATEGORIAS, HORARIOS } from '../utils/formato'
import { enfocarPrimerError, requerido, soloErrores, telefonoValido } from '../utils/validar'

const ORDEN = ['titulo', 'sueldo', 'ubicacion', 'horario', 'categoria', 'descripcion', 'requisitos', 'prestaciones', 'telefono_contacto']

const VACIO = {
  titulo: '', sueldo: '', ubicacion: '', horario: '', categoria: '',
  descripcion: '', requisitos: '', prestaciones: '', canal: 'plataforma', telefono_contacto: '',
}

export default function PublicarVacante() {
  const { perfil } = useAuth()
  const navigate = useNavigate()
  const [datos, setDatos] = useState(VACIO)
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState(null)
  const [enviando, setEnviando] = useState(false)

  const cambiar = (e) => setDatos({ ...datos, [e.target.name]: e.target.value })
  const conTelefono = datos.canal === 'telefono'

  async function publicar(e) {
    e.preventDefault()
    setMensaje(null)
    const sueldo = Number(datos.sueldo)
    const nuevosErrores = soloErrores({
      titulo: requerido(datos.titulo, 'el nombre del puesto'),
      sueldo: !datos.sueldo ? 'Escribe el sueldo mensual.' : (!(sueldo > 0) ? 'El sueldo debe ser mayor a 0.' : null),
      ubicacion: requerido(datos.ubicacion, 'la ubicación'),
      horario: datos.horario ? null : 'Elige un horario.',
      categoria: datos.categoria ? null : 'Elige el tipo de empleo.',
      descripcion: requerido(datos.descripcion, 'la descripción del puesto'),
      requisitos: requerido(datos.requisitos, 'los requisitos'),
      prestaciones: requerido(datos.prestaciones, 'las prestaciones'),
      telefono_contacto: conTelefono ? telefonoValido(datos.telefono_contacto) : null,
    })
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length) {
      enfocarPrimerError(nuevosErrores, ORDEN)
      return
    }

    setEnviando(true)
    const { error } = await supabase.from('vacantes').insert({
      empresa_id: perfil.id,
      titulo: datos.titulo.trim(),
      sueldo,
      ubicacion: datos.ubicacion.trim(),
      horario: datos.horario,
      categoria: datos.categoria,
      descripcion: datos.descripcion.trim(),
      requisitos: datos.requisitos.trim(),
      prestaciones: datos.prestaciones.trim(),
      telefono_contacto: conTelefono ? datos.telefono_contacto.replace(/\D/g, '') : null,
    })
    setEnviando(false)

    if (error) {
      setMensaje('No pudimos publicar la vacante. Revisa los datos e intenta de nuevo.')
      return
    }
    navigate('/empresa/vacantes', { state: { publicada: datos.titulo.trim() } })
  }

  const props = (id) => ({ id, value: datos[id], onChange: cambiar, error: errores[id] })

  return (
    <div className="contenedor contenedor--medio">
      <EnlaceRegresar to="/empresa/vacantes">Regresar a mis vacantes</EnlaceRegresar>
      <TituloPagina
        titulo="Publicar vacante"
        descripcion="Todos los campos se piden. Usa palabras sencillas: las personas que lo leerán son adultas mayores."
      />

      <form className="registro__formulario" onSubmit={publicar} noValidate>
        {Object.keys(errores).length > 0 && <Aviso tipo="error" titulo="Revisa los campos marcados" />}

        <SeccionFormulario numero={1} id="parte-empleo" titulo="Datos del empleo">
          <div className="fila-campos">
            <Campo {...props('titulo')} etiqueta="Nombre del puesto" ayuda="Ejemplo: Recepción de almacén." />
            <Campo {...props('sueldo')} etiqueta="Sueldo mensual (MXN)" ayuda="Solo el número, sin signo de pesos." type="number" inputMode="numeric" min="1" />
            <Campo {...props('ubicacion')} etiqueta="Ubicación de la vacante" ayuda="Colonia y municipio." className="fila-campos__completo" />
            <Campo {...props('horario')} como="select" etiqueta="Horario" opciones={HORARIOS} />
            <Campo {...props('categoria')} como="select" etiqueta="Tipo de empleo" opciones={CATEGORIAS} />
          </div>
        </SeccionFormulario>

        <SeccionFormulario numero={2} id="parte-descripcion" titulo="Descripción del puesto">
          <Campo {...props('descripcion')} como="textarea" rows={4} etiqueta="¿Qué hará la persona?" />
          <div className="fila-campos">
            <Campo {...props('requisitos')} como="textarea" rows={4} etiqueta="Requisitos" ayuda="Escribe uno por renglón." />
            <Campo {...props('prestaciones')} como="textarea" rows={4} etiqueta="Prestaciones" ayuda="Escribe una por renglón." />
          </div>
        </SeccionFormulario>

        <SeccionFormulario numero={3} id="parte-canal" titulo="¿Cómo quieres recibir postulaciones?">
          <fieldset className="grupo-opciones grupo-opciones--2">
            <legend className="solo-lector">Canal de postulación</legend>
            <label className="opcion">
              <input className="control-radio" type="radio" name="canal" value="plataforma" checked={!conTelefono} onChange={cambiar} />
              <span className="opcion__texto">
                <span className="opcion__titulo">Solo por la plataforma</span>
                <span className="opcion__detalle">No se muestra ningún teléfono</span>
              </span>
            </label>
            <label className="opcion">
              <input className="control-radio" type="radio" name="canal" value="telefono" checked={conTelefono} onChange={cambiar} />
              <span className="opcion__texto">
                <span className="opcion__titulo">Plataforma y teléfono</span>
                <span className="opcion__detalle">Se muestra el botón «Llamar»</span>
              </span>
            </label>
          </fieldset>
          {conTelefono && (
            <Campo
              {...props('telefono_contacto')}
              etiqueta="Número para recibir llamadas"
              ayuda="10 dígitos. Se mostrará en la vacante."
              type="tel"
              inputMode="numeric"
            />
          )}
        </SeccionFormulario>

        {mensaje && <Aviso tipo="error" titulo={mensaje} />}

        <div className="grupo-botones grupo-botones--derecha">
          <Boton to="/empresa/vacantes" variante="secundario">Cancelar</Boton>
          <Boton type="submit" disabled={enviando}>{enviando ? 'Publicando…' : 'Publicar vacante'}</Boton>
        </div>
      </form>
    </div>
  )
}
