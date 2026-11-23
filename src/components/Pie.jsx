import { Link } from 'react-router-dom'
import { TELEFONO_AMAC, TELEFONO_AMAC_HREF } from '../utils/formato'

export default function Pie() {
  return (
    <footer className="pie fondo-oscuro">
      <div className="contenedor pie__interior">
        <p className="pie__lema">Envejecer es <strong>vivir.</strong></p>
        <nav aria-label="Enlaces de AMAC">
          <ul className="pie__enlaces">
            <li><Link to="/conoce-amac">Conoce a AMAC</Link></li>
            <li><Link to="/conoce-amac#privacidad">Aviso de privacidad</Link></li>
            <li><Link className="boton boton--coral boton--chico" to="/conoce-amac#donativo">Haz un donativo</Link></li>
          </ul>
        </nav>
        <p className="pie__legal">
          ¿Dudas? Llama a AMAC al <a href={TELEFONO_AMAC_HREF}>{TELEFONO_AMAC}</a>, de lunes a viernes de 9:00 a 17:00.
        </p>
      </div>
    </footer>
  )
}
