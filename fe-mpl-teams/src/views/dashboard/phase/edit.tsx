import {useEffect, useState} from "react"
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../../services/api";
export default function PhaseEdit() {
        const { id } = useParams<{ id: string }>();
        const [name, setName] = useState<string>("")
        const [slug, setSlug] = useState<string>("")
        const [tournaments, setTournaments] = useState<Tournament[]>([])
        const [tournament_id, setTournamentId] = useState<number>(0);
        const [errors, setErrors] = useState<{name?: string, slug?: string, tournament_id?: string}>({})
        const navigate = useNavigate()
    
        interface Tournament {
            id: number,
            name: string
        }
    useEffect(() => {
        document.title = "Edit Phase"
        const fetchTournaments = async() => {
                    try {
                        const response = await api.get("/tournaments")
                        setTournaments(response.data.data)
                    }catch (error : any) {
                        if (error.response && error.response.data && error.response.data.errors) {
                        setErrors(error.response.data.errors)
                    }
                    }
                };
                

        const fetchPhase = async() => {
            try {
                const response = await api.get(`/phases/${id}`)
                setName(response.data.data.name)
                setSlug(response.data.data.slug)
                setTournamentId(response.data.data.tournament_id)
            }catch (error : any) {
                if (error.response && error.response.data && error.response.data.errors) {
                    setErrors(error.response.data.errors)
                }
            }
        };
        fetchPhase()
        fetchTournaments()
    },[id])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const data = {name, slug, tournament_id}
        try {
            await api.put(`/phases/${id}`, data, {
                headers: {"Content-Type" : "application/json"},}
            );
            navigate("/dashboard/phase")
        } catch (error : any) {
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors)
            }
        }
    }
    return (
        <div className="p-4">
            <p className="text-xl font-semibold">Edit phase page.</p>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="flex gap-2 items-center">
                    <label htmlFor="name" className="block input-label">Name</label>
                    <input value={name} type="text" id="name" className="mt-1 block w-50 input-field" 
                    onChange={(e) => setName(e.target.value)} />
                    
                </div>
                
                <div className="flex gap-2 items-center">
                    <label htmlFor="slug" className="block input-label">Slug</label>
                    <input value={slug} type="text" id="slug" className="mt-1 block w-50 input-field" 
                    onChange={(e) => setSlug(e.target.value)} />
                    
                </div>
                <div className="flex gap-2 items-center">
                    <label htmlFor="tournaments" className="block input-label">Tournament</label>
                    <select name="tournaments" id="tournaments" value={tournament_id} className="mt-1 block w-50 select-field"
                    onChange={(e) => setTournamentId(Number(e.target.value))}>
                        <option value="">Pilih Tournament..</option>
                    {tournaments.map((tournament) => (
                        <option key={tournament.id} value={tournament.id}>{tournament.name}</option>
                    )

                    )}
                    </select>
                    
                </div>
                
                <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Update Phase</button>
            </form>
        </div>
    )
}