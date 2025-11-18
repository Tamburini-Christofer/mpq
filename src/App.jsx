//todo Importo il file css contenente gli stili globali
import './App.css'
//todo Importo useState per gestire lo stato del modal di benvenuto
import { useState, useEffect } from 'react'
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
//todo Importo la pagina Contatti
import Contact from './pages/Contact.jsx'
//todo Importo la pagina Staff
import Staff from './pages/Staff.jsx'
//todo Importo la pagina NotFoundPage
import NotFoundPages from './pages/NotFoundPages.jsx'
//todo Importo il componente EmailSender per il modal di benvenuto
import EmailSender from './components/EmailSender.jsx'

function App() {
  //todo Stato per controllare se mostrare il modal di benvenuto
  const [showWelcome, setShowWelcome] = useState(false)
  
  //todo Al primo caricamento controllo se l'utente ha già visto il modal
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome')
    if (!hasSeenWelcome) {
      setShowWelcome(true)
    }
  }, [])
  
  //todo Funzione per chiudere il modal e salvare la preferenza
  const handleCloseWelcome = () => {
    setShowWelcome(false)
    localStorage.setItem('hasSeenWelcome', 'true')
  }

  return (
    <>
      {/* todo: Modal di benvenuto con EmailSender */}
      {showWelcome && (
        <div className="welcome-modal-overlay">
          <EmailSender onClose={handleCloseWelcome} />
        </div>
      )}
      
      <BrowserRouter>
        <Routes>
          <Route path='/exp/:id' element={<Dettagli />} />
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path='/shop' element={<Shop />} />
            <Route path='/contatti' element={<Contact />} />
            <Route path='/staff' element={<Staff />} />
            <Route path='*' element={<NotFoundPages />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
