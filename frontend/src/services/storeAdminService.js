const API = "http://localhost:3000/api/stores"

export const getStoreInfo = async (storeId) => {
  const res = await fetch(`${API}/${storeId}`)
  return res.json()
}

export const toggleStore = async (storeId, open) => {
  const res = await fetch(`${API}/${storeId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ open })
  })

  return res.json()
}

export const createProduct = async (storeId, name, price) => {

  const res = await fetch(`${API}/${storeId}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name,
      price
    })
  })

  return res.json()
}