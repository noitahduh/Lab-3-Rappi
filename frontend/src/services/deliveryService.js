const API = "http://localhost:3000/api/delivery"

export const getAvailableOrders = async () => {
  const res = await fetch(`${API}/available`)
  return res.json()
}

export const acceptOrder = async (orderId, deliveryId) => {
  const res = await fetch(`${API}/${orderId}/accept`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deliveryId })
  })
  return res.json()
}

export const getMyDeliveries = async (deliveryId) => {
  const res = await fetch(`${API}/my-orders/${deliveryId}`)
  return res.json()
}