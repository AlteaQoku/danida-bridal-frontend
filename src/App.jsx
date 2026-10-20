
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar'
import Topbar from './components/Topbar'

import Dashboard from './pages/Dashboard'
import DressList from './pages/dresses/DressList'
import DressDetail from './pages/dresses/DressDetail'
import DressForm from './pages/dresses/DressForm'
import UpdateDress from './pages/dresses/UpdateDress'
import ReportDamage from './pages/dresses/ReportDamage'
import DressDamages from './pages/dresses/DressDamages'
import DamagedDresses from './pages/dresses/DamagedDresses'
import Categories from './pages/categories/Categories'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[var(--background)]">
        <Navbar />

        <div className="min-h-screen pl-56">
          <Topbar />

          <main className="mx-auto max-w-[1600px] px-5 py-6 sm:px-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />

              <Route path="/dresses" element={<DressList />} />
              <Route path="/dresses/damaged" element={<DamagedDresses />} />
              <Route path="/dresses/create" element={<DressForm />} />
              <Route path="/dresses/:id" element={<DressDetail />} />
              <Route path="/dresses/:id/edit" element={<UpdateDress />} />
              <Route path="/categories" element={<Categories />} />
              <Route
                path="/dresses/:id/damages/new"
                element={<ReportDamage />}
              />
              <Route
                path="/dresses/:id/damages"
                element={<DressDamages />}
              />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
