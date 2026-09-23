import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function readStoredArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage can be unavailable when the app is opened directly from a file.
    }
    return [];
  }
}

function writeStoredArray(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // The in-memory cart and wishlist continue to work for the current session.
  }
}

function createImageFallback(name, category) {
  const safeName = String(name).replace(/[<>&"]/g, "");
  const safeCategory = String(category).replace(/[<>&"]/g, "");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800"><rect width="800" height="800" fill="#e9e4df"/><circle cx="640" cy="160" r="260" fill="#d9cbe8"/><text x="60" y="110" fill="#7055d7" font-family="Arial" font-size="28" font-weight="700">${safeCategory.toUpperCase()}</text><text x="60" y="660" fill="#211d2b" font-family="Arial" font-size="46" font-weight="700">${safeName}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function handleImageError(event, product) {
  const fallback = createImageFallback(product.name, product.category);
  if (event.currentTarget.src !== fallback) {
    event.currentTarget.onerror = null;
    event.currentTarget.src = fallback;
  }
}

const categories = [
  { name: "All", icon: "✦" },
  { name: "Fashion", icon: "◌" },
  { name: "Electronics", icon: "⌁" },
  { name: "Beauty", icon: "✧" },
  { name: "Home", icon: "⌂" },
  { name: "Grocery", icon: "◒" },
];

const brandsByCategory = {
  Fashion: ["Levi's", "Puma", "Van Heusen", "Roadster"],
  Electronics: ["boAt", "JBL", "Logitech", "Philips"],
  Beauty: ["Lakmé", "NIVEA", "Maybelline", "Mamaearth"],
  Home: ["Prestige", "Milton", "Wakefit", "IKEA"],
  Grocery: ["Tata", "Amul", "Britannia", "Fortune"],
};

const demoProducts = [
  {
    _id: "1",
    name: "Noise-cancelling headphones",
    price: 799,
    oldPrice: 1499,
    category: "Electronics",
    brand: "boAt",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviews: 1240,
    badge: "Bestseller",
  },
  {
    _id: "2",
    name: "Everyday leather sneakers",
    price: 699,
    oldPrice: 1199,
    category: "Fashion",
    brand: "Puma",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    rating: 4.6,
    reviews: 864,
    badge: "Trending",
  },
  {
    _id: "3",
    name: "Glow essentials skincare set",
    price: 399,
    oldPrice: 699,
    category: "Beauty",
    brand: "Lakmé",
    image: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    reviews: 532,
    badge: "New drop",
  },
  {
    _id: "4",
    name: "Sculptural ceramic table lamp",
    price: 549,
    oldPrice: 899,
    category: "Home",
    brand: "IKEA",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80",
    rating: 4.5,
    reviews: 318,
    badge: "Editor's pick",
  },
  {
    _id: "5", name: "Everyday cotton oversized tee", price: 299, oldPrice: 499,
    category: "Fashion", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80", rating: 4.6, reviews: 740, badge: "Best value",
  },
  {
    _id: "6", name: "Compact fast-charge power bank", price: 599, oldPrice: 899,
    category: "Electronics", image: "https://images.unsplash.com/photo-1609592424769-5c2d6c8c3a9c?auto=format&fit=crop&w=800&q=80", rating: 4.5, reviews: 421, badge: "Deal",
  },
  {
    _id: "7", name: "Hydrating lip and cheek tint", price: 249, oldPrice: 399,
    category: "Beauty", image: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80", rating: 4.7, reviews: 308, badge: "Trending",
  },
  {
    _id: "8", name: "Soft touch cushion cover", price: 199, oldPrice: 349,
    category: "Home", image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80", rating: 4.4, reviews: 186, badge: "Under ₹299",
  },
  {
    _id: "9", name: "Organic roasted coffee beans", price: 349, oldPrice: 499,
    category: "Grocery", image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80", rating: 4.8, reviews: 515, badge: "Fresh pick",
  },
  {
    _id: "10", name: "Minimal everyday backpack", price: 899, oldPrice: 1399,
    category: "Fashion", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80", rating: 4.6, reviews: 267, badge: "Popular",
  },
];

const productImages = {
  "Relaxed linen shirt": "photo-1521572163474-6864f9cf17ab",
  "Classic canvas tote": "photo-1553062407-98eeb64c6a62",
  "Daily comfort joggers": "photo-1518611012118-696072aa579a",
  "Soft knit cardigan": "photo-1515886657613-9f3515b0c78f",
  "Mini wireless speaker": "photo-1505740420928-5e560c06d30e",
  "USB desk fan": "photo-1581091226825-a6a2a5aee158",
  "Smart LED bulb": "photo-1550989460-0adf9ea622e2",
  "Ergonomic mouse": "photo-1527814050087-3793815479db",
  "Velvet matte lipstick": "photo-1586495777744-4413f21062fa",
  "Aloe face wash": "photo-1556229010-6c3f2c9ca5f8",
  "Nourishing hair mask": "photo-1522337360788-8b13dee7a37e",
  "Fresh body mist": "photo-1596462502278-27bfdc403348",
  "Bamboo storage basket": "photo-1595428774223-ef52624120d2",
  "Cotton hand towel": "photo-1583845112203-454c7b4b1f6a",
  "Modern wall clock": "photo-1563861826100-9cb868fdbe1c",
  "Wooden serving tray": "photo-1610701596007-11502861dcfa",
  "Trail mix snack pack": "photo-1599599810769-bcde5a160d32",
  "Cold pressed cooking oil": "photo-1474979266404-7eaacbcd87c5",
  "Premium green tea": "photo-1556679343-c7306c1976bc",
  "Multigrain breakfast oats": "photo-1517093728432-a0440f8d45af",
};

const generatedCatalog = Array.from({ length: 290 }, (_, index) => {
  const productNumber = index + 11;
  const category = categories[(index % (categories.length - 1)) + 1].name;
  const names = {
    Fashion: ["Relaxed linen shirt", "Classic canvas tote", "Daily comfort joggers", "Soft knit cardigan"],
    Electronics: ["Mini wireless speaker", "USB desk fan", "Smart LED bulb", "Ergonomic mouse"],
    Beauty: ["Velvet matte lipstick", "Aloe face wash", "Nourishing hair mask", "Fresh body mist"],
    Home: ["Bamboo storage basket", "Cotton hand towel", "Modern wall clock", "Wooden serving tray"],
    Grocery: ["Trail mix snack pack", "Cold pressed cooking oil", "Premium green tea", "Multigrain breakfast oats"],
  };
  const brand = brandsByCategory[category][index % brandsByCategory[category].length];
  const name = names[category][index % names[category].length];
  const price = 149 + ((index * 73) % 751);
  return {
    _id: `generated-${productNumber}`,
    name: `${name} ${productNumber}`,
    price,
    oldPrice: price + 150 + (index % 4) * 100,
    category,
    brand,
    sellerType: "Brand reference",
    image: `https://images.unsplash.com/${productImages[name]}?auto=format&fit=crop&w=800&q=80`,
    rating: Number((4.2 + (index % 8) / 10).toFixed(1)),
    reviews: 50 + (index * 17) % 900,
    badge: index % 5 === 0 ? "Under ₹499" : "Curated",
  };
});

const fullDemoCatalog = [...demoProducts, ...generatedCatalog];

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [page, setPage] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [cart, setCart] = useState(() => {
    const payment = new URLSearchParams(window.location.search).get("payment");
    if (payment === "success") {
      localStorage.removeItem("luma-cart");
      return [];
    }
    return readStoredArray("luma-cart");
  });
  const [wishlist, setWishlist] = useState(() => readStoredArray("luma-wishlist"));
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orders] = useState([]);
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authMessage, setAuthMessage] = useState("");
  const [toast, setToast] = useState("");
  const [timeLeft, setTimeLeft] = useState(5 * 60 * 60 + 38 * 60 + 42);

  useEffect(() => {
    axios
      .get(`${API_URL}/api/products`)
      .then(({ data }) => {
        const apiProducts = Array.isArray(data) ? data : Array.isArray(data?.products) ? data.products : [];
        setProducts(apiProducts.length ? [...apiProducts, ...generatedCatalog] : fullDemoCatalog);
      })
      .catch(() => {
        setProducts(fullDemoCatalog);
        setLoadError("We’re showing our featured collection while the catalog reconnects.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    writeStoredArray("luma-cart", cart);
  }, [cart]);

  useEffect(() => {
    writeStoredArray("luma-wishlist", wishlist);
  }, [wishlist]);

  useEffect(() => {
    const payment = new URLSearchParams(window.location.search).get("payment");
    if (payment === "success") {
      const timer = window.setTimeout(() => setToast("Payment received. Your order is confirmed."), 0);
      window.history.replaceState({}, "", window.location.pathname);
      return () => window.clearTimeout(timer);
    } else if (payment === "cancelled") {
      const timer = window.setTimeout(() => setToast("Payment cancelled. Your bag is still saved."), 0);
      window.history.replaceState({}, "", window.location.pathname);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft((time) => (time > 0 ? time - 1 : 5 * 60 * 60 + 38 * 60 + 42));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        document.querySelector(".search-box input")?.focus();
      }
    };
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  const filteredProducts = useMemo(() => {
    const result = products.filter((product) => {
      const searchable = `${product.name} ${product.category}`.toLowerCase();
      return (
        searchable.includes(search.toLowerCase()) &&
        (category === "All" || product.category === category)
      );
    });

    return [...result].sort((a, b) => {
      if (sort === "price-low") return a.price - b.price;
      if (sort === "price-high") return b.price - a.price;
      if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
      return 0;
    });
  }, [products, search, category, sort]);

  const addToCart = (product) => {
    setCart((items) => [...items, product]);
    setToast(`${product.name} added to your bag`);
  };

  const getCsrfToken = async () => {
    const { data } = await axios.get(`${API_URL}/api/csrf`, { withCredentials: true });
    return data.token;
  };

  const submitAuth = async (event) => {
    event.preventDefault();
    setAuthMessage("");
    try {
      const token = await getCsrfToken();
      const endpoint = authMode === "login" ? "login" : "register";
      await axios.post(`${API_URL}/api/auth/${endpoint}`, authForm, {
        withCredentials: true,
        headers: { "x-csrf-token": token }
      });
      setAuthOpen(false);
      setAuthForm({ name: "", email: "", password: "" });
      setToast("You are signed in — welcome to Luma");
    } catch (error) {
      setAuthMessage(error.response?.data?.message || "Something went wrong");
    }
  };

  const placeOrder = async () => {
    try {
      const token = await getCsrfToken();
      const grouped = cart.reduce((items, item) => {
        const found = items.find((entry) => entry.product === item._id);
        if (found) found.quantity += 1;
        else items.push({ product: item._id, quantity: 1 });
        return items;
      }, []);
      const { data } = await axios.post(`${API_URL}/api/payments/create-checkout-session`, { items: grouped }, {
        withCredentials: true,
        headers: { "x-csrf-token": token }
      });
      setCheckoutOpen(false);
      setCartOpen(false);
      window.location.href = data.checkoutUrl;
    } catch (error) {
      setToast(error.response?.data?.message || "Sign in before placing an order");
      setAuthOpen(true);
    }
  };

  const toggleWishlist = (id) => {
    setWishlist((items) =>
      items.includes(id) ? items.filter((item) => item !== id) : [...items, id],
    );
  };

  const formatTime = (value) => {
    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;
    return [hours, minutes, seconds].map((unit) => String(unit).padStart(2, "0"));
  };

  const [hours, minutes, seconds] = formatTime(timeLeft);
  const cartTotal = cart.reduce((total, item) => total + item.price, 0);
  const navigate = (nextPage, nextCategory = category) => {
    setPage(nextPage);
    setCategory(nextCategory);
    setMobileMenuOpen(false);
  };

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div className="announcement">
        <span>✦</span> The everyday edit is here — free delivery on orders over ₹999
        <button type="button">Explore the edit <span>↗</span></button>
      </div>

      <header className="navbar">
        <a className="brand" href="/" aria-label="Luma home">
          <span className="brand-mark">L</span>
          <span>luma<span className="brand-dot">.</span></span>
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <button type="button" onClick={() => navigate("home")}>Home</button>
          <button type="button" onClick={() => navigate("shop", "All")}>Shop</button>
          <button type="button" onClick={() => { navigate("deals"); setSort("price-low"); }}>Deals</button>
          <button type="button" onClick={() => navigate("shop", "Fashion")}>Fashion</button>
          <button type="button" onClick={() => navigate("shop", "Electronics")}>Tech</button>
          <button type="button" onClick={() => navigate("orders")}>Orders</button>
        </nav>
        <div className="nav-actions">
          <button className="menu-toggle" type="button" aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation" onClick={() => setMobileMenuOpen((open) => !open)}>☰<span className="sr-only">Menu</span></button>
          <label className="search-box">
            <span aria-hidden="true">⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search anything..."
              aria-label="Search products"
            />
            <kbd>⌘ K</kbd>
          </label>
          <button className="round-action" type="button" aria-label="Account" title={`${orders.length} orders`} onClick={() => setAuthOpen(true)}>♙</button>
          <button
            className="bag-action"
            type="button"
            onClick={() => setCartOpen(true)}
            aria-label={`Shopping bag with ${cart.length} items`}
          >
            ♧<span>{cart.length}</span>
          </button>
        </div>
      </header>
      {mobileMenuOpen && (
        <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">
          <button type="button" onClick={() => navigate("home")}>Home</button>
          <button type="button" onClick={() => navigate("shop", "All")}>Shop all</button>
          <button type="button" onClick={() => { navigate("deals"); setSort("price-low"); }}>Deals</button>
          <button type="button" onClick={() => navigate("shop", "Fashion")}>Fashion</button>
          <button type="button" onClick={() => navigate("shop", "Electronics")}>Tech</button>
          <button type="button" onClick={() => navigate("orders")}>Orders</button>
        </nav>
      )}

      <main id="main-content" className={`page-${page}`}>
        <section className="hero-section">
          <div className="hero-copy">
            <p className="eyebrow">A BETTER WAY TO SHOP</p>
            <h1>Good things<br /><em>find you.</em></h1>
            <p className="hero-description">
              Curated essentials, unexpected finds, and everything in between.
              One thoughtful marketplace for your whole world.
            </p>
            <div className="hero-actions">
              <button
                className="primary-button"
                type="button"
                onClick={() => document.querySelector(".collection-section").scrollIntoView({ behavior: "smooth" })}
              >
                Start exploring <span>→</span>
              </button>
              <button className="text-button" type="button" onClick={() => setCategory("Fashion")}>
                See what&apos;s new <span>↗</span>
              </button>
            </div>
            <div className="social-proof">
              <div className="avatar-stack">
                <span>AN</span><span>MK</span><span>RS</span><span>+2k</span>
              </div>
              <p><strong>Loved by 2,000+</strong><br />curious shoppers this month</p>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-glow" />
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="hero-product-card card-back">
              <span>NEW ARRIVAL</span>
              <strong>Essentials<br />for your<br /><i>everyday.</i></strong>
            </div>
            <div className="hero-product-card card-front">
              <img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85" alt="Curated fashion collection" onError={(event) => handleImageError(event, { name: "Curated fashion collection", category: "Luma edit" })} />
              <div><span>THE DAILY EDIT</span><strong>01 / 04</strong></div>
            </div>
            <span className="floating-star star-one">✦</span>
            <span className="floating-star star-two">✧</span>
          </div>
        </section>

        <section className="category-section" aria-label="Shop by category">
          <div className="section-intro">
            <p className="eyebrow">SHOP BY MOOD</p>
            <h2>Find your kind of <em>thing.</em></h2>
          </div>
          <div className="category-grid">
            {categories.slice(1).map((item, index) => (
              <button
                className={`category-tile tile-${index + 1}`}
                type="button"
                key={item.name}
                onClick={() => setCategory(item.name)}
              >
                <span className="category-icon">{item.icon}</span>
                <span>{item.name}</span>
                <small>Explore <span>↗</span></small>
              </button>
            ))}
          </div>
        </section>

        <section className="deal-banner">
          <div>
            <p className="eyebrow">LIMITED TIME ONLY</p>
            <h2>Little luxuries.<br /><em>Better prices.</em></h2>
            <p>Up to 60% off on the things you&apos;ve been eyeing.</p>
          </div>
          <div className="countdown" aria-label="Deal ends in">
            <div><strong>{hours}</strong><span>hours</span></div>
            <b>:</b>
            <div><strong>{minutes}</strong><span>minutes</span></div>
            <b>:</b>
            <div><strong>{seconds}</strong><span>seconds</span></div>
          </div>
          <button className="light-button" type="button" onClick={() => document.querySelector(".collection-section").scrollIntoView({ behavior: "smooth" })}>
            Shop the sale <span>→</span>
          </button>
        </section>

        {page === "orders" && (
          <section className="orders-page">
            <p className="eyebrow">YOUR LUMA JOURNEY</p>
            <h2>Order history.</h2>
            {orders.length ? orders.map((order) => <article className="order-row" key={order._id}><span>Order placed</span><strong>₹{order.total}</strong><small>{order.status}</small></article>) : <p className="empty-state">Sign in and place your first order to see it here.</p>}
          </section>
        )}
        <section className="collection-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CURATED FOR YOU</p>
              <h2>Today&apos;s good finds.</h2>
            </div>
            <div className="collection-controls">
              <span>{filteredProducts.length} finds</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products">
                <option value="featured">Featured</option>
                <option value="rating">Top rated</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </div>
          </div>
          <div className="filter-row">
            {categories.map((item) => (
              <button
                className={category === item.name ? "active-filter" : ""}
                type="button"
                key={item.name}
                onClick={() => setCategory(item.name)}
              >
                {item.icon} {item.name}
              </button>
            ))}
          </div>
          {loadError && <div className="catalog-notice" role="status">{loadError}</div>}
          {loading ? (
            <div className="loading-grid" aria-label="Loading products">
              {Array.from({ length: 8 }, (_, index) => <div className="skeleton-card" key={index} />)}
            </div>
          ) : <div className="products-grid">
            {filteredProducts.map((product) => (
              <article className="product-card" key={product._id}>
                <div className="product-image">
                  <img src={product.image} alt={product.name} onError={(event) => handleImageError(event, product)} />
                  <span className="product-badge">{product.badge || "Curated"}</span>
                  <button
                    className={`wishlist ${wishlist.includes(product._id) ? "saved" : ""}`}
                    type="button"
                    onClick={() => toggleWishlist(product._id)}
                    aria-label={wishlist.includes(product._id) ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    {wishlist.includes(product._id) ? "♥" : "♡"}
                  </button>
                </div>
                <div className="product-info">
                  <div className="product-meta"><span>{product.brand || "Independent seller"} · {product.category}</span><span>★ {product.rating || "4.5"} <small>({product.reviews || 120})</small></span></div>
                  <h3>{product.name}</h3>
                  <div className="product-footer">
                    <div><strong>₹{product.price}</strong><del>₹{product.oldPrice || Math.round(product.price * 1.4)}</del></div>
                    <div className="product-buttons">
                      <button type="button" className="view-button" onClick={() => setSelectedProduct(product)}>View</button>
                      <button type="button" onClick={() => addToCart(product)}>Add <span>+</span></button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>}
          {!loading && !filteredProducts.length && <div className="empty-state"><strong>No finds yet.</strong><span>Try a different search or category.</span><button type="button" onClick={() => { setSearch(""); setCategory("All"); }}>Show everything</button></div>}
        </section>
      </main>

      <footer className="footer">
        <div className="brand footer-brand"><span className="brand-mark">L</span><span>luma<span className="brand-dot">.</span></span></div>
        <p>Thoughtful shopping for a more interesting everyday.</p>
        <span>© 2026 Luma marketplace</span>
      </footer>

      {cartOpen && (
        <div className="drawer-backdrop" onClick={() => setCartOpen(false)} role="presentation">
          <aside className="cart-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-heading"><div><p className="eyebrow">YOUR PICKS</p><h2>Your bag <span>{cart.length}</span></h2></div><button type="button" onClick={() => setCartOpen(false)}>×</button></div>
            {cart.length ? (
              <>
                <div className="cart-items">{cart.map((item, index) => <div className="cart-item" key={`${item._id}-${index}`}><img src={item.image} alt="" onError={(event) => handleImageError(event, item)} /><div><strong>{item.name}</strong><span>₹{item.price}</span></div><button type="button" aria-label={`Remove ${item.name} from bag`} onClick={() => setCart((items) => items.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div>)}</div>
                <div className="cart-total"><span>Subtotal</span><strong>₹{cartTotal}</strong></div>
                <button className="primary-button checkout-button" type="button" onClick={() => setCheckoutOpen(true)}>Continue to checkout <span>→</span></button>
              </>
            ) : <div className="empty-cart"><span>♧</span><p>Your bag is waiting for something good.</p></div>}
          </aside>
        </div>
      )}
      {toast && <div className="toast">✓ {toast}</div>}
      {selectedProduct && (
        <div className="modal-backdrop" onClick={() => setSelectedProduct(null)} role="presentation">
          <section className="product-modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setSelectedProduct(null)}>×</button>
            <img src={selectedProduct.image} alt={selectedProduct.name} onError={(event) => handleImageError(event, selectedProduct)} />
            <div className="modal-copy"><p className="eyebrow">{selectedProduct.category}</p><h2>{selectedProduct.name}</h2><p className="modal-rating">★ {selectedProduct.rating || "4.5"} · {selectedProduct.reviews || 120} reviews</p><p>Thoughtfully selected for quality, comfort, and everyday use. A customer favourite with fast delivery and easy returns.</p><strong>₹{selectedProduct.price}</strong><button className="primary-button" type="button" onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}>Add to bag <span>→</span></button></div>
          </section>
        </div>
      )}
      {authOpen && (
        <div className="modal-backdrop" onClick={() => setAuthOpen(false)} role="presentation">
          <form className="auth-modal" onSubmit={submitAuth} onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setAuthOpen(false)}>×</button>
            <p className="eyebrow">WELCOME TO LUMA</p><h2>{authMode === "login" ? "Good to see you." : "Join the good stuff."}</h2>
            {authMode === "register" && <input required placeholder="Your name" value={authForm.name} onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })} />}
            <input required type="email" placeholder="Email address" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} />
            <input required minLength="8" type="password" placeholder="Password (8+ characters)" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} />
            {authMessage && <p className="form-error">{authMessage}</p>}
            <button className="primary-button" type="submit">{authMode === "login" ? "Sign in" : "Create account"} <span>→</span></button>
            <button className="switch-auth" type="button" onClick={() => { setAuthMode(authMode === "login" ? "register" : "login"); setAuthMessage(""); }}>{authMode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}</button>
          </form>
        </div>
      )}
      {checkoutOpen && (
        <div className="modal-backdrop" onClick={() => setCheckoutOpen(false)} role="presentation">
          <section className="checkout-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" type="button" onClick={() => setCheckoutOpen(false)}>×</button><p className="eyebrow">SECURE CHECKOUT</p><h2>Almost yours.</h2><p>Your payment is handled securely by Stripe. Luma never stores card details.</p><div className="checkout-summary"><span>{cart.length} items</span><strong>₹{cartTotal}</strong></div><button className="primary-button" type="button" onClick={placeOrder}>Pay securely with Stripe <span>→</span></button><small>You will be redirected to Stripe to complete payment.</small></section>
        </div>
      )}
    </div>
  );
}

export default App;
