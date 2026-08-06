import { NavLink, Outlet } from "react-router-dom";

export default function DashboardLayout(){
    return (
        <div className="w-full flex">
            <div className="w-1/8 h-screen font-semibold text-white bg-red-500 ">
                <div className="flex flex-col gap-3 items-center h-full px-4">
                    Dashboard
                    <NavLink className={({ isActive }) => isActive ? "bg-blue-500 p-1" : ""} to="/dashboard/team">Team</NavLink>
                </div>
            </div>
            <div className="w-7/8 h-screen">
                <Outlet />
            </div>              
            
        </div>
        
    )
}