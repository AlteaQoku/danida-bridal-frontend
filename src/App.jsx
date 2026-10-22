import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'

import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Topbar from './components/Topbar'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DressList from './pages/dresses/DressList'
import DressDetail from './pages/dresses/DressDetail'
import DressForm from './pages/dresses/DressForm'
import UpdateDress from './pages/dresses/UpdateDress'
import ReportDamage from './pages/dresses/ReportDamage'
import DressDamages from './pages/dresses/DressDamages'
import DamagedDresses from './pages/dresses/DamagedDresses'
import Categories from './pages/categories/Categories'
import ChangePassword from './pages/ChangePassword'
import AdminRoute from './components/AdminRoute'
import Employees from './pages/Employees'

function Layout() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <div className="min-h-screen pl-56">
        <Topbar />

        <main className="mx-auto max-w-[1600px] px-5 py-6 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Everything below requires login */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route element={<AdminRoute />}>
                <Route path="/employees" element={<Employees />} />
              </Route>

              <Route path="/dresses" element={<DressList />} />
              <Route path="/dresses/damaged" element={<DamagedDresses />} />
              <Route path="/dresses/create" element={<DressForm />} />
              <Route path="/dresses/:id" element={<DressDetail />} />
              <Route path="/dresses/:id/edit" element={<UpdateDress />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/dresses/:id/damages/new" element={<ReportDamage />} />
              <Route path="/dresses/:id/damages" element={<DressDamages />} />
              <Route path="/change-password" element={<ChangePassword />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App