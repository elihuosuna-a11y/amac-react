export default function Aviso({ tipo = 'info', titulo, children }) {
  const clase = tipo === 'info' ? 'aviso' : `aviso aviso--${tipo}`
  const rol = tipo === 'error' ? 'alert' : 'status'
  return (
    <div className={clase} role={rol}>
      <div>
        {titulo && <p className="aviso__titulo">{titulo}</p>}
        {children && <div className="aviso__texto">{children}</div>}
      </div>
    </div>
  )
}
