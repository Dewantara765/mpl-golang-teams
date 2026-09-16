import {useEffect, useState} from "react";
import { api } from "../../../services/api";
import { useNavigate } from "react-router-dom";

export default function EventCreate() {
    const [name, setName] = useState<string>("")
    const [type, setType] = useState<string>("")
    const [phase_id, setPhaseId] = useState<number>(0)
    const [phases, setPhases] = useState<Phase[]>([])
    const [errors, setErrors] = useState<{name?: string, type?: string, phase_id?: string}>({})
    const navigate = useNavigate()

    interface Phase {
        id: number,
        name: string
    }
    useEffect(() => {
        document.title = "Create Event"
        const fetchPhases = async() => {
            try {
                const response = await api.get("/phases")
                setPhases(response.data.data)
            }catch (error : any) {
                if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors)
            }
            }
        };
        fetchPhases()
    }, [])
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const data = {name, type, phase_id}
        try {
            await api.post("/events", data, {
                headers: {"Content-Type" : "application/json"},}
            );
            navigate("/dashboard/event")
        } catch (error : any) {
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors)
            }
        }
    }
    return (
        <div className="p-4">
            <h1 className="text-xl font-semibold">Create Event</h1>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                <div className="flex gap-2 items-center">
                    <label htmlFor="name" className="block input-label">Name</label>
                    <input value={name} type="text" id="name" className="mt-1 block w-50 input-field" 
                    onChange={(e) => setName(e.target.value)} />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                <div className="flex gap-2 items-center">
                    <label htmlFor="type" className="block input-label">Type</label>
                    <input value={type} type="text" id="type" className="mt-1 block w-50 input-field" 
                    onChange={(e) => setType(e.target.value)} />
                    {errors.type && <p className="text-red-500 text-sm">{errors.type}</p>}
                </div>
                <div className="flex gap-2 items-center">
                    <label htmlFor="phase_id" className="block input-label">Phase</label>
                    <select value={phase_id} id="phase_id" className="mt-1 block w-50 select-field" 
                    onChange={(e) => setPhaseId(Number(e.target.value))}>
                        <option value={0}>Select a phase</option>
                        {phases.map((phase) => (
                            <option key={phase.id} value={phase.id}>
                                {phase.name}
                            </option>
                        ))}
                    </select>
                    {errors.phase_id && <p className="text-red-500 text-sm">{errors.phase_id}</p>}
                </div>
                <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Create Event</button>
            </form>
        </div>
    )
}