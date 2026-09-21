import { NavLink, Outlet } from "react-router-dom";

export default function DefaultLayout(){
    return (
        <div className="w-full h-10 font-semibold bg-red-500 ">
            <div className="flex gap-3 items-center h-full px-4 text-white">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/tournament">Tournament</NavLink>
                <NavLink to="/heroes">Heroes</NavLink>
            </div>
            <Outlet />
        </div>
    )

}