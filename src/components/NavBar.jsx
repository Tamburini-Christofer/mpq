import './NavBar.css'
import { NavLink } from 'react-router-dom';
import { FaShoppingCart } from "react-icons/fa";

function NavBar() {

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <NavLink to="/">
            <img src="./src/img/Logo_no_bg.png" alt="Logo" className="logo-icon" />
          </NavLink>
        </div>

        <ul className="navbar-links">
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/shop">Shop</NavLink></li>
          {/* <li><NavLink to="/categories">Categories</NavLink></li> */}
          <li><NavLink to="/staff">Staff</NavLink></li>
          <li><NavLink to="/contatti">Assistenza</NavLink></li>
        </ul>

        <div className="navbar-actions">
          <span className="cart-icon"><FaShoppingCart /></span>

          <button className="btn-levelup">Level Up!</button>
        </div>
      </nav>
    </>
  );
}

export default NavBar;