import Icono from './Icono'
import { TELEFONO_AMAC, TELEFONO_AMAC_HREF } from '../utils/formato'

export default function BotonAyuda() {
  return (
    <a className="boton-ayuda" href={TELEFONO_AMAC_HREF}>
      <Icono nombre="telefono" />
      <span>
        Ayuda<span className="boton-ayuda__telefono">: {TELEFONO_AMAC}</span>
        <span className="solo-lector">, llamar a AMAC</span>
      </span>
    </a>
  )
}
