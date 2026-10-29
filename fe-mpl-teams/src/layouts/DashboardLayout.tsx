import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function DashboardLayout(){
    interface User {
        id: number;
        name: string;
        username: string;
        email: string;
        role: "admin" | "user";
    }

    const storedUser = sessionStorage.getItem("user");

    const user: User | null = storedUser
    ? JSON.parse(storedUser)
    : null;


    const navigate = useNavigate();

    const logout = () => {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        navigate("/dashboard/login", { replace: true });
    };

    return (
        <div className="min-h-screen flex">
            <div className="w-60 min-h-screen font-semibold text-white bg-gray-500 ">
                <div className="flex justify-between flex-col items-center h-full p-4">
                    <div className="flex flex-col items-center">
                        <div className="mb-4 font-bold text-lg">Dashboard</div>
                        <NavLink className={({ isActive }) => isActive ? "bg-blue-500 rounded-sm p-0.5" : ""} to="/dashboard/team">Team</NavLink>
                        <NavLink className={({ isActive }) => isActive ? "bg-blue-500 rounded-sm p-0.5" : ""} to="/dashboard/tournament">Tournament</NavLink>
                        <NavLink className={({ isActive }) => isActive ? "bg-blue-500 rounded-sm p-0.5" : ""} to="/dashboard/phase">Phase</NavLink>
                        <NavLink className={({ isActive }) => isActive ? "bg-blue-500 rounded-sm p-0.5" : ""} to="/dashboard/event">Event</NavLink>
                        <NavLink className={({ isActive }) => isActive ? "bg-blue-500 rounded-sm p-0.5" : ""} to="/dashboard/match">Match</NavLink>
                        <NavLink className={({ isActive }) => isActive ? "bg-blue-500 rounded-sm p-0.5" : ""} to="/dashboard/hero">Hero</NavLink>
                        <NavLink className={({ isActive }) => isActive ? "bg-blue-500 rounded-sm p-0.5" : ""} to="/dashboard/standing">Standing</NavLink>
                    </div>
                    <div>
                        <p className="font-semibold mb-2">
                            {user?.username ?? "Guest"}
                        </p>
                        <button className="bg-red-500 text-white p-2 rounded" onClick={logout}>
                        Logout
                        </button>
                    </div>
                </div>
            </div>
            
            <main className="flex-1 p-4">
                <Outlet />
            </main>              
            
        </div>
        
    )
}