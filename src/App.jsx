import { BrowserRouter, Routes } from "react-router-dom"
import Navbar from './components/Navbar'
import DressList from './pages/dresses/DressList'
import { Route } from "react-router-dom"
import DressDetail from "./pages/dresses/DressDetail"
import DressForm from "./pages/dresses/DressForm"
import Dashboard from './pages/Dashboard'
import UpdateDress from './pages/dresses/UpdateDress'
import ReportDamage from './pages/dresses/ReportDamage'
import DressDamages from './pages/dresses/DressDamages'
import DamagedDresses from './pages/dresses/DamagedDresses'

function App(){
    return(
        <BrowserRouter>
  <Navbar />
  <div className="max-w-6xl mx-auto px-6 py-8">
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dresses" element={<DressList />} />
      <Route path="/dresses/damaged" element={<DamagedDresses />} />
      <Route path="/dresses/create" element={<DressForm />} />
      <Route path="/dresses/:id" element={<DressDetail />} />
      <Route path="/dresses/:id/edit" element={<UpdateDress />} />
      <Route path="/dresses/:id/damages/new" element={<ReportDamage />} />
      <Route path="/dresses/:id/damages" element={<DressDamages />} />
    </Routes>
  </div>
</BrowserRouter>
    )
}

export default App