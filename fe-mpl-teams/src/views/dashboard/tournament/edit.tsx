import {useEffect, useState} from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import { api } from '../../../services/api'
export default function TournamentEdit(){
    const {id} = useParams()
    const navigate = useNavigate()
    const [tournament, setTournament] = useState<[] | null>(null)
    const [name, setName]= useState<string>("")
    const [slug, setSlug]= useState<string>("")
    const [start_date, setStartDate]= useState<string>("")
    const [end_date, setEndDate]= useState<string>("")


    useEffect(() => {
        document.title = "Tournament Edit"
        const fetchTournament = async () => {
            try {
                const response = await api.get(`/tournaments/db/${id}`)
                setTournament(response.data.data)
                setName(response.data.data.name)
                setSlug(response.data.data.slug)
                setStartDate(response.data.data.start_date)
                setEndDate(response.data.data.end_date)
            }catch (error) {
                console.error('Error fetching tournaments:', error);
            }
            
        };
        fetchTournament()
    },[slug])

    const handleSubmit = async(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const data = {name, slug, start_date, end_date}
        try {
            await api.put(`/tournaments/${id}`, data, 
                {headers: {"Content-Type" : "application/json"},}
            );
            navigate("/dashboard/tournament")
        }catch (error) {
            console.error('Error updating tournaments:', error);
        }

    }
    return (
        <div className="p-4">
            <p className="font-semibold text-xl">Tournament Edit</p>
            <form onSubmit={handleSubmit}  className="mt-4 space-y-4">
                <div className="flex gap-2 items-center">
                    <label htmlFor="name" className="block w-40 text-md font-medium text-gray-700">Name</label>
                    <input value={name} type="text" id="name" className="mt-1 block w-50 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                    onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="flex gap-2 items-center">
                    <label htmlFor="slug" className="block w-40 text-md font-medium text-gray-700">Slug</label>
                    <input value={slug} type="text" id="slug" className="mt-1 block w-50 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                    onChange={(e) => setSlug(e.target.value)} />
                </div>
                <div className="flex gap-2 items-center">
                    <label htmlFor="startDate" className="block w-40 text-md font-medium text-gray-700">Start Date</label>
                    <input value={start_date} type="date" id="startDate" className="mt-1 block w-50 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                    onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="flex gap-2 items-center">
                    <label htmlFor="endDate" className="block w-40 text-md font-medium text-gray-700">End Date</label>
                    <input value={end_date} type="date" id="endDate" className="mt-1 block w-50 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                    onChange={(e) => setEndDate(e.target.value)} />
                </div>
                
                <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Update Tournament</button>
            </form>
        </div>
    )
}