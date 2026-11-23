import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import TituloPagina from '../components/TituloPagina'
import EtiquetaEstatus from '../components/EtiquetaEstatus'
import Boton from '../components/Boton'
import Aviso from '../components/Aviso'
import Cargando from '../components/Cargando'
import { formatoFecha } from '../utils/formato'

const FILTROS = [
  { valor: '', texto: 'Todas' },
  { valor: 'activa', texto: 'Activas' },
  { valor: 'pausada', texto: 'Pausadas' },
  { valor: 'cerrada', texto: 'Cerradas' },
]

export default function EmpresaVacantes() {
  const { perfil } = useAuth()
  const location = useLocation()
  const [vacantes, setVacantes] = useState([])
  const [filtro, setFiltro] = useState('')
  const [cargando, setCargando] = useState(true)
  const [confirmandoCierre, setConfirmandoCierre] = useState(null)
  const [mensaje, setMensaje] = useState(
    location.state?.publicada
      ? { tipo: 'exito', titulo: `Publicaste la vacante «${location.state.publicada}». Ya aparece en el listado.` }
      : location.state?.bienvenida
        ? { tipo: 'exito', titulo: `Te damos la bienvenida, ${perfil.nombre}. Ya puedes publicar tu primera vacante.` }
        : null
  )

  const cargar = useCallback(async () => {
    const { data } = await supabase
      .from('vacantes')
      .select('id, titulo, estado, creada_en, solicitudes(estatus)')
      .eq('empresa_id', perfil.id)
      .order('creada_en', { ascending: false })
    setVacantes(data || [])
    setCargando(false)
  }, [perfil.id])

  useEffect(() => { cargar() }, [cargar])

  async function cambiarEstado(vacante, estado, texto) {
    const { error } = await supabase.from('vacantes').update({ estado }).eq('id', vacante.id)
    setConfirmandoCierre(null)
    setMensaje(error
      ? { tipo: 'error', titulo: 'No se pudo cambiar el estado. Intenta de nuevo.' }
      : { tipo: 'exito', titulo: `La vacante «${vacante.titulo}» ${texto}.` })
    cargar()
  }

  const contar = (estado) => vacantes.filter((v) => !estado || v.estado === estado).length
  const visibles = vacantes.filter((v) => !filtro || v.estado === filtro)

  return (
    <div className="contenedor">
      <TituloPagina
        titulo="Mis vacantes"
        descripcion={`${perfil.nombre} · Revisa tus vacantes, cuántas personas se postularon y cambia su estado.`}
        accion={<Boton to="/empresa/publicar">+ Publicar vacante</Boton>}
      />

      {mensaje && <div className="aviso-pagina"><Aviso tipo={mensaje.tipo} titulo={mensaje.titulo} /></div>}

      <div className="pastillas" role="group" aria-label="Filtrar vacantes por estado">
        {FILTROS.map((f) => (
          <button
            key={f.valor}
            className="pastilla"
            type="button"
            aria-pressed={filtro === f.valor}
            onClick={() => setFiltro(f.valor)}
          >
            {f.texto} ({contar(f.valor)})
          </button>
        ))}
      </div>

      {cargando && <Cargando texto="Cargando tus vacantes…" />}

      {!cargando && visibles.length === 0 && (
        <div className="estado-vacio tarjeta">
          <h2>{vacantes.length ? 'No hay vacantes con ese estado' : 'Todavía no publicas vacantes'}</h2>
          {!vacantes.length && <Boton to="/empresa/publicar">Publicar mi primera vacante</Boton>}
        </div>
      )}

      {!cargando && visibles.length > 0 && (
        <div className="tabla-marco">
          <table className="tabla">
            <caption className="solo-lector">Vacantes de {perfil.nombre}: {visibles.length}</caption>
            <thead>
              <tr>
                <th scope="col">Vacante</th>
                <th scope="col">Publicada</th>
                <th scope="col">Estado</th>
                <th scope="col">Solicitudes</th>
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((v) => {
                const total = v.solicitudes.filter((s) => s.estatus !== 'Cancelada').length
                return (
                  <tr key={v.id}>
                    <th scope="row" className="tabla__principal" data-orden="2">
                      <Link to={`/vacantes/${v.id}`}>{v.titulo}</Link>
                    </th>
                    <td data-orden="3">
                      <span className="tabla__etiqueta-movil">Publicada el </span>
                      <time dateTime={v.creada_en}>{formatoFecha(v.creada_en, true)}</time>
                    </td>
                    <td data-orden="1"><EtiquetaEstatus estatus={v.estado} /></td>
                    <td data-orden="4">
                      <Link to={`/empresa/solicitudes?vacante=${v.id}`}>
                        {total} {total === 1 ? 'solicitud' : 'solicitudes'}
                        <span className="solo-lector"> de {v.titulo}</span>
                      </Link>
                    </td>
                    <td data-orden="5">
                      {v.estado === 'cerrada' && (
                        <span className="texto-secundario">No aparece en el listado público.</span>
                      )}

                      {v.estado !== 'cerrada' && confirmandoCierre === v.id && (
                        <div className="confirmacion confirmacion--fila" role="group" aria-label={`Confirmar cierre de ${v.titulo}`}>
                          <p><strong>¿Cerrar esta vacante? Ya no podrás reactivarla.</strong></p>
                          <div className="grupo-botones">
                            <Boton variante="peligro" chico onClick={() => cambiarEstado(v, 'cerrada', 'se cerró')}>Sí, cerrar</Boton>
                            <Boton variante="secundario" chico onClick={() => setConfirmandoCierre(null)}>No</Boton>
                          </div>
                        </div>
                      )}

                      {v.estado !== 'cerrada' && confirmandoCierre !== v.id && (
                        <div className="grupo-botones">
                          {v.estado === 'activa' ? (
                            <Boton variante="secundario" chico onClick={() => cambiarEstado(v, 'pausada', 'se pausó y ya no aparece en el listado')}>
                              Pausar<span className="solo-lector"> {v.titulo}</span>
                            </Boton>
                          ) : (
                            <Boton variante="secundario" chico onClick={() => cambiarEstado(v, 'activa', 'se reactivó')}>
                              Reactivar<span className="solo-lector"> {v.titulo}</span>
                            </Boton>
                          )}
                          <Boton variante="secundario" chico onClick={() => setConfirmandoCierre(v.id)}>
                            Cerrar<span className="solo-lector"> {v.titulo}</span>
                          </Boton>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
