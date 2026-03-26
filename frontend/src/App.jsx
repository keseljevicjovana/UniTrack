import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Layout from './components/Layout/Layout'
import Pocetna from './pages/Pocetna/Pocetna'
import MojUcinak from './pages/MojUcinak/MojUcinak'
import RangLista from './pages/RangLista/RangLista'
import Vauceri from './pages/Vauceri/Vauceri'
import DigitalniCV from './pages/DigitalniCV/DigitalniCV'
import Podesavanja from './pages/Podesavanja/Podesavanja'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/pocetna" replace />} />
          <Route path="pocetna" element={<Pocetna />} />
          <Route path="moj-ucinak" element={<MojUcinak />} />
          <Route path="rang-lista" element={<RangLista />} />
          <Route path="vauceri" element={<Vauceri />} />
          <Route path="digitalni-cv" element={<DigitalniCV />} />
          <Route path="podesavanja" element={<Podesavanja />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
