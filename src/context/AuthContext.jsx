import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(undefined)
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSesion(data.session))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSesion(nuevaSesion)
    })
    return () => subscription.unsubscribe()
  }, [])

  const sesionLista = sesion !== undefined
  const usuarioId = sesion?.user.id

  const cargarPerfil = useCallback(async (id) => {
    const { data } = await supabase.from('perfiles').select('*').eq('id', id).single()
    setPerfil(data)
    return data
  }, [])

  useEffect(() => {
    if (!sesionLista) return
    if (!usuarioId) {
      setPerfil(null)
      setCargando(false)
      return
    }
    setCargando(true)
    cargarPerfil(usuarioId).then(() => setCargando(false))
  }, [sesionLista, usuarioId, cargarPerfil])

  const recargarPerfil = useCallback(() => {
    if (usuarioId) return cargarPerfil(usuarioId)
  }, [usuarioId, cargarPerfil])

  const cerrarSesion = useCallback(async () => {
    await supabase.auth.signOut()
    setPerfil(null)
  }, [])

  return (
    <AuthContext.Provider value={{ sesion, perfil, cargando, recargarPerfil, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

export function inicioSegunRol(rol) {
  if (rol === 'empresa') return '/empresa/vacantes'
  if (rol === 'admin') return '/admin'
  return '/'
}
