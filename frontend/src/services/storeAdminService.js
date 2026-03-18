const API = "http://localhost:3000/api/stores"

export const getStoreInfo = async (userId) => {
  const res = await fetch(`${API}/user/${userId}`)
  return res.json()
}

export const toggleStore = async (storeId, isOpen) => {
  const res = await fetch(`${API}/${storeId}/toggle`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isOpen })
  })
  return res.json()
}

export const createProduct = async (storeId, name, price) => {
  const res = await fetch(`${API}/${storeId}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, price })
  })
  return res.json()
}