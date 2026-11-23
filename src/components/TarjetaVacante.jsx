import Boton from './Boton'
import Icono from './Icono'
import { formatoSueldo } from '../utils/formato'

export default function TarjetaVacante({ vacante }) {
  return (
    <article className="tarjeta-vacante">
      <div className="tarjeta-vacante__encabezado">
        <h3 className="tarjeta-vacante__titulo">{vacante.titulo}</h3>
        <p className="con-icono con-icono--fuerte">
          <Icono nombre="edificio" />
          <span><span className="solo-lector">Empresa: </span>{vacante.empresa?.nombre}</span>
        </p>
      </div>

      <p className="tarjeta-vacante__sueldo">
        <span className="tarjeta-vacante__monto">{formatoSueldo(vacante.sueldo)}</span> al mes
      </p>

      <ul className="tarjeta-vacante__datos">
        <li className="con-icono">
          <Icono nombre="ubicacion" />
          <span><span className="solo-lector">Ubicación: </span>{vacante.ubicacion}</span>
        </li>
        <li className="con-icono">
          <Icono nombre="reloj" />
          <span><span className="solo-lector">Horario: </span>{vacante.horario}</span>
        </li>
      </ul>

      <ul className="tarjeta-vacante__etiquetas">
        <li className="chip">{vacante.categoria}</li>
        {vacante.telefono_contacto && (
          <li className="chip"><Icono nombre="telefono" tamano={18} />También por teléfono</li>
        )}
      </ul>

      <Boton to={`/vacantes/${vacante.id}`} bloque>
        Ver detalle<span className="solo-lector"> de {vacante.titulo}</span>
      </Boton>
    </article>
  )
}
