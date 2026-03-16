import { useEffect, useState, useContext } from "react"
import { getStores, getStoreProducts } from "../../services/storeService"
import { createOrder, getOrders } from "../../services/orderService"
import { AuthContext } from "../../context/AuthContext"

export default function ConsumerDashboard() {

  const { user } = useContext(AuthContext)

  const [stores, setStores] = useState([])
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([])
  const [selectedStore, setSelectedStore] = useState(null)

  useEffect(() => {
    loadStores()
  }, [])

  const loadStores = async () => {
    const data = await getStores()
    setStores(data)
  }

  const openStore = async (storeId) => {

    setSelectedStore(storeId)

    const data = await getStoreProducts(storeId)

    setProducts(data)
  }

  const addToCart = (product) => {

    setCart([...cart, product.name])
  }

  const handleOrder = async () => {

    if (!user) {
      alert("User not logged in")
      return
    }

    if (!selectedStore) {
      alert("Select a store first")
      return
    }

    if (cart.length === 0) {
      alert("Cart is empty")
      return
    }

    await createOrder(user.id, selectedStore, cart)

    alert("Order created!")

    setCart([])
  }

    const loadOrders = async () => {

    const data = await getOrders()

    const ordersArray = Array.isArray(data) ? data : data.orders

    const myOrders = ordersArray.filter(order => order.userId === user.id)

  setOrders(myOrders)
}

  return (

    <div>

      <h1>Stores</h1>

      {stores.map(store => (

        <div key={store.id}>

          <button onClick={() => openStore(store.id)}>
            {store.name}
          </button>

        </div>

      ))}

      <h2>Products</h2>

      {products.map(product => (

        <div key={product.id}>

          {product.name}

          <button onClick={() => addToCart(product)}>
            Add
          </button>

        </div>

      ))}

      <h2>Cart</h2>

      {cart.map((item, i) => (

        <div key={i}>
          {item}
        </div>

      ))}

      <button onClick={handleOrder}>
        Create Order
      </button>

      <hr />

      <button onClick={loadOrders}>
        Load My Orders
      </button>

      <h2>My Orders</h2>

      {orders.map(order => (

        <div key={order.id}>

          <p>Order ID: {order.id}</p>

          <p>Items: {order.items.join(", ")}</p>

        </div>

      ))}

    </div>
  )
}