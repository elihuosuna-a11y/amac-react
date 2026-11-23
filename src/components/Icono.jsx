export default function Icono({ nombre, tamano = 22, className }) {
  return (
    <img
      src={`/img/iconos/${nombre}.svg`}
      alt=""
      width={tamano}
      height={tamano}
      className={className}
    />
  )
}
