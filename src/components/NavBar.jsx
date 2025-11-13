function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="./img/" alt="Logo" className="logo-icon" />
      </div>

      <ul className="navbar-links">
        <li><a href="/shop">Shop</a></li>
        <li><a href="/categories">Categories</a></li>
        <li><a href="/daily-quests">Daily Quests</a></li>
      </ul>

      <div className="navbar-actions">
        <span className="cart-icon">🛒</span> 
        
        <button className="btn-levelup">Level Up!</button>
      </div>
    </nav>
  );
}

export default NavBar;