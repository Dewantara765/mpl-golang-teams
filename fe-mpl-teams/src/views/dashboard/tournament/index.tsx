import {useEffect, useState} from 'react'
import {api} from "../../../services/api"
import { Link } from 'react-router-dom'
export default function DashboardTournamentIndex(){
    const [tournaments, setTournaments] = useState<Tournament[]>([])
    interface Tournament {
        id: number,
        name: string,
        start_date: string,
        end_date: string,
        slug: string,
    }
    useEffect(() => {
        document.title = "Dashboard Tournament Index"
        const fetchTournaments = async () => {
            try {
                const response = await api.get('/tournaments');
                setTournaments(response.data.data);
            } catch (error) {
                console.error('Error fetching tournaments:', error);
            }
        };
        fetchTournaments();
    },[])

    const handleDelete = async(id: number) => {
         if (window.confirm("Are you sure you want to delete this team?")) {
            try {
                await api.delete(`/tournaments/${id}`)
                setTournaments(tournaments.filter((tournament: any) => tournament.id !== id) || null)
            } catch (error) {
                console.error("Error deleting team:", error)
                alert(error.response?.data?.message ?? "Failed to delete tournament.")
            }
        }
    }

    return (
        <div className='p-4'>
            <Link to="/dashboard/tournament/create" className='bg-blue-500 p-2 text-white rounded'>Add Team</Link>
                <table className="table-auto border-collapse border border-gray-300 mt-4 p-2">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 px-4 py-2">No</th>
                            <th className="border border-gray-300 px-4 py-2">Name</th>
                            <th className="border border-gray-300 px-4 py-2">Slug</th>
                            <th className="border border-gray-300 px-4 py-2">Start Date</th>
                            <th className="border border-gray-300 px-4 py-2">End Date</th>
                            <th className="border border-gray-300 px-4 py-2">Actions</th>
                        </tr>

                    </thead>
                    <tbody>
                        {tournaments.map((tournament)=> (
                            <tr key={tournament.id}>
                                <td className="border border-gray-300 px-4 py-2">{tournament.id}</td>
                                <td className="border border-gray-300 px-4 py-2">{tournament.name}</td>
                                <td className="border border-gray-300 px-4 py-2">{tournament.slug}</td>
                                <td className="border border-gray-300 px-4 py-2">{tournament.start_date}</td>
                                <td className="border border-gray-300 px-4 py-2">{tournament.end_date}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <Link to={`/dashboard/tournament/edit/${tournament.id}`} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2">
                                        Edit
                                    </Link>
                                    <button onClick={() => handleDelete(tournament.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        )

                        )}
                    </tbody>
                </table>
            
        </div>
    )
}