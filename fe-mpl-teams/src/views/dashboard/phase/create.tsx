import { useEffect, useState } from "react"
import { api } from "../../../services/api"
import { useNavigate } from "react-router-dom"
export default function PhaseCreate(){
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
        document.title = "Create Phase"
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
        fetchTournaments()
    },[] )

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const data = {name, slug, tournament_id}
        try {
            await api.post("/phases", data, {
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
        <div className='p-4'>
            <p className="text-xl font-semibold mb-3">Create Phase Page</p>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="flex gap-2 items-center">
                    <label htmlFor="name" className="block w-40 text-md font-medium text-gray-700">Name</label>
                    <input value={name} type="text" id="name" className="mt-1 block w-50 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                    onChange={(e) => setName(e.target.value)} />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                
                <div className="flex gap-2 items-center">
                    <label htmlFor="slug" className="block w-40 text-md font-medium text-gray-700">Slug</label>
                    <input value={slug} type="text" id="slug" className="mt-1 block w-50 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                    onChange={(e) => setSlug(e.target.value)} />
                    {errors.slug && <p className="text-red-500 text-sm">{errors.slug}</p>}
                </div>
                <div className="flex gap-2 items-center">
                    <label htmlFor="tournaments" className="block w-40 text-md font-medium text-gray-700">Tournament</label>
                    <select name="tournaments" id="tournaments" value={tournament_id}
                    onChange={(e) => setTournamentId(Number(e.target.value))}>
                        <option value="">Pilih Tournament..</option>
                    {tournaments.map((tournament) => (
                        <option value={tournament.id}>{tournament.name}</option>
                    )

                    )}
                    </select>
                    {errors.tournament_id && <p className="text-red-500 text-sm">{errors.tournament_id}</p>}
                </div>
                
                <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Add Phase</button>
            </form>
        </div>
    )
}