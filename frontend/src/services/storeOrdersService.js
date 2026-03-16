const API = "http://localhost:3000/api/orders"

export const getStoreOrders = async (storeId) => {

  const res = await fetch(`${API}/store/${storeId}`)

  return res.json()
}