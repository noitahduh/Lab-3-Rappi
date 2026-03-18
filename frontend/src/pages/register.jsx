import { useState } from "react"
import { register } from "../services/authService"
import { useNavigate, Link } from "react-router-dom"
import { globalStyles } from "./theme"

export default function Register() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("consumer")
  const [storeName, setStoreName] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async () => {
    if (!name || !email || !password) { alert("Fill in all fields"); return }
    setLoading(true)
    const data = await register(name, email, password, role, storeName)
    setLoading(false)
    if (data.error || data.message) { alert(data.error || data.message); return }
    navigate("/")
  }

  return (
    <>
      <style>{globalStyles}</style>
      <div className="auth-page">
        <div className="auth-box">
          <div className="auth-logo">🛵</div>
          <div>
            <div className="auth-title">Create account</div>
            <div className="auth-sub" style={{ marginTop: 4 }}>Join the Rappi ecosystem</div>
          </div>

          <hr className="auth-divider" />

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              className="form-input"
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <input
              className="form-input"
              placeholder="Email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <input
              className="form-input"
              placeholder="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <select
              className="form-select"
              value={role}
              onChange={e => setRole(e.target.value)}
            >
              <option value="consumer">🛒 Consumer</option>
              <option value="store">🏪 Store owner</option>
              <option value="delivery">🚴 Delivery rider</option>
            </select>

            {role === "store" && (
              <input
                className="form-input"
                placeholder="Store name"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
              />
            )}
          </div>

          <button
            className="btn btn-dark btn-full"
            style={{ borderRadius: 8 }}
            onClick={handleRegister}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>

          <Link to="/" className="auth-link">Already have an account? Sign in</Link>
        </div>
      </div>
    </>
  )
}