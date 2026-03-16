import { BrowserRouter, Routes, Route } from "react-router-dom"

import Login from "./pages/login"
import Register from "./pages/register"

import ConsumerDashboard from "./pages/consumer/ConsumerDashboard"
import StoreDashboard from "./pages/store/StoreDashboard"
import DeliveryDashboard from "./pages/delivery/DeliveryDashboard"

function App() {

  return (

    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/consumer" element={<ConsumerDashboard />} />
        <Route path="/store" element={<StoreDashboard />} />
        <Route path="/delivery" element={<DeliveryDashboard />} />

      </Routes>

    </BrowserRouter>

  )
}

export default App