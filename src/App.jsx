import { useEffect, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { supabaseConfigurado } from './lib/supabase'
import Encabezado from './components/Encabezado'
import Pie from './components/Pie'
import RutaProtegida from './components/RutaProtegida'
import Aviso from './components/Aviso'

import ListadoVacantes from './pages/ListadoVacantes'
import DetalleVacante from './pages/DetalleVacante'
import Login from './pages/Login'
import RegistroCandidato from './pages/RegistroCandidato'
import RegistroEmpresa from './pages/RegistroEmpresa'
import MisSolicitudes from './pages/MisSolicitudes'
import EmpresaVacantes from './pages/EmpresaVacantes'
import PublicarVacante from './pages/PublicarVacante'
import SolicitudesRecibidas from './pages/SolicitudesRecibidas'
import AdminCandidatos from './pages/AdminCandidatos'
import MiCuenta from './pages/MiCuenta'
import ConoceAmac from './pages/ConoceAmac'
import NoEncontrada from './pages/NoEncontrada'

function claseMain(ruta) {
  if (ruta === '/') return 'main--listado'
  if (ruta === '/login') return 'main--acceso'
  return undefined
}

export default function App() {
  const { pathname, hash } = useLocation()
  const mainRef = useRef(null)

  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView()
      return
    }
    window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname, hash])

  return (
    <>
      <a className="saltar-contenido" href="#principal">Saltar al contenido</a>
      <Encabezado />

      <main id="principal" className={claseMain(pathname)} ref={mainRef} tabIndex={-1}>
        {!supabaseConfigurado && (
          <div className="contenedor aviso-config">
            <Aviso tipo="advertencia" titulo="Falta conectar Supabase">
              Creen el archivo <code>.env.local</code> con <code>VITE_SUPABASE_URL</code> y{' '}
              <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> (o agréguenlas en Vercel) y vuelvan a correr la app.
            </Aviso>
          </div>
        )}

        <Routes>
          <Route path="/" element={<ListadoVacantes />} />
          <Route path="/vacantes/:id" element={<DetalleVacante />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<RegistroCandidato />} />
          <Route path="/registro-empresa" element={<RegistroEmpresa />} />
          <Route path="/conoce-amac" element={<ConoceAmac />} />

          <Route path="/cuenta" element={<RutaProtegida><MiCuenta /></RutaProtegida>} />

          <Route path="/mis-solicitudes"
            element={<RutaProtegida rol="candidato"><MisSolicitudes /></RutaProtegida>} />

          <Route path="/empresa/vacantes"
            element={<RutaProtegida rol="empresa"><EmpresaVacantes /></RutaProtegida>} />
          <Route path="/empresa/publicar"
            element={<RutaProtegida rol="empresa"><PublicarVacante /></RutaProtegida>} />
          <Route path="/empresa/solicitudes"
            element={<RutaProtegida rol="empresa"><SolicitudesRecibidas /></RutaProtegida>} />

          <Route path="/admin"
            element={<RutaProtegida rol="admin"><AdminCandidatos /></RutaProtegida>} />

          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </main>

      <Pie />
    </>
  )
}
