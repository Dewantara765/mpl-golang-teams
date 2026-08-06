import { Routes, Route } from 'react-router-dom'
import Home from '../views/home.tsx'
import DefaultLayout from '../layouts/DefaultLayout.tsx'
import DashboardLayout from '../layouts/DashboardLayout.tsx'
import '../App.css'
import Team from '../views/dashboard/team/index.tsx'
import TeamCreate from '../views/dashboard/team/create.tsx'
import TeamEdit from '../views/dashboard/team/edit.tsx'
    
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route path="/" element={<Home />} />
      </Route>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard/team" element={<Team />} />
        <Route path="/dashboard/team/create" element={<TeamCreate />} />
        <Route path="/dashboard/team/edit/:id" element={<TeamEdit />} />
      </Route>
    </Routes>
  )
}