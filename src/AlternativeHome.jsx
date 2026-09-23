import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./AlternativeHome.css";

const categories = ["All", "Fashion", "Electronics", "Beauty", "Home", "Grocery"];
const fallbackProducts = [
  { _id: "alt-1", name: "AirFlex noise-cancelling headphones", category: "Electronics", price: 2499, rating: 4.8, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80" },
  { _id: "alt-2", name: "Everyday comfort sneakers", category: "Fashion", price: 1899, rating: 4.7, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80" },
  { _id: "alt-3", name: "Glow essentials skincare kit", category: "Beauty", price: 999, rating: 4.6, image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=700&q=80" },
  { _id: "alt-4", name: "Soft light ceramic lamp", category: "Home", price: 1299, rating: 4.5, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=80" },
];

function AlternativeHome() {
  const [products, setProducts] = useState(fallbackProducts);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem("nova-cart") || "[]"));
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem("nova-wishlist") || "[]"));
  const [loadError, setLoadError] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    axios.get("/api/products")
      .then(({ data }) => {
        const apiProducts = Array.isArray(data) ? data : data?.products;
        if (Array.isArray(apiProducts) && apiProducts.length) setProducts(apiProducts);
      })
      .catch(() => setLoadError("Showing our featured collection while the catalog reconnects."));
  }, []);

  useEffect(() => {
    localStorage.setItem("nova-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("nova-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const getCsrfToken = async () => (await axios.get("/api/csrf", { withCredentials: true })).data.token;

  const submitAuth = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const token = await getCsrfToken();
      await axios.post(`/api/auth/${authMode}`, authForm, {
        withCredentials: true,
        headers: { "x-csrf-token": token },
      });
      setAuthOpen(false);
      setAuthForm({ name: "", email: "", password: "" });
      setToast("You are signed in.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to sign in.");
    }
  };

  const checkout = async () => {
    try {
      const token = await getCsrfToken();
      const grouped = cart.reduce((items, item) => {
        const found = items.find((entry) => entry.product === item._id);
        if (found) found.quantity += 1;
        else items.push({ product: item._id, quantity: 1 });
        return items;
      }, []);
      const { data } = await axios.post("/api/payments/create-checkout-session", { items: grouped }, {
        withCredentials: true,
        headers: { "x-csrf-token": token },
      });
      window.location.href = data.checkoutUrl;
    } catch (error) {
      setToast(error.response?.data?.message || "Sign in before checkout.");
      setAuthOpen(true);
    }
  };

  const cartTotal = cart.reduce((total, item) => total + item.price, 0);

  const visibleProducts = useMemo(() => products.filter((product) => {
    const matchesSearch = `${product.name} ${product.category}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (category === "All" || product.category === category);
  }), [products, search, category]);

  return (
    <div className="marketplace">
      <div className="market-strip">Free delivery over ₹999 <span>·</span> Easy 7-day returns <span>·</span> Secure payments</div>
      <header className="market-header">
        <a className="market-logo" href="/"><span>n</span>nova<span className="logo-dot">.</span></a>
        <nav>
          <button onClick={() => setCategory("All")}>All products</button>
          <button onClick={() => setCategory("Fashion")}>Fashion</button>
          <button onClick={() => setCategory("Electronics")}>Tech</button>
          <button onClick={() => setCategory("Home")}>Home</button>
        </nav>
        <label className="market-search">
          <span>⌕</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products and brands" />
        </label>
        <button className="nova-login" type="button" onClick={() => setAuthOpen(true)}>Sign in</button>
        <button className="header-action" type="button" aria-label="Wishlist">♡ <small>{wishlist.length}</small></button>
        <button className="header-action" type="button" aria-label="Shopping bag" onClick={() => setCartOpen(true)}>▢ <small>{cart.length}</small></button>
      </header>

      <main>
        <section className="market-hero">
          <div className="hero-panel">
            <p className="market-kicker">THE NEW EVERYDAY</p>
            <h1>More choice.<br /><i>Less searching.</i></h1>
            <p>Discover well-loved brands, clever finds, and everyday essentials in one calm, simple marketplace.</p>
            <button className="market-primary" onClick={() => document.querySelector(".catalog").scrollIntoView({ behavior: "smooth" })}>Explore the edit <span>→</span></button>
          </div>
          <div className="hero-collage">
            <div className="hero-shape shape-one" />
            <div className="hero-shape shape-two" />
            <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85" alt="Curated clothing collection" />
            <span className="hero-sticker">NEW<br /><b>DROP</b></span>
          </div>
        </section>

        <section className="promise-row">
          <div><b>✦</b><span><strong>Curated, not crowded</strong><small>Quality finds, fewer tabs.</small></span></div>
          <div><b>↗</b><span><strong>Value that makes sense</strong><small>Transparent prices always.</small></span></div>
          <div><b>✓</b><span><strong>Shopping protected</strong><small>Your details stay private.</small></span></div>
        </section>

        <section className="catalog">
          <div className="catalog-heading">
            <div><p className="market-kicker">DISCOVER YOUR NEXT</p><h2>Popular right now</h2></div>
            <span>{visibleProducts.length} products</span>
          </div>
          <div className="category-pills">
            {categories.map((item) => <button className={category === item ? "selected" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}
          </div>
          {loadError && <p className="catalog-notice" role="status">{loadError}</p>}
          <div className="market-grid">
            {visibleProducts.map((product) => (
              <article className="market-card" key={product._id}>
                <div className="market-image">
                  <img src={product.image} alt={product.name} />
                  <button type="button" aria-label={wishlist.includes(product._id) ? "Remove from wishlist" : "Add to wishlist"} className={wishlist.includes(product._id) ? "heart saved" : "heart"} onClick={() => setWishlist((items) => items.includes(product._id) ? items.filter((id) => id !== product._id) : [...items, product._id])}>♥</button>
                </div>
                <p>{product.category}</p>
                <h3>{product.name}</h3>
                <div className="market-card-footer"><strong>₹{product.price}</strong><span>★ {product.rating || "4.5"}</span></div>
                <button type="button" className="add-button" onClick={() => { setCart((items) => [...items, product]); setToast(`${product.name} added to your bag.`); }}>Add to bag +</button>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="market-footer"><strong><span>n</span> nova.</strong><span>Original marketplace concept · secure checkout ready</span><a href="/">Return to Luma</a></footer>
      {cartOpen && (
        <div className="nova-overlay" onClick={() => setCartOpen(false)} role="presentation">
          <aside className="nova-drawer" onClick={(event) => event.stopPropagation()}>
            <button className="nova-close" type="button" onClick={() => setCartOpen(false)}>×</button>
            <p className="market-kicker">YOUR PICKS</p><h2>Your bag</h2>
            {cart.length ? <><div className="nova-items">{cart.map((item, index) => <div className="nova-item" key={`${item._id}-${index}`}><img src={item.image} alt="" /><span>{item.name}<b>₹{item.price}</b></span></div>)}</div><div className="nova-total"><span>Total</span><strong>₹{cartTotal}</strong></div><button className="market-primary nova-checkout" type="button" onClick={checkout}>Checkout securely →</button></> : <p>Your bag is waiting for something good.</p>}
          </aside>
        </div>
      )}
      {authOpen && (
        <div className="nova-overlay" onClick={() => setAuthOpen(false)} role="presentation">
          <form className="nova-modal" onSubmit={submitAuth} onClick={(event) => event.stopPropagation()}>
            <button className="nova-close" type="button" onClick={() => setAuthOpen(false)}>×</button>
            <p className="market-kicker">SECURE ACCOUNT</p><h2>{authMode === "login" ? "Welcome back." : "Create your account."}</h2>
            {authMode === "register" && <input required placeholder="Name" value={authForm.name} onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })} />}
            <input required type="email" placeholder="Email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} />
            <input required minLength="8" type="password" placeholder="Password (8+ characters)" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} />
            {message && <p className="nova-error">{message}</p>}
            <button className="market-primary nova-checkout" type="submit">{authMode === "login" ? "Sign in" : "Register"} →</button>
            <button className="nova-switch" type="button" onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}>{authMode === "login" ? "Create an account" : "Sign in instead"}</button>
          </form>
        </div>
      )}
      {toast && <div className="nova-toast">{toast}</div>}
    </div>
  );
}

export default AlternativeHome;
