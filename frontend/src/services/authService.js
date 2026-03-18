import { API_BASE } from "./config"
const API = `${API_BASE}/auth`

export const register = async (name, email, password, role, storeName) => {

  const body = { name, email, password, role }
  if (role === 'store' && storeName) {
    body.storeName = storeName
  }

  const res = await fetch(`${API}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })

  return res.json()
}

export const login = async (email, password) => {

  const res = await fetch(`${API}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      password
    })
  })

  return res.json()
}