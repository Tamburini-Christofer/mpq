//todo Importo il file css contenente gli stili globali
import './App.css'
//todo Importo i componenti necessari da react-router-dom
import { BrowserRouter, Route, Routes } from 'react-router-dom'
//todo Importo il layout principale dell'applicazione
import Layout from './layout/Layout.jsx'
//todo Improto componenti delle pagine
import HomePage from './pages/HomePage.jsx'
//todo Importo la pagina Dettagli
import Dettagli from './pages/Details.jsx'
//todo importo la pagina Shop
import Shop from './pages/Shop.jsx'
//todo Importo la pagina NotFoundPage
import NotFoundPages from './pages/NotFoundPages.jsx'

function App() {

  return (
    <>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path='/exp/:id' element={<Dettagli />} />
                <Route path='/shop' element={<Shop />} />
                <Route path='*' element={<NotFoundPages />} />
              </Route>
            </Routes>
          </BrowserRouter>
    </>
  )
}

export default App
