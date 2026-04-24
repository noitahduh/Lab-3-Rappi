import { useEffect, useState, useContext, useCallback, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getAvailableOrders, acceptOrder, getMyDeliveries } from '../../services/deliveryService'
import { getOrderById } from '../../services/orderService'
import { AuthContext } from '../../context/AuthContext'
import { globalStyles } from '../theme'
import { API_BASE } from '../../services/config'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Ícono rojo para el destino
const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const STEP = 0.0001

export default function DeliveryDashboard() {
  const { user } = useContext(AuthContext)

  const [orders, setOrders]       = useState([])
  const [myOrders, setMyOrders]   = useState([])
  const [tab, setTab]             = useState('available')
  const [accepting, setAccepting] = useState(null)

  const [activeOrderId, setActiveOrderId] = useState(null)
  const [position, setPosition]           = useState({ lat: 4.711, lng: -74.0721 })
  const [destination, setDestination]     = useState(null) // coordenadas del destino de la orden
  const [orderStatus, setOrderStatus]     = useState(null)

  const pendingPosition  = useRef(null)
  const throttleTimer    = useRef(null)
  const activeOrderIdRef = useRef(null)

  useEffect(() => { activeOrderIdRef.current = activeOrderId }, [activeOrderId])

  const loadAvailable = useCallback(async () => {
    const data = await getAvailableOrders()
    setOrders(Array.isArray(data) ? data : [])
  }, [])

  const loadMine = useCallback(async () => {
    if (!user?.id) return
    const data = await getMyDeliveries(user.id)
    setMyOrders(Array.isArray(data) ? data : [])
  }, [user])

  useEffect(() => {
    if (user?.id) { loadAvailable(); loadMine() }
  }, [user, loadAvailable, loadMine])

  const throttledSendPosition = useCallback((orderId, pos) => {
    pendingPosition.current = pos
    if (throttleTimer.current) return
    throttleTimer.current = setTimeout(() => {
      if (pendingPosition.current) {
        sendPosition(orderId, pendingPosition.current.lat, pendingPosition.current.lng)
        pendingPosition.current = null
      }
      throttleTimer.current = null
    }, 500)
  }, [])

  useEffect(() => {
    const handleKey = (e) => {
      if (!activeOrderIdRef.current) return
      const deltas = {
        ArrowUp:    { lat: STEP,  lng: 0 },
        ArrowDown:  { lat: -STEP, lng: 0 },
        ArrowLeft:  { lat: 0, lng: -STEP },
        ArrowRight: { lat: 0, lng: STEP },
      }
      const delta = deltas[e.key]
      if (!delta) return
      e.preventDefault()
      setPosition(prev => {
        const next = { lat: prev.lat + delta.lat, lng: prev.lng + delta.lng }
        throttledSendPosition(activeOrderIdRef.current, next)
        return next
      })
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [throttledSendPosition])

  const sendPosition = async (orderId, lat, lng) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/position`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng })
      })
      const data = await res.json()
      if (data.status) setOrderStatus(data.status)
    } catch (err) {
      console.error('Position update failed', err)
    }
  }

  const handleAccept = async (orderId) => {
    setAccepting(orderId)
    await acceptOrder(orderId, user.id)
    setAccepting(null)
    await loadAvailable()
    await loadMine()
    setActiveOrderId(orderId)
    setOrderStatus('En entrega')
    setTab('mine')
    // Cargar destino de la orden recién aceptada
    loadOrderDestination(orderId)
  }

  // Carga las coordenadas de destino de la orden desde el backend
  const loadOrderDestination = async (orderId) => {
    const order = await getOrderById(orderId)
    if (order?.destination_lat && order?.destination_lng) {
      setDestination({ lat: order.destination_lat, lng: order.destination_lng })
    }
  }

  const startDelivery = async (orderId) => {
    setActiveOrderId(orderId)
    await loadOrderDestination(orderId)
    setTab('map')
  }

  const dispatchArrow = (key) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
  }

  return (
    <>
      <style>{globalStyles}</style>
      <style>{`.leaflet-container { height: 400px; border-radius: 8px; }`}</style>
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#f5f4f0', minHeight: '100vh' }}>

        <div className="app-header">
          <h1>🚴 Delivery</h1>
          <span className="user-tag">{user?.name || user?.email}</span>
        </div>

        <div className="app-body">
          <div className="app-sidebar">
            <div className="sidebar-label">Dashboard</div>

            <div
              className={`sidebar-item ${tab === 'available' ? 'active' : ''}`}
              onClick={() => { setTab('available'); loadAvailable() }}
            >
              <div className="status-dot green" />
              Available orders
              {orders.length > 0 && (
                <span style={{
                  marginLeft: 'auto', fontSize: 11, background: '#22c55e',
                  color: '#fff', borderRadius: 10, padding: '1px 7px'
                }}>
                  {orders.length}
                </span>
              )}
            </div>

            <div
              className={`sidebar-item ${tab === 'mine' ? 'active' : ''}`}
              onClick={() => { setTab('mine'); loadMine() }}
            >
              <div className="status-dot yellow" />
              My deliveries
            </div>

            {activeOrderId && (
              <div
                className={`sidebar-item ${tab === 'map' ? 'active' : ''}`}
                onClick={() => setTab('map')}
              >
                🗺️ Live map
                {orderStatus && (
                  <span style={{
                    marginLeft: 'auto', fontSize: 10, background: '#1a1a1a',
                    color: '#fff', borderRadius: 10, padding: '1px 7px'
                  }}>
                    {orderStatus}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="app-main">

            {tab === 'available' && (
              <div className="card">
                <div className="card-header">
                  <span className="card-title">📍 Available orders</span>
                  <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 12 }} onClick={loadAvailable}>
                    Refresh
                  </button>
                </div>
                {orders.length === 0 ? (
                  <div className="empty">No orders available right now</div>
                ) : (
                  orders.map(order => (
                    <div key={order.id} className="list-row">
                      <div>
                        <div className="row-title">{order.storeName}</div>
                        <div className="row-sub">{order.id.slice(0, 8)}…</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <span className="badge pending">{order.status}</span>
                        <button
                          className="btn btn-green"
                          style={{ padding: '6px 14px', fontSize: 12 }}
                          onClick={() => handleAccept(order.id)}
                          disabled={accepting === order.id}
                        >
                          {accepting === order.id ? '...' : 'Accept'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'mine' && (
              <div className="card">
                <div className="card-header">
                  <span className="card-title">🗺️ My deliveries</span>
                  <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 12 }} onClick={loadMine}>
                    Refresh
                  </button>
                </div>
                {myOrders.length === 0 ? (
                  <div className="empty">No deliveries assigned yet</div>
                ) : (
                  myOrders.map(order => (
                    <div key={order.id} className="list-row">
                      <div>
                        <div className="row-title">{order.storeName}</div>
                        <div className="row-sub">{order.id.slice(0, 8)}…</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span className="badge">{order.status}</span>
                        {order.status === 'En entrega' && (
                          <button
                            className="btn btn-dark"
                            style={{ padding: '6px 14px', fontSize: 12 }}
                            onClick={() => startDelivery(order.id)}
                          >
                            Navigate
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'map' && activeOrderId && (
              <div className="card">
                <div className="card-header">
                  <span className="card-title">🗺️ Navigation</span>
                  <span className="card-meta">
                    {orderStatus === 'Entregado' ? '✅ Delivered!' : 'Use arrow keys to move'}
                  </span>
                </div>

                {orderStatus === 'Entregado' ? (
                  <div className="empty" style={{ color: '#22c55e', fontWeight: 600 }}>
                    🎉 Order delivered successfully!
                  </div>
                ) : (
                  <>
                    <div style={{ padding: 12 }}>
                      <MapContainer center={[position.lat, position.lng]} zoom={16} style={{ height: 400, borderRadius: 8 }}>
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='© OpenStreetMap contributors'
                        />
                        {/* Marcador azul: posición actual del domiciliario */}
                        <Marker position={[position.lat, position.lng]}>
                          <Popup>🚴 You are here</Popup>
                        </Marker>
                        {/* Marcador rojo: destino del pedido */}
                        {destination && (
                          <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
                            <Popup>📍 Delivery destination</Popup>
                          </Marker>
                        )}
                      </MapContainer>
                    </div>

                    <div style={{
                      padding: '12px 20px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 52px)',
                      gridTemplateRows: 'repeat(2, 52px)',
                      gap: 8,
                      justifyContent: 'center',
                      marginBottom: 16
                    }}>
                      <button className="btn btn-outline" style={{ gridRow: 1, gridColumn: 2, fontSize: 18, borderRadius: 8 }} onClick={() => dispatchArrow('ArrowUp')}>↑</button>
                      <button className="btn btn-outline" style={{ gridRow: 2, gridColumn: 1, fontSize: 18, borderRadius: 8 }} onClick={() => dispatchArrow('ArrowLeft')}>←</button>
                      <button className="btn btn-outline" style={{ gridRow: 2, gridColumn: 2, fontSize: 18, borderRadius: 8 }} onClick={() => dispatchArrow('ArrowDown')}>↓</button>
                      <button className="btn btn-outline" style={{ gridRow: 2, gridColumn: 3, fontSize: 18, borderRadius: 8 }} onClick={() => dispatchArrow('ArrowRight')}>→</button>
                    </div>

                    <p style={{ textAlign: 'center', fontSize: 12, color: '#999', paddingBottom: 16 }}>
                      Lat: {position.lat.toFixed(5)} | Lng: {position.lng.toFixed(5)}
                    </p>
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}