const API = "http://localhost:3000/api/orders"

export const createOrder = async (consumerId, storeId, items) => {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ consumerId, storeId, items })
  })
  return res.json()
}

export const getOrders = async (consumerId) => {
  const res = await fetch(`${API}/consumer/${consumerId}`)
  return res.json()
}