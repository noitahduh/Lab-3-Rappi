import { API_BASE } from "./config"
const API = `${API_BASE}/stores`

export const getStores = async () => {

  const res = await fetch(API)

  return res.json()
}

export const getStoreProducts = async (storeId) => {

  const res = await fetch(`${API}/${storeId}/products`)

  return res.json()
}