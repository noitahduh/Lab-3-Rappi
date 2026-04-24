import { useEffect, useState, useContext, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getStores, getStoreProducts } from '../../services/storeService'
import { createOrder, getOrders } from '../../services/orderService'
import { supabase } from '../../services/supabaseClient'
import { AuthContext } from '../../context/AuthContext'
import { globalStyles } from '../theme'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const deliveryIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

function DestinationPicker({ onPick }) {
  useMapEvents({
    click(e) { onPick(e.latlng) }
  })
  return null
}

const DEFAULT_CENTER = [4.711, -74.0721]
const PRODUCT_EMOJIS = ['🍕','🍔','🌮','🍜','🥗','🍣','☕','🧁','🎂','🥤','🌯','🥚']
const getEmoji = (i) => PRODUCT_EMOJIS[i % PRODUCT_EMOJIS.length]

export default function ConsumerDashboard() {
  const { user } = useContext(AuthContext)

  const [stores, setStores]               = useState([])
  const [products, setProducts]           = useState([])
  const [cart, setCart]                   = useState([])
  const [orders, setOrders]               = useState([])
  const [selectedStore, setSelectedStore] = useState(null)
  const [selectedStoreName, setSelectedStoreName] = useState('')
  const [loading, setLoading]             = useState(false)
  const [destination, setDestination]     = useState(null)
  const [activeOrder, setActiveOrder]     = useState(null)
  const [deliveryPos, setDeliveryPos]     = useState(null)
  const [delivered, setDelivered]         = useState(false)

  const channelRef = useRef(null)

  useEffect(() => {
    loadStores()
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [])

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
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id)
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }]
    })
  }

  const handleOrder = async () => {
    if (!user)             { alert('User not logged in'); return }
    if (!selectedStore)    { alert('Select a store first'); return }
    if (cart.length === 0) { alert('Cart is empty'); return }
    if (!destination)      { alert('Click on the map to set your delivery destination'); return }

    setLoading(true)
    const items = cart.map(item => ({ productId: item.productId, quantity: item.quantity }))
    const data = await createOrder(user.id, selectedStore, items, destination.lat, destination.lng)
    setLoading(false)

    if (data.error || data.message) { alert(data.error || data.message); return }

    alert('Order created!')
    setCart([])
    setDeliveryPos(null)
    setDelivered(false)
    setActiveOrder(data.id)
    subscribeToOrder(data.id)
  }

 
 const subscribeToOrder = (orderId) => {
  // Limpiar canal anterior
  if (channelRef.current) {
    supabase.removeChannel(channelRef.current)
    channelRef.current = null
  }

  // Pequeño delay para que Supabase procese el removeChannel antes de crear uno nuevo
  setTimeout(() => {
    const channel = supabase
      .channel(`consumer-order-${orderId}-${Date.now()}`) // nombre único para evitar conflictos
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`
        },
        (payload) => {
          console.log('REALTIME PAYLOAD:', JSON.stringify(payload.new))
          const updated = payload.new
          if (updated.delivery_position) {
            const coords = updated.delivery_position.coordinates
            if (coords) {
              setDeliveryPos({ lat: coords[1], lng: coords[0] })
            }
          }
          if (updated.status === 'Entregado') {
            setDelivered(true)
          }
        }
      )
      .subscribe((status) => {
        console.log('SUPABASE CHANNEL STATUS:', status)
      })

    channelRef.current = channel
  }, 300)
}

  const loadOrders = async () => {
    if (!user?.id) return
    const data = await getOrders(user.id)
    setOrders(Array.isArray(data) ? data : [])
  }

  return (
    <>
      <style>{globalStyles}</style>
      <style>{`.leaflet-container { height: 300px; border-radius: 8px; }`}</style>
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#f5f4f0', minHeight: '100vh' }}>

        <div className="app-header">
          <h1>🛵 Rappi</h1>
          <span className="user-tag">{user?.name || user?.email}</span>
        </div>

        <div className="app-body">

          <div className="app-sidebar">
            <div className="sidebar-label">Stores</div>
            {stores.length === 0 && <div className="empty">No stores available</div>}
            {stores.map(store => (
              <div
                key={store.id}
                className={`sidebar-item ${selectedStore === store.id ? 'active' : ''}`}
                onClick={() => openStore(store)}
              >
                <div className={`status-dot ${store.isOpen ? 'green' : 'gray'}`} />
                <div>
                  <div>{store.name}</div>
                  <div style={{ fontSize: 11, color: '#bbb', marginTop: 1 }}>
                    {store.isOpen ? 'Open' : 'Closed'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="app-main">

            <div className="card">
              <div className="card-header">
                <span className="card-title">
                  {selectedStoreName ? `📦 ${selectedStoreName}` : 'Select a store'}
                </span>
                {selectedStore && <span className="card-meta">{products.length} items</span>}
              </div>
              {products.length === 0 ? (
                <div className="empty">
                  {selectedStore ? 'No products in this store' : 'Click a store on the left to browse'}
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
                        style={{ marginTop: 8, padding: '5px 12px', fontSize: 12 }}
                        onClick={() => addToCart(product)}
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">📍 Set delivery destination</span>
                {destination && (
                  <span className="card-meta">
                    {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
                  </span>
                )}
              </div>
              <div style={{ padding: 12 }}>
                <MapContainer center={DEFAULT_CENTER} zoom={13} style={{ height: 300, borderRadius: 8 }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© OpenStreetMap contributors'
                  />
                  <DestinationPicker onPick={setDestination} />
                  {destination && (
                    <Marker position={[destination.lat, destination.lng]}>
                      <Popup>📍 Delivery destination</Popup>
                    </Marker>
                  )}
                  {deliveryPos && (
                    <Marker position={[deliveryPos.lat, deliveryPos.lng]} icon={deliveryIcon}>
                      <Popup>🛵 Delivery person</Popup>
                    </Marker>
                  )}
                </MapContainer>
                {!destination && (
                  <p style={{ fontSize: 12, color: '#999', marginTop: 8, textAlign: 'center' }}>
                    Click anywhere on the map to set your delivery destination
                  </p>
                )}
              </div>
            </div>

            {activeOrder && (
              <div className="card">
                <div className="card-header">
                  <span className="card-title">🔴 Live tracking</span>
                  <span className="card-meta">
                    {delivered ? '✅ Delivered!' : 'Waiting for rider...'}
                  </span>
                </div>
                {delivered ? (
                  <div className="empty" style={{ color: '#22c55e', fontWeight: 600 }}>
                    🎉 Your order has been delivered!
                  </div>
                ) : (
                  <div className="empty">
                    {deliveryPos
                      ? `Rider at ${deliveryPos.lat.toFixed(4)}, ${deliveryPos.lng.toFixed(4)}`
                      : 'Waiting for rider to start moving...'}
                  </div>
                )}
              </div>
            )}

            <div className="card">
              <div className="card-header">
                <span className="card-title">🛒 Cart</span>
                <span className="card-meta">{cart.length} items</span>
              </div>
              <div style={{ padding: '12px 20px' }}>
                {cart.length === 0 ? (
                  <div style={{ color: '#bbb', fontSize: 13, textAlign: 'center', padding: '12px 0' }}>
                    Your cart is empty
                  </div>
                ) : (
                  cart.map((item, i) => (
                    <div key={i} className="list-row" style={{ padding: '10px 0' }}>
                      <span style={{ fontSize: 14 }}>{item.name}</span>
                      <span style={{
                        fontFamily: "'DM Mono', monospace", fontSize: 12,
                        background: '#f5f4f0', padding: '3px 8px', borderRadius: 20, color: '#666'
                      }}>
                        x{item.quantity}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <button
                className="btn btn-dark btn-full"
                onClick={handleOrder}
                disabled={cart.length === 0 || loading || !destination}
              >
                {loading ? 'Placing order...' : !destination ? 'Set destination first' : 'Place Order →'}
              </button>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">📋 My Orders</span>
                <button
                  className="btn btn-outline"
                  style={{ padding: '6px 12px', fontSize: 12 }}
                  onClick={loadOrders}
                >
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
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className={`badge ${order.status?.toLowerCase().replace(' ', '-')}`}>
                        {order.status}
                      </span>
                      {order.status !== 'Entregado' && (
                        <button
                          className="btn btn-outline"
                          style={{ padding: '4px 10px', fontSize: 11 }}
                          onClick={() => {
                            setActiveOrder(order.id)
                            subscribeToOrder(order.id)
                          }}
                        >
                          Track
                        </button>
                      )}
                    </div>
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