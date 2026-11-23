import TituloPagina from '../components/TituloPagina'
import Boton from '../components/Boton'

export default function NoEncontrada() {
  return (
    <div className="contenedor contenedor--angosto">
      <div className="estado-vacio tarjeta">
        <p className="estado-vacio__numero" aria-hidden="true">404</p>
        <TituloPagina titulo="No encontramos esta página" tituloPestana="Página no encontrada" />
        <p>Puede que el enlace esté mal escrito o que la página ya no exista.</p>
        <Boton to="/">Ver vacantes disponibles</Boton>
      </div>
    </div>
  )
}
