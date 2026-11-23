export default function Casilla({ id, children, error, ...props }) {
  return (
    <div>
      <label className="casilla" htmlFor={id}>
        <input
          className="control-casilla"
          type="checkbox"
          id={id}
          name={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        <span>{children}</span>
      </label>
      {error && (
        <p className="campo-formulario__error" id={`${id}-error`}>
          <img src="/img/iconos/alerta.svg" alt="" width="20" height="20" />
          {error}
        </p>
      )}
    </div>
  )
}
