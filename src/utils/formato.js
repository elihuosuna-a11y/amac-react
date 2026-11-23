export const HORARIOS = ['Matutino', 'Vespertino', 'Medio tiempo', 'Fines de semana']

export const CATEGORIAS = [
  'Atención a clientes',
  'Comercio',
  'Alimentos',
  'Logística y almacén',
  'Limpieza y mantenimiento',
  'Cuidado de personas',
  'Educación y cultura',
  'Oficina y administración',
]

export const GIROS = ['Comercio', 'Servicios', 'Industria', 'Alimentos', 'Salud', 'Educación', 'Otro']

export function formatoSueldo(valor) {
  return Number(valor).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  })
}

export function formatoFecha(fecha, corta = false) {
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: corta ? 'short' : 'long',
    year: 'numeric',
  })
}

export function aLista(texto) {
  return (texto || '')
    .split('\n')
    .map((linea) => linea.replace(/^[-•*]\s*/, '').trim())
    .filter(Boolean)
}

export function formatoTelefono(tel) {
  const digitos = (tel || '').replace(/\D/g, '')
  if (digitos.length === 10) return `${digitos.slice(0, 2)} ${digitos.slice(2, 6)} ${digitos.slice(6)}`
  return tel
}

export const TELEFONO_AMAC = '81 0000 0000'
export const TELEFONO_AMAC_HREF = 'tel:+528100000000'
