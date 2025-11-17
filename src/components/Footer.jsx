import './Footer.css'

function Footer() {
  // L'anno corrente può essere calcolato dinamicamente, un tocco in più
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="app-footer">
        <div className="footer-content">

          {/* Potremmo aggiungere colonne di link qui, ma per ora teniamo solo l'essenziale */}
          <div className="footer-links-section">
            {/* Spazio per future sezioni: About Us, Privacy Policy, Terms */}
            {/* <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a> */}
          </div>

          {/* Sezione Social/Copyright */}
          <div className="footer-bottom">

            {/* Icone Social che si vedono in basso a destra nella homepage.jpg */}
            <div className="social-icons">
              {/* Usiamo dei placeholder per le icone, che potresti sostituire con Font Awesome o SVG */}
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <span role="img" aria-label="Twitter">🐦</span>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <span role="img" aria-label="Instagram">📸</span>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <span role="img" aria-label="Facebook">📘</span>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <span role="img" aria-label="YouTube">▶️</span>
              </a>
            </div>

            <p className="footer-copyright">
              &copy; {currentYear} My Pocket Quest! All rights reserved.
            </p>

          </div>
        </div>
      </footer>

    </>
  );
}

export default Footer;