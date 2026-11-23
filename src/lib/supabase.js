import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const llave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabaseConfigurado = Boolean(url && llave)

export const supabase = createClient(
  url || 'https://sin-configurar.supabase.co',
  llave || 'sin-configurar'
)
