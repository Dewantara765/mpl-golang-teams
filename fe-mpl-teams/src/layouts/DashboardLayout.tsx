import { NavLink, Outlet } from "react-router-dom";

export default function DashboardLayout(){
    return (
        <div className="w-full flex">
            <div className="w-1/8 h-screen font-semibold text-white bg-red-500 ">
                <div className="flex flex-col  items-center h-full px-4">
                    <div className="mb-4 font-bold text-lg">Dashboard</div>
                    <NavLink className={({ isActive }) => isActive ? "bg-blue-500 rounded-sm p-0.5" : ""} to="/dashboard/team">Team</NavLink>
                    <NavLink className={({ isActive }) => isActive ? "bg-blue-500 rounded-sm p-0.5" : ""} to="/dashboard/tournament">Tournament</NavLink>
                    <NavLink className={({ isActive }) => isActive ? "bg-blue-500 rounded-sm p-0.5" : ""} to="/dashboard/phase">Phase</NavLink>
                    <NavLink className={({ isActive }) => isActive ? "bg-blue-500 rounded-sm p-0.5" : ""} to="/dashboard/event">Event</NavLink>
                    <NavLink className={({ isActive }) => isActive ? "bg-blue-500 rounded-sm p-0.5" : ""} to="/dashboard/match">Match</NavLink>
                </div>
            </div>
            <div className="w-7/8 h-screen">
                <Outlet />
            </div>              
            
        </div>
        
    )
}