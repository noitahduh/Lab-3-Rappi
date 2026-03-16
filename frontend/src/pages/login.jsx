import { useState, useContext } from "react"
import { login } from "../services/authService"
import { AuthContext } from "../context/AuthContext"
import { useNavigate } from "react-router-dom"

export default function Login() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const { setUser } = useContext(AuthContext)

  const navigate = useNavigate()

  const handleLogin = async () => {

    const data = await login(email, password)

    setUser(data)

    if (data.role === "consumer") navigate("/consumer")
    if (data.role === "store") navigate("/store")
    if (data.role === "delivery") navigate("/delivery")
  }

  return (

    <div>

      <h1>Login</h1>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleLogin}>
        Login
      </button>

      <br /><br />

      <button onClick={() => navigate("/register")}>
        Go to Register
      </button>

    </div>

  )
}