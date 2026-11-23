export default function Campo({
  id,
  etiqueta,
  ayuda,
  error,
  como = 'input',
  opciones = [],
  placeholderSelect = 'Elige una opción',
  className = '',
  ...props
}) {
  const ids = [ayuda && `${id}-ayuda`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  const comunes = {
    id,
    name: id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': ids,
    ...props,
  }

  return (
    <div className={`campo-formulario${error ? ' campo-formulario--error' : ''} ${className}`.trim()}>
      <label htmlFor={id}>{etiqueta}</label>
      {ayuda && <p className="campo-formulario__ayuda" id={`${id}-ayuda`}>{ayuda}</p>}

      {como === 'textarea' && <textarea {...comunes} />}

      {como === 'select' && (
        <select {...comunes}>
          {placeholderSelect !== null && <option value="">{placeholderSelect}</option>}
          {opciones.map((op) => {
            const valor = typeof op === 'string' ? op : op.valor
            const texto = typeof op === 'string' ? op : op.texto
            return <option key={valor} value={valor}>{texto}</option>
          })}
        </select>
      )}

      {como === 'input' && <input {...comunes} />}

      {error && (
        <p className="campo-formulario__error" id={`${id}-error`}>
          <img src="/img/iconos/alerta.svg" alt="" width="20" height="20" />
          {error}
        </p>
      )}
    </div>
  )
}
