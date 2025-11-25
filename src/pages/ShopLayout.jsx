import { Outlet, NavLink } from "react-router-dom";
import "../styles/pages/ShopLayout.css";

function ShopLayout() {
  return (
    <div className="shop-layout-container">

      {/* MENU LATERALE SINISTRO */}
      <aside className="shop-left-menu">
        <NavLink to="/shop" className="menu-item">SHOP</NavLink>
        <NavLink to="/cart" className="menu-item">CARRETTO</NavLink>
        <NavLink to="/checkout" className="menu-item">CHECKOUT</NavLink>
      </aside>

      {/* AREA CONTENUTI */}
      <main className="shop-right-panel">
        <Outlet />
      </main>

    </div>
  );
}

export default ShopLayout;
