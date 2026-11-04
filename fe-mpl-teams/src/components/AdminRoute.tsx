
import { Navigate, Outlet, useLocation } from "react-router-dom";

interface StoredUser {
    id: number;
    name: string;
    username: string;
    email: string;
    role: "admin" | "user";
}

export default function AdminRoute() {
    const location = useLocation();

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
    return (
        <Navigate
        to="/dashboard/login"
        replace
        state={{ from: location }}
        />
    );
    }

    let user: StoredUser;

    try {
        user = JSON.parse(storedUser);
    } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        return <Navigate to="/dashboard/login" replace />;
    }

    if (user.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
    }
