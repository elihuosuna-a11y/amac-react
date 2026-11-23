import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import TituloPagina from '../components/TituloPagina'
import Boton from '../components/Boton'
import Aviso from '../components/Aviso'
import Cargando from '../components/Cargando'
import { formatoFecha } from '../utils/formato'

export default function AdminCandidatos() {
  const [candidatos, setCandidatos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [mensaje, setMensaje] = useState(null)
  const [verAprobados, setVerAprobados] = useState(false)

  const cargar = useCallback(async () => {
    const { data } = await supabase
      .from('perfiles')
      .select('id, nombre, edad, colonia, telefono, experiencia, aprobado, creado_en')
      .eq('rol', 'candidato')
      .eq('aprobado', verAprobados)
      .order('creado_en', { ascending: true })
    setCandidatos(data || [])
    setCargando(false)
  }, [verAprobados])

  useEffect(() => { cargar() }, [cargar])

  async function cambiar(c, valor) {
    const { error } = await supabase.rpc('cambiar_aprobacion', { cid: c.id, valor })
    setMensaje(error
      ? { tipo: 'error', titulo: 'No se pudo guardar el cambio.' }
      : { tipo: 'exito', titulo: valor ? `Aprobaste a ${c.nombre}. Ya puede postularse.` : `Quitaste la aprobación de ${c.nombre}.` })
    cargar()
  }

  return (
    <div className="contenedor">
      <TituloPagina
        titulo="Aprobar candidatos"
        descripcion="Revisa los datos de cada persona antes de permitirle postularse a vacantes."
      />

      <div className="pastillas" role="group" aria-label="Mostrar candidatos">
        <button className="pastilla" type="button" aria-pressed={!verAprobados} onClick={() => setVerAprobados(false)}>
          Pendientes
        </button>
        <button className="pastilla" type="button" aria-pressed={verAprobados} onClick={() => setVerAprobados(true)}>
          Aprobados
        </button>
      </div>

      {mensaje && <div className="aviso-pagina"><Aviso tipo={mensaje.tipo} titulo={mensaje.titulo} /></div>}
      {cargando && <Cargando />}

      {!cargando && candidatos.length === 0 && (
        <div className="estado-vacio tarjeta">
          <h2>{verAprobados ? 'Todavía no hay candidatos aprobados' : 'No hay candidatos pendientes'}</h2>
        </div>
      )}

      {!cargando && candidatos.length > 0 && (
        <ul className="lista-tarjetas">
          {candidatos.map((c) => (
            <li key={c.id}>
              <article className="tarjeta tarjeta-candidato">
                <h2>{c.nombre}</h2>
                <dl className="resumen">
                  <div><dt>Edad</dt><dd>{c.edad ? `${c.edad} años` : 'Sin dato'}</dd></div>
                  <div><dt>Colonia</dt><dd>{c.colonia || 'Sin dato'}</dd></div>
                  <div><dt>Teléfono</dt><dd>{c.telefono || 'Sin dato'}</dd></div>
                  <div><dt>Se registró el</dt><dd>{formatoFecha(c.creado_en)}</dd></div>
                </dl>
                <div>
                  <h3 className="tarjeta-candidato__subtitulo">Experiencia</h3>
                  <p className="texto-pre">{c.experiencia || 'Sin dato'}</p>
                </div>
                {verAprobados ? (
                  <Boton variante="secundario" onClick={() => cambiar(c, false)}>
                    Quitar aprobación<span className="solo-lector"> de {c.nombre}</span>
                  </Boton>
                ) : (
                  <Boton onClick={() => cambiar(c, true)}>
                    Aprobar<span className="solo-lector"> a {c.nombre}</span>
                  </Boton>
                )}
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
