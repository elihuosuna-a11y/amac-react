import { useEffect } from 'react'

export default function TituloPagina({ titulo, descripcion, accion, tituloPestana }) {
  useEffect(() => {
    document.title = `${tituloPestana || titulo} | AMAC`
  }, [titulo, tituloPestana])

  return (
    <div className={`titulo-pagina${accion ? ' titulo-pagina--con-accion' : ''}`}>
      <h1>{titulo}</h1>
      {descripcion && <p>{descripcion}</p>}
      {accion}
    </div>
  )
}
