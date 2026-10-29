
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

    const token = sessionStorage.getItem("token");
    const storedUser = sessionStorage.getItem("user");

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
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        return <Navigate to="/dashboard/login" replace />;
    }

    if (user.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
    }
