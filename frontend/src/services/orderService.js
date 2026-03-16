const API = "http://localhost:3000/api/orders"

export const createOrder = async (userId, storeId, items) => {

  const res = await fetch(API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      userId,
      storeId,
      items
    })
  })

  return res.json()
}

export const getOrders = async (userId) => {

  const res = await fetch(`${API}/user/${userId}`)

  return res.json()
}