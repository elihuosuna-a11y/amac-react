import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import TituloPagina from '../components/TituloPagina'
import EtiquetaEstatus from '../components/EtiquetaEstatus'
import Campo from '../components/Campo'
import Boton from '../components/Boton'
import Aviso from '../components/Aviso'
import Cargando from '../components/Cargando'
import { formatoFecha, formatoTelefono } from '../utils/formato'

const ESTATUS_EMPRESA = ['En revisión', 'Aceptada', 'Rechazada']

function TarjetaCandidato({ solicitud, onGuardado }) {
  const [nuevo, setNuevo] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState(null)
  const c = solicitud.candidato || {}
  const idCampo = `estatus-${solicitud.id}`

  async function guardar() {
    if (!nuevo) return
    setGuardando(true)
    setError(null)
    const { error } = await supabase.from('solicitudes').update({ estatus: nuevo }).eq('id', solicitud.id)
    setGuardando(false)
    if (error) setError('No se pudo cambiar el estatus. Intenta de nuevo.')
    else { setNuevo(''); onGuardado(c.nombre, nuevo) }
  }

  return (
    <article className="tarjeta tarjeta-candidato">
      <div className="tarjeta-candidato__encabezado">
        <h2>{c.nombre}</h2>
        <EtiquetaEstatus estatus={solicitud.estatus} />
      </div>

      <dl className="resumen">
        <div><dt>Edad</dt><dd>{c.edad ? `${c.edad} años` : 'Sin dato'}</dd></div>
        <div><dt>Colonia</dt><dd>{c.colonia || 'Sin dato'}</dd></div>
        <div><dt>Vacante</dt><dd>{solicitud.vacante?.titulo}</dd></div>
        <div><dt>Se postuló el</dt><dd>{formatoFecha(solicitud.creada_en)}</dd></div>
        {c.telefono && (
          <div><dt>Teléfono</dt><dd><a href={`tel:+52${c.telefono}`}>{formatoTelefono(c.telefono)}</a></dd></div>
        )}
      </dl>

      <div>
        <h3 className="tarjeta-candidato__subtitulo">Experiencia</h3>
        <p className="texto-pre">{c.experiencia || 'Sin dato'}</p>
      </div>

      <div className="campo-con-boton">
        <Campo
          id={idCampo}
          como="select"
          etiqueta={<>Cambiar estatus<span className="solo-lector"> de {c.nombre}</span></>}
          opciones={ESTATUS_EMPRESA.filter((e) => e !== solicitud.estatus)}
          placeholderSelect="Elige el nuevo estatus"
          value={nuevo}
          onChange={(e) => setNuevo(e.target.value)}
          error={error}
        />
        <Boton onClick={guardar} disabled={!nuevo || guardando}>
          {guardando ? 'Guardando…' : 'Guardar estatus'}
        </Boton>
      </div>
    </article>
  )
}

export default function SolicitudesRecibidas() {
  const { perfil } = useAuth()
  const [params, setParams] = useSearchParams()
  const filtroVacante = params.get('vacante') || ''
  const [filtroEstatus, setFiltroEstatus] = useState('')
  const [vacantes, setVacantes] = useState([])
  const [solicitudes, setSolicitudes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => {
    supabase.from('vacantes').select('id, titulo').eq('empresa_id', perfil.id).order('creada_en', { ascending: false })
      .then(({ data }) => setVacantes(data || []))
  }, [perfil.id])

  const cargar = useCallback(async () => {
    let consulta = supabase
      .from('solicitudes')
      .select('id, estatus, creada_en, vacante:vacantes(id, titulo), candidato:perfiles(nombre, edad, colonia, experiencia, telefono)')
      .neq('estatus', 'Cancelada')
      .order('creada_en', { ascending: false })
    if (filtroVacante) consulta = consulta.eq('vacante_id', filtroVacante)
    if (filtroEstatus) consulta = consulta.eq('estatus', filtroEstatus)
    const { data } = await consulta
    setSolicitudes(data || [])
    setCargando(false)
  }, [filtroVacante, filtroEstatus])

  useEffect(() => { cargar() }, [cargar])

  function cambiarVacante(e) {
    setParams(e.target.value ? { vacante: e.target.value } : {})
  }

  return (
    <div className="contenedor">
      <TituloPagina
        titulo="Solicitudes recibidas"
        descripcion="Personas que se postularon a tus vacantes. Cambia su estatus para que vean en qué va su solicitud."
      />

      <section className="tarjeta filtros-fila" aria-label="Filtrar solicitudes">
        <Campo
          id="filtro-vacante"
          como="select"
          etiqueta="Vacante"
          opciones={vacantes.map((v) => ({ valor: String(v.id), texto: v.titulo }))}
          placeholderSelect="Todas mis vacantes"
          value={filtroVacante}
          onChange={cambiarVacante}
        />
        <Campo
          id="filtro-estatus"
          como="select"
          etiqueta="Estatus"
          opciones={['Enviada', ...ESTATUS_EMPRESA]}
          placeholderSelect="Todos los estatus"
          value={filtroEstatus}
          onChange={(e) => setFiltroEstatus(e.target.value)}
        />
      </section>

      {mensaje && <div className="aviso-pagina"><Aviso tipo="exito" titulo={mensaje} /></div>}

      {cargando && <Cargando texto="Cargando solicitudes…" />}

      {!cargando && (
        <p className="conteo" aria-live="polite">
          {solicitudes.length === 1 ? '1 solicitud' : `${solicitudes.length} solicitudes`}
        </p>
      )}

      {!cargando && solicitudes.length === 0 && (
        <div className="estado-vacio tarjeta">
          <h2>No hay solicitudes para mostrar</h2>
          <p>Cuando alguien se postule a tus vacantes, aparecerá aquí.</p>
          <Link to="/empresa/vacantes">Ver mis vacantes</Link>
        </div>
      )}

      {!cargando && solicitudes.length > 0 && (
        <ul className="lista-tarjetas">
          {solicitudes.map((s) => (
            <li key={s.id}>
              <TarjetaCandidato
                solicitud={s}
                onGuardado={(nombre, estatus) => { setMensaje(`La solicitud de ${nombre} cambió a «${estatus}».`); cargar() }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
