import TituloPagina from '../components/TituloPagina'
import TarjetaAyuda from '../components/TarjetaAyuda'
import Boton from '../components/Boton'
import { TELEFONO_AMAC_HREF } from '../utils/formato'

export default function ConoceAmac() {
  return (
    <div className="contenedor contenedor--angosto pila">
      <TituloPagina
        titulo="Conoce a AMAC"
        descripcion="Envejecer es vivir: ayudamos a las personas adultas mayores de Nuevo León a seguir trabajando, aprendiendo y participando."
      />

      <section className="pila pila--chica" aria-labelledby="t-quienes">
        <h2 id="t-quienes">¿Quiénes somos?</h2>
        <p>AMAC es una asociación civil que acompaña a personas adultas mayores. Con esta bolsa de trabajo conectamos a quienes quieren seguir activos con empresas que valoran su experiencia.</p>
      </section>

      <section className="pila pila--chica" aria-labelledby="t-que">
        <h2 id="t-que">¿Qué hacemos?</h2>
        <ul className="lista-vinetas">
          <li>Revisamos cada registro antes de que la persona pueda postularse.</li>
          <li>Te ayudamos por teléfono a buscar empleo y a postularte.</li>
          <li>Acompañamos a las empresas para que sus vacantes sean incluyentes.</li>
        </ul>
      </section>

      <TarjetaAyuda titulo="Contacto" texto="Llámanos de lunes a viernes de 9:00 a 17:00. Una persona te atiende." />

      <section className="pila pila--chica" id="terminos" aria-labelledby="t-terminos">
        <h2 id="t-terminos">Términos y condiciones</h2>
        <p>El uso de la bolsa de trabajo es gratuito para las personas candidatas. Las empresas se comprometen a publicar vacantes reales, con sueldo y horario claros.</p>
      </section>

      <section className="pila pila--chica" id="privacidad" aria-labelledby="t-privacidad">
        <h2 id="t-privacidad">Aviso de privacidad</h2>
        <p>Tus datos solo los ven AMAC y las empresas a las que te postulas, para poder contactarte. Nunca los vendemos ni los compartimos con terceros. Tu contraseña la guarda de forma segura el servicio de inicio de sesión; nadie de AMAC puede verla.</p>
      </section>

      <section className="tarjeta" id="donativo" aria-labelledby="t-donativo">
        <h2 id="t-donativo">Haz un donativo</h2>
        <p>Tu apoyo nos ayuda a mantener esta plataforma gratuita y a dar acompañamiento por teléfono.</p>
        <p><Boton variante="coral" href={TELEFONO_AMAC_HREF}>Llamar para donar</Boton></p>
      </section>
    </div>
  )
}
