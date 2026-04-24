import { API_BASE } from './config'

const API = `${API_BASE}/orders`

export const createOrder = async (consumerId, storeId, items, destinationLat, destinationLng) => {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ consumerId, storeId, items, destinationLat, destinationLng })
  })
  return res.json()
}

export const getOrders = async (consumerId) => {
  const res = await fetch(`${API}/consumer/${consumerId}`)
  return res.json()
}

export const getOrderById = async (orderId) => {
  const res = await fetch(`${API}/${orderId}`)
  return res.json()
}