import { useEffect, useState, useContext } from "react"
import { getAvailableOrders, acceptOrder, getMyDeliveries } from "../../services/deliveryService"
import { AuthContext } from "../../context/AuthContext"

export default function DeliveryDashboard() {

  const { user } = useContext(AuthContext)

  const [orders, setOrders] = useState([])
  const [myOrders, setMyOrders] = useState([])

  useEffect(() => {

    const loadOrders = async () => {
      const data = await getAvailableOrders()
      setOrders(data)
    }

    const loadMyOrders = async () => {
      const data = await getMyDeliveries(user.id)
      setMyOrders(data)
    }

    loadOrders()
    loadMyOrders()

  }, [user.id])

  const handleAccept = async (orderId) => {

    await acceptOrder(orderId, user.id)

    alert("Order accepted!")

    const updatedOrders = await getAvailableOrders()
    const updatedMyOrders = await getMyDeliveries(user.id)

    setOrders(updatedOrders)
    setMyOrders(updatedMyOrders)
  }

  return (

    <div>

      <h1>Available Orders</h1>

      {orders.map(order => (

        <div key={order.id}>

          <p>Order ID: {order.id}</p>

          <p>Items: {order.items.join(", ")}</p>

          <button onClick={() => handleAccept(order.id)}>
            Accept Order
          </button>

        </div>

      ))}

      <h2>My Deliveries</h2>

      {myOrders.map(delivery => (

        <div key={delivery.id}>

          <p>Delivery ID: {delivery.id}</p>

          <p>Order ID: {delivery.orderId}</p>

          <p>Status: {delivery.status}</p>

        </div>

      ))}

    </div>

  )
}