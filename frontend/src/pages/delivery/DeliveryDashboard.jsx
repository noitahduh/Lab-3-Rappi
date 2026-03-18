import { useEffect, useState, useContext, useCallback } from "react"
import { getAvailableOrders, acceptOrder, getMyDeliveries } from "../../services/deliveryService"
import { AuthContext } from "../../context/AuthContext"
import { globalStyles } from "../theme"

export default function DeliveryDashboard() {
  const { user } = useContext(AuthContext)

  const [orders, setOrders] = useState([])
  const [myOrders, setMyOrders] = useState([])
  const [tab, setTab] = useState("available")
  const [accepting, setAccepting] = useState(null)

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
    if (user?.id) {
      loadAvailable()
      loadMine()
    }
  }, [user, loadAvailable, loadMine])

  const handleAccept = async (orderId) => {
    setAccepting(orderId)
    await acceptOrder(orderId, user.id)
    setAccepting(null)
    await loadAvailable()
    await loadMine()
    setTab("mine")
  }

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#f5f4f0", minHeight: "100vh" }}>

        <div className="app-header">
          <h1>🚴 Delivery</h1>
          <span className="user-tag">{user?.name || user?.email}</span>
        </div>

        <div className="app-body">

          <div className="app-sidebar">
            <div className="sidebar-label">Dashboard</div>

            <div
              className={`sidebar-item ${tab === "available" ? "active" : ""}`}
              onClick={() => { setTab("available"); loadAvailable() }}
            >
              <div className="status-dot green" />
              Available orders
              {orders.length > 0 && (
                <span style={{ marginLeft: "auto", fontSize: 11, background: "#22c55e", color: "#fff", borderRadius: 10, padding: "1px 7px" }}>
                  {orders.length}
                </span>
              )}
            </div>

            <div
              className={`sidebar-item ${tab === "mine" ? "active" : ""}`}
              onClick={() => { setTab("mine"); loadMine() }}
            >
              <div className="status-dot yellow" />
              My deliveries
              {myOrders.length > 0 && (
                <span style={{ marginLeft: "auto", fontSize: 11, background: "#1a1a1a", color: "#fff", borderRadius: 10, padding: "1px 7px" }}>
                  {myOrders.length}
                </span>
              )}
            </div>
          </div>

          <div className="app-main">

            {tab === "available" && (
              <div className="card">
                <div className="card-header">
                  <span className="card-title">📍 Available orders</span>
                  <button className="btn btn-outline" style={{ padding: "6px 12px", fontSize: 12 }} onClick={loadAvailable}>
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
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span className={`badge ${order.status}`}>{order.status}</span>
                        <button
                          className="btn btn-green"
                          style={{ padding: "6px 14px", fontSize: 12 }}
                          onClick={() => handleAccept(order.id)}
                          disabled={accepting === order.id}
                        >
                          {accepting === order.id ? "..." : "Accept"}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === "mine" && (
              <div className="card">
                <div className="card-header">
                  <span className="card-title">🗺️ My deliveries</span>
                  <button className="btn btn-outline" style={{ padding: "6px 12px", fontSize: 12 }} onClick={loadMine}>
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
                      <span className={`badge ${order.status}`}>{order.status}</span>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}