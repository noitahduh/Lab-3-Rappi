import { useState, useContext } from "react"
import { login } from "../services/authService"
import { AuthContext } from "../context/AuthContext"
import { useNavigate, Link } from "react-router-dom"
import { globalStyles } from "./theme"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const { setUser } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!email || !password) { alert("Fill in all fields"); return }
    setLoading(true)
    const data = await login(email, password)
    setLoading(false)
    if (data.error || data.message) { alert(data.error || data.message); return }

    setUser(data)

    if (data.role === "consumer") navigate("/consumer")
    else if (data.role === "store") navigate("/store")
    else if (data.role === "delivery") navigate("/delivery")
  }

  return (
    <>
      <style>{globalStyles}</style>
      <div className="auth-page">
        <div className="auth-box">
          <div className="auth-logo">🛵</div>
          <div>
            <div className="auth-title">Welcome back</div>
            <div className="auth-sub" style={{ marginTop: 4 }}>Sign in to your account</div>
          </div>

          <hr className="auth-divider" />

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
              onKeyDown={e => e.key === "Enter" && handleLogin()}
            />
          </div>

          <button
            className="btn btn-dark btn-full"
            style={{ borderRadius: 8 }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in →"}
          </button>

          <Link to="/register" className="auth-link">Don't have an account? Register</Link>
        </div>
      </div>
    </>
  )
}