import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import TituloPagina from '../components/TituloPagina'
import EtiquetaEstatus from '../components/EtiquetaEstatus'
import Boton from '../components/Boton'
import Aviso from '../components/Aviso'
import Cargando from '../components/Cargando'
import { formatoFecha } from '../utils/formato'

const SE_PUEDE_CANCELAR = ['Enviada', 'En revisión']

function Accion({ solicitud, confirmando, setConfirmando, cancelar }) {
  if (SE_PUEDE_CANCELAR.includes(solicitud.estatus)) {
    const titulo = solicitud.vacante?.titulo
    if (confirmando === solicitud.id) {
      return (
        <div className="confirmacion confirmacion--fila" role="group" aria-label={`Confirmar cancelación de ${titulo}`}>
          <p><strong>¿Seguro que quieres cancelar esta solicitud?</strong></p>
          <div className="grupo-botones">
            <Boton variante="peligro" chico onClick={() => cancelar(solicitud)}>Sí, cancelar</Boton>
            <Boton variante="secundario" chico onClick={() => setConfirmando(null)}>No</Boton>
          </div>
        </div>
      )
    }
    return (
      <Boton variante="secundario" onClick={() => setConfirmando(solicitud.id)}>
        Cancelar solicitud<span className="solo-lector"> de {titulo}</span>
      </Boton>
    )
  }
  if (solicitud.estatus === 'Aceptada') return <span>La empresa te contactará pronto.</span>
  if (solicitud.estatus === 'Rechazada') return <span className="texto-secundario">Solicitud terminada.</span>
  return <span className="texto-secundario">Cancelaste esta solicitud.</span>
}

export default function MisSolicitudes() {
  const { perfil } = useAuth()
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [confirmando, setConfirmando] = useState(null)
  const [mensaje, setMensaje] = useState(null)

  const cargar = useCallback(async () => {
    const { data, error } = await supabase
      .from('solicitudes')
      .select('id, estatus, creada_en, estatus_actualizado_en, vacante:vacantes(id, titulo, empresa:perfiles(nombre))')
      .eq('candidato_id', perfil.id)
      .order('creada_en', { ascending: false })
    if (error) setMensaje({ tipo: 'error', titulo: 'No pudimos cargar tus solicitudes. Intenta de nuevo.' })
    else setSolicitudes(data)
    setCargando(false)
  }, [perfil.id])

  useEffect(() => { cargar() }, [cargar])

  async function cancelar(solicitud) {
    const { error } = await supabase
      .from('solicitudes')
      .update({ estatus: 'Cancelada' })
      .eq('id', solicitud.id)
    setConfirmando(null)
    if (error) setMensaje({ tipo: 'error', titulo: 'No se pudo cancelar la solicitud.' })
    else setMensaje({ tipo: 'exito', titulo: `Cancelaste tu solicitud a «${solicitud.vacante?.titulo}».` })
    cargar()
  }

  return (
    <div className="contenedor">
      <TituloPagina
        titulo="Mis solicitudes"
        descripcion="Aquí ves las vacantes a las que te postulaste y en qué va cada una."
      />

      {!perfil.aprobado && (
        <div className="aviso-pagina">
          <Aviso tipo="advertencia" titulo="Tu registro está en revisión">
            AMAC está revisando tus datos. Cuando te aprueben podrás postularte a las vacantes.
          </Aviso>
        </div>
      )}

      {mensaje && <div className="aviso-pagina"><Aviso tipo={mensaje.tipo} titulo={mensaje.titulo} /></div>}

      {cargando && <Cargando texto="Cargando tus solicitudes…" />}

      {!cargando && solicitudes.length === 0 && (
        <div className="estado-vacio tarjeta">
          <h2>Todavía no te postulas a ninguna vacante</h2>
          <p>Cuando lo hagas, aquí podrás ver en qué va cada solicitud.</p>
          <Boton to="/">Ver vacantes disponibles</Boton>
        </div>
      )}

      {!cargando && solicitudes.length > 0 && (
        <div className="tabla-marco">
          <table className="tabla">
            <caption className="solo-lector">Tus solicitudes de empleo: {solicitudes.length}</caption>
            <thead>
              <tr>
                <th scope="col">Fecha</th>
                <th scope="col">Vacante</th>
                <th scope="col">Empresa</th>
                <th scope="col">Estatus</th>
                <th scope="col">Acción</th>
              </tr>
            </thead>
            <tbody>
              {solicitudes.map((s) => (
                <tr key={s.id}>
                  <td data-orden="4">
                    <span className="tabla__etiqueta-movil">Te postulaste el </span>
                    <time dateTime={s.creada_en}>{formatoFecha(s.creada_en, true)}</time>
                  </td>
                  <th scope="row" className="tabla__principal" data-orden="2">
                    <Link to={`/vacantes/${s.vacante?.id}`}>{s.vacante?.titulo}</Link>
                  </th>
                  <td data-orden="3">
                    <span className="tabla__etiqueta-movil">Empresa: </span>{s.vacante?.empresa?.nombre}
                  </td>
                  <td data-orden="1">
                    <EtiquetaEstatus estatus={s.estatus} />
                    {s.estatus !== 'Enviada' && (
                      <span className="fecha-estatus">
                        desde el <time dateTime={s.estatus_actualizado_en}>{formatoFecha(s.estatus_actualizado_en, true)}</time>
                      </span>
                    )}
                  </td>
                  <td data-orden="5">
                    <Accion
                      solicitud={s}
                      confirmando={confirmando}
                      setConfirmando={setConfirmando}
                      cancelar={cancelar}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
