import { Routes, Route } from 'react-router-dom'
import Home from '../views/home.tsx'
import '../App.css'
    
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  )
}