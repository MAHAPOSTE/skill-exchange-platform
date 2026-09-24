import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Skills from "./pages/Skills";
import Communities from "./pages/Communities";
import ExchangeRequests from "./pages/ExchangeRequests";
import Sessions from "./pages/Sessions";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/communities" element={<Communities />} />
          <Route path="/skill-exchange" element={<ExchangeRequests />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;