import { useEffect, useState, useContext } from "react"
import { getStores, getStoreProducts } from "../../services/storeService"
import { createOrder, getOrders } from "../../services/orderService"
import { AuthContext } from "../../context/AuthContext"
import { globalStyles } from "../theme"

export default function ConsumerDashboard() {
  const { user } = useContext(AuthContext)

  const [stores, setStores] = useState([])
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([])
  const [selectedStore, setSelectedStore] = useState(null)
  const [selectedStoreName, setSelectedStoreName] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => { loadStores() }, [])

  const loadStores = async () => {
    const data = await getStores()
    setStores(Array.isArray(data) ? data : [])
  }

  const openStore = async (store) => {
    setSelectedStore(store.id)
    setSelectedStoreName(store.name)
    const data = await getStoreProducts(store.id)
    setProducts(Array.isArray(data) ? data : [])
  }

  const addToCart = (product) => {
    const existing = cart.find(item => item.productId === product.id)
    if (existing) {
      setCart(cart.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCart([...cart, { productId: product.id, name: product.name, price: product.price, quantity: 1 }])
    }
  }

  const handleOrder = async () => {
    if (!user) { alert("User not logged in"); return }
    if (!selectedStore) { alert("Select a store first"); return }
    if (cart.length === 0) { alert("Cart is empty"); return }

    setLoading(true)
    const items = cart.map(item => ({ productId: item.productId, quantity: item.quantity }))
    const data = await createOrder(user.id, selectedStore, items)
    setLoading(false)

    if (data.error || data.message) { alert(data.error || data.message); return }
    alert("Order created!")
    setCart([])
  }

  const loadOrders = async () => {
    const data = await getOrders(user.id)
    setOrders(Array.isArray(data) ? data : [])
  }

  const productEmojis = ["🍕","🍔","🌮","🍜","🥗","🍣","☕","🧁","🍰","🥤","🍱","🥙"]
  const getEmoji = (i) => productEmojis[i % productEmojis.length]

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f5f4f0", minHeight: "100vh" }}>

        {/* HEADER */}
        <div className="app-header">
          <h1>🛵 Rappi</h1>
          <span className="user-tag">{user?.name || user?.email}</span>
        </div>

        <div className="app-body">

          {/* SIDEBAR: Stores */}
          <div className="app-sidebar">
            <div className="sidebar-label">Stores</div>
            {stores.length === 0 && <div className="empty">No stores available</div>}
            {stores.map(store => (
              <div
                key={store.id}
                className={`sidebar-item ${selectedStore === store.id ? "active" : ""}`}
                onClick={() => openStore(store)}
              >
                <div className={`status-dot ${store.isOpen ? "green" : "gray"}`} />
                <div>
                  <div>{store.name}</div>
                  <div style={{ fontSize: 11, color: "#bbb", marginTop: 1 }}>
                    {store.isOpen ? "Open" : "Closed"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* MAIN */}
          <div className="app-main">

            {/* PRODUCTS */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">
                  {selectedStoreName ? `📦 ${selectedStoreName}` : "Select a store"}
                </span>
                {selectedStore && <span className="card-meta">{products.length} items</span>}
              </div>
              {products.length === 0 ? (
                <div className="empty">
                  {selectedStore ? "No products in this store" : "Click a store on the left to browse"}
                </div>
              ) : (
                <div className="grid-mosaic">
                  {products.map((product, i) => (
                    <div key={product.id} className="grid-tile">
                      <div className="tile-emoji">{getEmoji(i)}</div>
                      <div className="tile-name">{product.name}</div>
                      <div className="tile-sub">${product.price}</div>
                      <button
                        className="btn btn-dark"
                        style={{ marginTop: 8, padding: "5px 12px", fontSize: 12 }}
                        onClick={() => addToCart(product)}
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CART */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">🛒 Cart</span>
                <span className="card-meta">{cart.length} items</span>
              </div>
              <div style={{ padding: "12px 20px" }}>
                {cart.length === 0 ? (
                  <div style={{ color: "#bbb", fontSize: 13, textAlign: "center", padding: "12px 0" }}>
                    Your cart is empty
                  </div>
                ) : (
                  cart.map((item, i) => (
                    <div key={i} className="list-row" style={{ padding: "10px 0" }}>
                      <span style={{ fontSize: 14 }}>{item.name}</span>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, background: "#f5f4f0", padding: "3px 8px", borderRadius: 20, color: "#666" }}>
                        x{item.quantity}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <button
                className="btn btn-dark btn-full"
                onClick={handleOrder}
                disabled={cart.length === 0 || loading}
              >
                {loading ? "Placing order..." : "Place Order →"}
              </button>
            </div>

            {/* ORDERS */}
            <div className="card">
              <div className="card-header">
                <span className="card-title">📋 My Orders</span>
                <button className="btn btn-outline" style={{ padding: "6px 12px", fontSize: 12 }} onClick={loadOrders}>
                  Refresh
                </button>
              </div>
              {orders.length === 0 ? (
                <div className="empty">No orders yet — click Refresh</div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="list-row">
                    <div>
                      <div className="row-title">{order.storeName}</div>
                      <div className="row-sub">{order.id.slice(0, 8)}…</div>
                    </div>
                    <span className={`badge ${order.status}`}>{order.status}</span>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  )
}