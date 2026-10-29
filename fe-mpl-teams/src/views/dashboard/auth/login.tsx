import { api } from "../../../services/api"
import { useState, type FormEventHandler } from "react"
import { useNavigate } from "react-router-dom"

export default function Login(){
    const navigate = useNavigate();

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [token, setToken] = useState<string>("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

interface LoginResponse {
    message: string;
    token: string;
    user: {
    id: number;
    name: string;
    username: string;
    email: string;
    role: "admin" | "user";
    };
}

const submit : FormEventHandler<HTMLFormElement>= async(e) => {
        e.preventDefault()
        try {
            const response = await api.post("/auth/login", {
                login: login.trim(),
                password: password
            });

            const data = response.data

            if (data.user.role !== "admin") {
                setError("Akun ini tidak memiliki akses admin.");
                return;
            }

            
            if(data.token) {
                setToken(data.token);
                sessionStorage.setItem("token", data.token);
                sessionStorage.setItem("user", JSON.stringify(data.user));
                navigate("/dashboard/team");
            }
            
        }catch (err: any) {
            console.error(error)
            setError(
            err.response?.data?.message ??
            "Tidak dapat terhubung ke server."
        );
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="w-xl bg-sky-400">
            <p className="text-2xl font-bold text-center">Login</p>
            <form onSubmit={submit} className="flex flex-col justify-center m-4">
                <div>   
                <label className="input-label">Login</label>
                    <input type="text" className="input-field" onChange={(e) => setLogin(e.target.value)}/>
                </div>
                <div>   
                    <label className="input-label">Password</label>
                    <input type="password" className="input-field" onChange={(e) => setPassword(e.target.value)}/>
                </div>
                {error && (
            <p
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
            >
            {error}
            </p>
        )}
                <button className="button">Login</button>
            </form>
        </div>
    )
}