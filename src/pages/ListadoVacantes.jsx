import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import TarjetaVacante from '../components/TarjetaVacante'
import TituloPagina from '../components/TituloPagina'
import TarjetaAyuda from '../components/TarjetaAyuda'
import Campo from '../components/Campo'
import Boton from '../components/Boton'
import Aviso from '../components/Aviso'
import Cargando from '../components/Cargando'
import { CATEGORIAS, HORARIOS } from '../utils/formato'

const limpiar = (texto) => texto.replace(/[,()%*\\]/g, ' ').trim()

export default function ListadoVacantes() {
  const [vacantes, setVacantes] = useState([])
  const [texto, setTexto] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [horario, setHorario] = useState('')
  const [categoria, setCategoria] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelado = false

    async function cargar() {
      setCargando(true)
      setError(false)

      let consulta = supabase
        .from('vacantes')
        .select('*, empresa:perfiles(nombre)')
        .eq('estado', 'activa')
        .order('creada_en', { ascending: false })

      const termino = limpiar(busqueda)
      if (termino) consulta = consulta.or(`titulo.ilike.%${termino}%,ubicacion.ilike.%${termino}%`)
      if (horario) consulta = consulta.eq('horario', horario)
      if (categoria) consulta = consulta.eq('categoria', categoria)

      const { data, error } = await consulta
      if (cancelado) return
      if (error) setError(true)
      else setVacantes(data)
      setCargando(false)
    }

    cargar()
    return () => { cancelado = true }
  }, [busqueda, horario, categoria])

  function buscar(e) {
    e.preventDefault()
    setBusqueda(texto)
  }

  function quitarFiltros() {
    setTexto('')
    setBusqueda('')
    setHorario('')
    setCategoria('')
  }

  const hayFiltros = busqueda || horario || categoria
  const conteo = vacantes.length === 1 ? '1 vacante disponible' : `${vacantes.length} vacantes disponibles`

  return (
    <>
      <section className="banda-busqueda" aria-label="Buscar vacantes">
        <div className="contenedor">
          <TituloPagina
            titulo="Encuentra un empleo"
            tituloPestana="Vacantes disponibles"
            descripcion="Vacantes disponibles para personas adultas mayores en Nuevo León."
          />
          <form className="buscador tarjeta" role="search" onSubmit={buscar}>
            <div className="campo-con-boton">
              <Campo
                id="buscar"
                etiqueta="Buscar por puesto o lugar"
                type="search"
                autoComplete="off"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
              />
              <Boton type="submit">Buscar</Boton>
            </div>
          </form>
        </div>
      </section>

      <div className="contenedor listado">
        <section className="listado__filtros tarjeta" aria-labelledby="titulo-filtros">
          <h2 id="titulo-filtros">Filtrar vacantes</h2>
          <div className="pila pila--chica">
            <fieldset className="filtro">
              <legend>Horario</legend>
              <div className="filtro__opciones">
                {['', ...HORARIOS].map((h) => (
                  <label className="opcion-simple" key={h || 'todos'}>
                    <input
                      className="control-radio"
                      type="radio"
                      name="horario"
                      value={h}
                      checked={horario === h}
                      onChange={() => setHorario(h)}
                    />
                    {h || 'Todos los horarios'}
                  </label>
                ))}
              </div>
            </fieldset>

            <Campo
              id="categoria"
              como="select"
              etiqueta="Tipo de empleo"
              opciones={CATEGORIAS}
              placeholderSelect="Todos los tipos"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
            />

            <Boton variante="secundario" bloque onClick={quitarFiltros} disabled={!hayFiltros}>
              Quitar filtros
            </Boton>
          </div>
        </section>

        <section className="listado__resultados" aria-labelledby="titulo-resultados">
          <h2 className="conteo" id="titulo-resultados" aria-live="polite">
            {cargando ? 'Buscando vacantes…' : error ? 'Vacantes' : conteo}
          </h2>

          {cargando && <Cargando texto="Cargando vacantes…" />}

          {!cargando && error && (
            <Aviso tipo="error" titulo="No pudimos cargar las vacantes">
              Revisa tu conexión a internet e intenta de nuevo. Si el problema sigue, llama a AMAC.
            </Aviso>
          )}

          {!cargando && !error && vacantes.length === 0 && (
            <div className="estado-vacio tarjeta">
              <h3>No hay vacantes para mostrar.</h3>
              <p>Prueba con otra palabra o quita los filtros.</p>
              {hayFiltros && <Boton variante="secundario" onClick={quitarFiltros}>Quitar filtros</Boton>}
            </div>
          )}

          {!cargando && !error && vacantes.length > 0 && (
            <ul className="lista-vacantes">
              {vacantes.map((v) => (
                <li key={v.id}><TarjetaVacante vacante={v} /></li>
              ))}
            </ul>
          )}
        </section>

        <TarjetaAyuda className="listado__ayuda" />
      </div>
    </>
  )
}
