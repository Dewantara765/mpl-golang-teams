import { Routes, Route } from 'react-router-dom'
import Home from '../views/home.tsx'
import DefaultLayout from '../layouts/DefaultLayout.tsx'
import DashboardLayout from '../layouts/DashboardLayout.tsx'
import '../App.css'
import Team from '../views/dashboard/team/index.tsx'
import TeamCreate from '../views/dashboard/team/create.tsx'
import TeamEdit from '../views/dashboard/team/edit.tsx'
import TournamentIndex from '../views/tournament/index.tsx'
import MatchIndex from '../views/match/index.tsx'
import DashboardTournamentIndex from '../views/dashboard/tournament/index.tsx'
import TournamentEdit from '../views/dashboard/tournament/edit.tsx'
import TournamentCreate from '../views/dashboard/tournament/create.tsx'
    
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/tournament" element={<TournamentIndex />} />
        <Route path="/tournament/:slug" element={<MatchIndex />} />
      </Route>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard/team" element={<Team />} />
        <Route path="/dashboard/team/create" element={<TeamCreate />} />
        <Route path="/dashboard/team/edit/:id" element={<TeamEdit />} />
        <Route path="/dashboard/tournament" element={<DashboardTournamentIndex/>}/>
        <Route path="/dashboard/tournament/edit/:id" element={<TournamentEdit/>}/>
        <Route path="/dashboard/tournament/create" element={<TournamentCreate/>}/>
      </Route>
    </Routes>
  )
}