const API = "http://localhost:3000/api/delivery"

export const getAvailableOrders = async () => {

  const res = await fetch(`${API}/available`)

  return res.json()
}

export const acceptOrder = async (orderId, deliveryUserId) => {

  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      orderId,
      deliveryUserId
    })
  })

  return res.json()
}

export const getMyDeliveries = async (deliveryUserId) => {

  const res = await fetch(`${API}/user/${deliveryUserId}`)

  return res.json()
}