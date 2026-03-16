import { useState } from "react"
import { register } from "../services/authService"
import { useNavigate } from "react-router-dom"

export default function Register() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("consumer")

  const navigate = useNavigate()

  const handleRegister = async () => {

    await register(email, password, role)

    navigate("/")
  }

  return (

    <div>

      <h1>Register</h1>

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

      <select onChange={(e) => setRole(e.target.value)}>

        <option value="consumer">Consumer</option>
        <option value="store">Store</option>
        <option value="delivery">Delivery</option>

      </select>

      <br /><br />

      <button onClick={handleRegister}>
        Register
      </button>

    </div>

  )
}