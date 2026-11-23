import { Link } from 'react-router-dom'

export default function Logo() {
  return (
    <Link className="logo" to="/">
      <img src="/img/isotipo.svg" alt="" width="38" height="22" />
      <span>AMAC</span>
      <span className="solo-lector">, ir al inicio</span>
    </Link>
  )
}
