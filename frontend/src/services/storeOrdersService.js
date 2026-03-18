import { API_BASE } from "./config"
const API = `${API_BASE}/orders`


export const getStoreOrders = async (storeId) => {

  const res = await fetch(`${API}/store/${storeId}`)

  return res.json()
}