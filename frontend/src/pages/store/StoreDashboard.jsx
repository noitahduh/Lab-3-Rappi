import { useEffect, useState, useContext, useCallback } from 'react'
import { getStoreInfo, toggleStore, createProduct } from '../../services/storeAdminService'
import { getStoreProducts } from '../../services/storeService'
import { getStoreOrders } from '../../services/storeOrdersService'
import { supabase } from '../../services/supabaseClient'
import { AuthContext } from '../../context/AuthContext'
import { globalStyles } from '../theme'

const STATUS_COLORS = {
  'Creado':     { bg: '#fef9c3', color: '#854d0e' },
  'En entrega': { bg: '#dbeafe', color: '#1e40af' },
  'Entregado':  { bg: '#dcfce7', color: '#166534' },
  'pending':    { bg: '#fef9c3', color: '#854d0e' },
  'accepted':   { bg: '#dbeafe', color: '#1e40af' },
}

function StatusBadge({ status }) {
  const style = STATUS_COLORS[status] || { bg: '#f1f5f9', color: '#64748b' }
  return (
    <span style={{
      fontSize: 11, fontWeight: 500, padding: '4px 10px',
      borderRadius: 20, background: style.bg, color: style.color,
      textTransform: 'capitalize', whiteSpace: 'nowrap'
    }}>
      {status}
    </span>
  )
}

const PRODUCT_EMOJIS = ['🍕','🍔','🌮','🍜','🥗','🍣','☕','🧁','🎂','🥤','🌯','🥚']
const getEmoji = (i) => PRODUCT_EMOJIS[i % PRODUCT_EMOJIS.length]

export default function StoreDashboard() {
  const { user } = useContext(AuthContext)

  const [store, setStore]         = useState(null)
  const [products, setProducts]   = useState([])
  const [orders, setOrders]       = useState([])
  const [tab, setTab]             = useState('products')

  const [productName, setProductName]   = useState('')
  const [productPrice, setProductPrice] = useState('')
  const [addingProduct, setAddingProduct] = useState(false)

  const loadStore = useCallback(async () => {
    if (!user?.id) return
    const data = await getStoreInfo(user.id)
    setStore(data)
    if (data?.id) {
      const prods = await getStoreProducts(data.id)
      setProducts(Array.isArray(prods) ? prods : [])
    }
  }, [user])

  useEffect(() => {
    if (user?.id) loadStore()
  }, [user, loadStore])


  useEffect(() => {
    if (!store?.id) return

    const channel = supabase
      .channel(`store-orders-${store.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `storeId=eq.${store.id}`
        },
        (payload) => {
          const updated = payload.new
          setOrders(prev => {
            const idx = prev.findIndex(o => o.id === updated.id)
            if (idx !== -1) {
              return prev.map(o => o.id === updated.id ? { ...o, ...updated } : o)
            }
            return [updated, ...prev]
          })
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [store?.id])

  const handleToggle = async () => {
    if (!store) return
    const updated = await toggleStore(store.id, !store.isOpen)
    setStore(updated)
  }

  const loadOrders = async () => {
    if (!store) return
    const data = await getStoreOrders(store.id)
    setOrders(Array.isArray(data) ? data : [])
    setTab('orders')
  }

  const handleAddProduct = async () => {
    if (!productName || !productPrice) { alert('Fill in name and price'); return }
    setAddingProduct(true)
    await createProduct(store.id, productName, Number(productPrice))
    setAddingProduct(false)
    setProductName('')
    setProductPrice('')
    const prods = await getStoreProducts(store.id)
    setProducts(Array.isArray(prods) ? prods : [])
    setTab('products')
  }

  return (
    <>
      <style>{globalStyles}</style>
      <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#f5f4f0', minHeight: '100vh' }}>

        <div className="app-header">
          <h1>🏪 {store?.name || 'My Store'}</h1>
          <span className="user-tag">{user?.name || user?.email}</span>
        </div>

        <div className="app-body">
          <div className="app-sidebar">
            <div className="sidebar-label">Store</div>

            <div className="toggle-wrap">
              <button className={`toggle ${store?.isOpen ? 'on' : ''}`} onClick={handleToggle} />
              <span className="toggle-label">{store?.isOpen ? 'Open' : 'Closed'}</span>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #e8e6e0', margin: '8px 0' }} />
            <div className="sidebar-label" style={{ marginTop: 12 }}>Menu</div>

            <div
              className={`sidebar-item ${tab === 'products' ? 'active' : ''}`}
              onClick={() => setTab('products')}
            >
              📦 Products
              <span style={{ marginLeft: 'auto', fontSize: 11, color: '#bbb' }}>{products.length}</span>
            </div>

            <div
              className={`sidebar-item ${tab === 'add' ? 'active' : ''}`}
              onClick={() => setTab('add')}
            >
              ➕ Add product
            </div>

            <div
              className={`sidebar-item ${tab === 'orders' ? 'active' : ''}`}
              onClick={loadOrders}
            >
              📋 Orders
              {orders.length > 0 && (
                <span style={{
                  marginLeft: 'auto', fontSize: 11, background: '#1a1a1a',
                  color: '#fff', borderRadius: 10, padding: '1px 7px'
                }}>
                  {orders.length}
                </span>
              )}
            </div>
          </div>

          <div className="app-main">

            {tab === 'products' && (
              <div className="card">
                <div className="card-header">
                  <span className="card-title">📦 Products</span>
                  <span className="card-meta">{products.length} items</span>
                </div>
                {products.length === 0 ? (
                  <div className="empty">No products yet</div>
                ) : (
                  <div className="grid-mosaic">
                    {products.map((p, i) => (
                      <div key={p.id} className="grid-tile">
                        <div className="tile-emoji">{getEmoji(i)}</div>
                        <div className="tile-name">{p.name}</div>
                        <div className="tile-sub">${p.price}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'add' && (
              <div className="card">
                <div className="card-header">
                  <span className="card-title">➕ New product</span>
                </div>
                <div className="form-wrap">
                  <label className="form-label">Product name</label>
                  <input
                    className="form-input"
                    value={productName}
                    onChange={e => setProductName(e.target.value)}
                  />
                  <label className="form-label">Price</label>
                  <input
                    className="form-input"
                    type="number"
                    value={productPrice}
                    onChange={e => setProductPrice(e.target.value)}
                  />
                  <button className="btn btn-dark" onClick={handleAddProduct} disabled={addingProduct}>
                    {addingProduct ? 'Adding...' : 'Add product →'}
                  </button>
                </div>
              </div>
            )}

            {tab === 'orders' && (
              <div className="card">
                <div className="card-header">
                  <span className="card-title">📋 Incoming orders</span>
                  <button className="btn btn-outline" onClick={loadOrders}>Refresh</button>
                </div>
                {orders.length === 0 ? (
                  <div className="empty">No orders yet</div>
                ) : (
                  orders.map(order => (
                    <div key={order.id} className="list-row">
                      <div>
                        <div className="row-title">Order #{order.id.slice(0, 8)}</div>
                        <div className="row-sub" style={{ marginTop: 4, fontSize: 12, color: '#666' }}>
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleTimeString()
                            : '—'}
                        </div>
                      </div>
                      <StatusBadge status={order.status} />
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