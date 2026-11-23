export const requerido = (valor, campo) =>
  String(valor ?? '').trim() ? null : `Escribe ${campo}.`

export const correoValido = (valor) => {
  if (!String(valor).trim()) return 'Escribe tu correo electrónico.'
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim()) ? null : 'Revisa tu correo: debe verse como nombre@correo.com.'
}

export const telefonoValido = (valor, obligatorio = true) => {
  const digitos = String(valor || '').replace(/\D/g, '')
  if (!digitos) return obligatorio ? 'Escribe un número de teléfono.' : null
  return digitos.length === 10 ? null : 'El teléfono debe tener 10 dígitos.'
}

export const contrasenaValida = (valor) =>
  String(valor || '').length >= 8 ? null : 'La contraseña debe tener al menos 8 letras o números.'

export const soloErrores = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v))

export function enfocarPrimerError(errores, orden) {
  const primero = orden.find((id) => errores[id])
  if (primero) setTimeout(() => document.getElementById(primero)?.focus(), 0)
}

export function mensajeAuth(error) {
  const m = (error?.message || '').toLowerCase()
  if (m.includes('already registered') || m.includes('already been registered'))
    return 'Ya existe una cuenta con ese correo. Intenta iniciar sesión.'
  if (m.includes('password')) return 'La contraseña no es válida. Usa al menos 8 letras o números.'
  if (m.includes('email')) return 'Revisa tu correo electrónico.'
  if (m.includes('rate limit')) return 'Hubo muchos intentos seguidos. Espera un momento e intenta de nuevo.'
  return 'No pudimos crear tu cuenta. Intenta de nuevo o llama a AMAC.'
}
