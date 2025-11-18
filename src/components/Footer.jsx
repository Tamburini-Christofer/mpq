import './Footer.css'
import { FaInstagram } from "react-icons/fa";
import { MdMailOutline } from "react-icons/md";
import { FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

function Footer() {

  return (
    <>
      <footer className="app-footer">
        <div className="footer-content">

          <div className="footer-links-section">
            {/* aggiungere contenuti come link ad altre sezioniu, se e quando necessario */}
          </div>

          <div className="footer-divider" />

          <div className="footer-bottom">

            <div className="social-icons">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <span role="img" aria-label="Instagram"><FaInstagram /></span>
              </a>
              <a href="https://gmail.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <span role="img" aria-label="Gmail"><MdMailOutline /></span>
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <span role="img" aria-label="Facebook"><FaFacebook /></span>
              </a>
              <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                <span role="img" aria-label="X"><FaXTwitter /></span>
              </a>
            </div>

            <p className="footer-copyright">
              &copy; 2025 My Pocket Quest! All rights reserved.
            </p>

          </div>
        </div>
      </footer>
    </>
  );
}

export default Footer;