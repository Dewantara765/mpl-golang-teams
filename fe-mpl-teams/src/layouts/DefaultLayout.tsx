import { NavLink, Outlet } from "react-router-dom";

export default function DefaultLayout(){
    return (
        <div className="w-full h-10 font-semibold text-white bg-red-500 ">
            <div className="flex gap-3 items-center h-full px-4">
                <NavLink to="/">Home</NavLink>
                
            </div>
            <Outlet />
        </div>
    )

}