import { Routes, Route, Link, Outlet } from 'react-router-dom'
import Home from './pages/Home'
import Establishments from './pages/Establishments'
import EstablishmentDetail from './pages/EstablishmentDetail'

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <nav className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4">
          <Link to="/" className="text-lg font-semibold text-gray-900">
            Project Ivy
          </Link>
          <Link to="/" className="text-gray-600 hover:text-gray-900">
            Home
          </Link>
          <Link to="/establishments" className="text-gray-600 hover:text-gray-900">
            Establishments
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="establishments" element={<Establishments />} />
        <Route path="establishments/:id" element={<EstablishmentDetail />} />
      </Route>
    </Routes>
  )
}
