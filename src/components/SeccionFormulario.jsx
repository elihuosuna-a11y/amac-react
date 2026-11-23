export default function SeccionFormulario({ numero, id, titulo, children }) {
  return (
    <section className="tarjeta seccion-form" id={id} aria-labelledby={`${id}-titulo`}>
      <h2 className="seccion-form__titulo" id={`${id}-titulo`}>
        <span className="paso" aria-hidden="true">{numero}</span>
        {titulo}
      </h2>
      {children}
    </section>
  )
}
