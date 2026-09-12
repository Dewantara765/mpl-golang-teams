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
import DashboardPhaseIndex from '../views/dashboard/phase/index.tsx'
import PhaseCreate from '../views/dashboard/phase/create.tsx'
import NotFound from '../views/not_found.tsx'
import PhaseEdit from '../views/dashboard/phase/edit.tsx'
import DashboardEventIndex from '../views/dashboard/event/index.tsx'
import EventCreate from '../views/dashboard/event/create.tsx'
import EventEdit from '../views/dashboard/event/edit.tsx'
import DashboardMatchIndex from '../views/dashboard/match/index.tsx'
    
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
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
        <Route path="/dashboard/phase" element={<DashboardPhaseIndex/>}/>
        <Route path="/dashboard/phase/create" element={<PhaseCreate/>}/>
        <Route path="/dashboard/phase/edit/:id" element={<PhaseEdit/>}/>
        <Route path="/dashboard/event" element={<DashboardEventIndex/>}/>
        <Route path="/dashboard/event/create" element={<EventCreate/>}/>
        <Route path="/dashboard/event/edit/:id" element={<EventEdit/>}/>
        <Route path="/dashboard/match" element={<DashboardMatchIndex/>}/>
      </Route>
    </Routes>
  )
}