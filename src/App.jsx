import './App.css'
import { useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './layout/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import Dettagli from './pages/Details.jsx'
import Shop from './pages/Shop.jsx'
import Contact from './pages/Contact.jsx'
import Wishlist from './pages/Wishlist.jsx'
import Staff from './pages/Staff.jsx'
import NotFoundPages from './pages/NotFoundPages.jsx'
import EmailSender from './components/EmailSender.jsx'
import './styles/components/SwalDark.css'

function App () {
  const [showWelcome, setShowWelcome] = useState(() => {
    try {
      return !localStorage.getItem('hasSeenWelcome')
    } catch (e) {
      console.warn('Error checking welcome popup flag', e)
      return false
    }
  })

  const closeWelcome = () => {
    try {
      localStorage.setItem('hasSeenWelcome', 'true')
    } catch (e) {
      console.warn('Could not set hasSeenWelcome', e)
    }
    setShowWelcome(false)
  }

  return (
    <>
      {showWelcome && <EmailSender onClose={closeWelcome} />}
      <BrowserRouter>
        <Routes>
          <Route path='/details/:slug' element={<Dettagli />} />
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />

            {/* 🟣 SHOP + VARIANTI */}
            <Route path='/shop' element={<Shop />} />
            <Route path='/shop/cart' element={<Shop defaultTab="cart" />} />
            <Route path='/shop/checkout' element={<Shop defaultTab="checkout" />} />

            <Route path='/wishlist' element={<Wishlist />} />
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
