import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import TituloPagina from '../components/TituloPagina'
import EnlaceRegresar from '../components/EnlaceRegresar'
import EtiquetaEstatus from '../components/EtiquetaEstatus'
import TarjetaAyuda from '../components/TarjetaAyuda'
import Boton from '../components/Boton'
import Aviso from '../components/Aviso'
import Icono from '../components/Icono'
import Cargando from '../components/Cargando'
import { aLista, formatoFecha, formatoSueldo, formatoTelefono } from '../utils/formato'

function Postular({ vacante, solicitud, onPostulado }) {
  const { perfil } = useAuth()
  const [paso, setPaso] = useState('inicio')
  const [mensaje, setMensaje] = useState(null)

  async function enviar() {
    setPaso('enviando')
    const { data, error } = await supabase
      .from('solicitudes')
      .insert({ vacante_id: vacante.id, candidato_id: perfil.id })
      .select()
      .single()

    if (error?.code === '23505') {
      setMensaje({ tipo: 'advertencia', titulo: 'Ya te postulaste a esta vacante.' })
    } else if (error) {
      setMensaje({
        tipo: 'error',
        titulo: 'No pudimos enviar tu postulación',
        texto: 'Tu registro aún no ha sido aprobado por AMAC. Por favor espera; si tienes dudas, llámanos.',
      })
    } else {
      onPostulado(data)
    }
    setPaso('inicio')
  }

  const sueldo = (
    <>
      <p className="texto-secundario">Sueldo</p>
      <p className="sueldo-grande">{formatoSueldo(vacante.sueldo)} al mes</p>
    </>
  )

  if (solicitud) {
    return (
      <div className="detalle__postular tarjeta">
        {sueldo}
        <Aviso tipo="exito" titulo="Ya te postulaste a esta vacante">
          <p>Lo hiciste el {formatoFecha(solicitud.creada_en)}.</p>
          <p className="fila-estatus">Estatus: <EtiquetaEstatus estatus={solicitud.estatus} /></p>
        </Aviso>
        <Boton to="/mis-solicitudes" variante="secundario" bloque>Ver mis solicitudes</Boton>
      </div>
    )
  }

  if (vacante.estado !== 'activa') {
    return (
      <div className="detalle__postular tarjeta">
        {sueldo}
        <Aviso tipo="advertencia" titulo="Esta vacante ya no recibe postulaciones" />
      </div>
    )
  }

  if (!perfil) {
    return (
      <div className="detalle__postular tarjeta">
        {sueldo}
        <p>Para postularte necesitas una cuenta.</p>
        <Boton to="/login" state={{ desde: `/vacantes/${vacante.id}` }} bloque>Iniciar sesión</Boton>
        <Boton to="/registro" variante="secundario" bloque>Crear cuenta</Boton>
      </div>
    )
  }

  if (perfil.rol !== 'candidato') {
    return (
      <div className="detalle__postular tarjeta">
        {sueldo}
        <p className="texto-secundario">Solo las personas candidatas pueden postularse.</p>
      </div>
    )
  }

  return (
    <div className="detalle__postular tarjeta">
      {sueldo}

      {!perfil.aprobado && paso === 'inicio' && !mensaje && (
        <p className="texto-secundario">
          Tu registro está en revisión. Podrás postularte cuando AMAC lo apruebe.
        </p>
      )}

      {mensaje && (
        <Aviso tipo={mensaje.tipo} titulo={mensaje.titulo}>{mensaje.texto}</Aviso>
      )}

      {paso === 'inicio' && (
        <Boton bloque onClick={() => { setMensaje(null); setPaso('confirmar') }}>Postularme</Boton>
      )}

      {paso !== 'inicio' && (
        <div className="confirmacion" role="group" aria-labelledby="confirmar-titulo">
          <p id="confirmar-titulo"><strong>¿Confirmas tu postulación a «{vacante.titulo}»?</strong></p>
          <p className="texto-secundario">La empresa verá tu nombre, edad, colonia y experiencia.</p>
          <Boton bloque onClick={enviar} disabled={paso === 'enviando'}>
            {paso === 'enviando' ? 'Enviando…' : 'Sí, enviar postulación'}
          </Boton>
          <Boton variante="secundario" bloque onClick={() => setPaso('inicio')} disabled={paso === 'enviando'}>
            Cancelar
          </Boton>
        </div>
      )}
    </div>
  )
}

export default function DetalleVacante() {
  const { id } = useParams()
  const { perfil, recargarPerfil } = useAuth()
  const [vacante, setVacante] = useState(null)
  const [solicitud, setSolicitud] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [recienPostulado, setRecienPostulado] = useState(false)

  const esCandidato = perfil?.rol === 'candidato'
  const perfilId = perfil?.id

  useEffect(() => {
    async function cargar() {
      setCargando(true)
      const { data } = await supabase
        .from('vacantes')
        .select('*, empresa:perfiles(nombre, giro)')
        .eq('id', id)
        .maybeSingle()
      setVacante(data)
      setCargando(false)
    }
    cargar()
  }, [id])

  useEffect(() => {
    if (!esCandidato) return
    recargarPerfil()
    supabase
      .from('solicitudes')
      .select('id, estatus, creada_en')
      .eq('vacante_id', id)
      .eq('candidato_id', perfilId)
      .maybeSingle()
      .then(({ data }) => setSolicitud(data))
  }, [id, esCandidato, perfilId, recargarPerfil])

  if (cargando) return <div className="contenedor"><Cargando texto="Cargando vacante…" /></div>

  if (!vacante) {
    return (
      <div className="contenedor contenedor--angosto">
        <TituloPagina titulo="No encontramos esta vacante" descripcion="Puede que ya no esté disponible." />
        <Boton to="/">Ver vacantes disponibles</Boton>
      </div>
    )
  }

  const requisitos = aLista(vacante.requisitos)
  const prestaciones = aLista(vacante.prestaciones)

  return (
    <div className="contenedor">
      <EnlaceRegresar to="/">Regresar a vacantes</EnlaceRegresar>

      {recienPostulado && (
        <div className="aviso-pagina">
          <Aviso tipo="exito" titulo="¡Listo! Tu postulación fue enviada">
            La empresa ya puede ver tu solicitud. Revisa en qué va en{' '}
            <Link to="/mis-solicitudes">Mis solicitudes</Link>.
          </Aviso>
        </div>
      )}

      <div className="detalle">
        <div className="detalle__cabecera pila pila--chica">
          <p className="fila-chips">
            <span className="chip">{vacante.categoria}</span>
            {vacante.estado !== 'activa' && <EtiquetaEstatus estatus={vacante.estado} />}
          </p>
          <TituloPagina titulo={vacante.titulo} />
          <p className="con-icono con-icono--fuerte">
            <Icono nombre="edificio" />
            <span><span className="solo-lector">Empresa: </span>{vacante.empresa?.nombre}</span>
          </p>
        </div>

        <div className="detalle__info">
          <section className="tarjeta" aria-label="Datos principales">
            <dl className="datos-clave">
              <div className="datos-clave__item datos-clave__item--ubicacion">
                <dt>Ubicación</dt>
                <dd>{vacante.ubicacion}</dd>
              </div>
              <div className="datos-clave__item datos-clave__item--horario">
                <dt>Horario</dt>
                <dd>{vacante.horario}</dd>
              </div>
            </dl>
          </section>

          <section className="pila pila--chica" aria-labelledby="titulo-descripcion">
            <h2 id="titulo-descripcion">Descripción</h2>
            <p>{vacante.descripcion}</p>
          </section>

          <div className="detalle__dos-columnas">
            <section className="pila pila--chica" aria-labelledby="titulo-requisitos">
              <h2 id="titulo-requisitos">Requisitos</h2>
              <ul className="lista-vinetas">
                {requisitos.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </section>
            <section className="pila pila--chica" aria-labelledby="titulo-prestaciones">
              <h2 id="titulo-prestaciones">Prestaciones</h2>
              <ul className="lista-vinetas">
                {prestaciones.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </section>
          </div>

          <section className="tarjeta" aria-labelledby="titulo-proceso">
            <h2 id="titulo-proceso">¿Qué pasa después de postularte?</h2>
            <ol className="pasos-proceso">
              <li><span className="paso" aria-hidden="true">1</span>La empresa revisa tu solicitud.</li>
              <li><span className="paso" aria-hidden="true">2</span>Te contacta para una entrevista.</li>
              <li><span className="paso" aria-hidden="true">3</span>Ves el resultado en «Mis solicitudes».</li>
            </ol>
          </section>
        </div>

        <div className="detalle__lateral">
          <Postular
            vacante={vacante}
            solicitud={solicitud}
            onPostulado={(s) => { setSolicitud(s); setRecienPostulado(true); window.scrollTo(0, 0) }}
          />

          {vacante.telefono_contacto && vacante.estado === 'activa' && (
            <section className="detalle__telefono tarjeta tarjeta--info" aria-labelledby="titulo-telefono">
              <h2 id="titulo-telefono">También puedes postularte por teléfono</h2>
              <p className="telefono-destacado">{formatoTelefono(vacante.telefono_contacto)}</p>
              <Boton variante="secundario" bloque href={`tel:+52${vacante.telefono_contacto.replace(/\D/g, '')}`}>
                <Icono nombre="telefono" />Llamar a la empresa
              </Boton>
            </section>
          )}

          <TarjetaAyuda
            className="detalle__ayuda"
            titulo="¿Tienes dudas?"
            texto="Llama a AMAC y te ayudamos a postularte."
          />
        </div>
      </div>
    </div>
  )
}
