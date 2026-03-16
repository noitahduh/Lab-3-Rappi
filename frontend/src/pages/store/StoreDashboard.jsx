import { useState, useEffect } from "react"
import { getStoreInfo, toggleStore, createProduct } from "../../services/storeAdminService"
import { getStoreOrders } from "../../services/storeOrdersService"

export default function StoreDashboard() {

  const storeId = 1   

  const [store, setStore] = useState(null)
  const [orders, setOrders] = useState([])
  const [productName, setProductName] = useState("")
  const [productPrice, setProductPrice] = useState("")

  useEffect(() => {

    loadStore()
    loadOrders()

  }, [])

  const loadStore = async () => {

    const data = await getStoreInfo(storeId)

    setStore(data)

  }

  const loadOrders = async () => {

    const data = await getStoreOrders(storeId)

    setOrders(data)

  }

  const handleToggle = async () => {

    await toggleStore(storeId, !store.open)

    loadStore()

  }

  const handleCreateProduct = async () => {

    await createProduct(storeId, productName, productPrice)

    alert("Product created!")

    setProductName("")
    setProductPrice("")

  }

  if (!store) return <div>Loading...</div>

  return (

    <div>

      <h1>{store.name}</h1>

      <p>Status: {store.open ? "Open" : "Closed"}</p>

      <button onClick={handleToggle}>
        {store.open ? "Close Store" : "Open Store"}
      </button>

      <h2>Create Product</h2>

      <input
        placeholder="Product name"
        onChange={(e) => setProductName(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Price"
        onChange={(e) => setProductPrice(e.target.value)}
      />

      <br /><br />

      <button onClick={handleCreateProduct}>
        Create Product
      </button>

      <h2>Incoming Orders</h2>

      {orders.map(order => (

        <div key={order.id}>

          <p>Order ID: {order.id}</p>

          <p>Items: {order.items.join(", ")}</p>

        </div>

      ))}

    </div>

  )
}