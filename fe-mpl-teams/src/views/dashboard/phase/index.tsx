import {useEffect, useState} from 'react'
import { api } from '../../../services/api'
import { Link } from 'react-router-dom';
export default function DashboardPhaseIndex(){
    const [phases, setPhases] = useState<Phase[]>([]);

    interface Phase {
        id: number,
        name: string,
        tournament : {
            name: string,
        },
        slug : string
    }
    useEffect(() => {
        document.title = "Phase Index"
        const fetchPhases = async () => {
            try {
                const response = await api.get('/phases');
                setPhases(response.data.data);
            } catch (error) {
                console.error('Error fetching phases:', error);
            }
        };
        fetchPhases();
    },[]
    

    )
    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this phase?")) {
            try {
                await api.delete(`/phases/${id}`);
                setPhases(phases.filter((phase: any) => phase.id !== id) || null);
            } catch (error) {
                console.error("Error deleting phase:", error);
                alert(error.response?.data?.message ?? "Failed to delete phase.");
            }
        }
    }
    return (
        <div className='p-4'>
            <p className="font-semibold text-xl mb-3">Phase Index Page</p>
            <Link to="/dashboard/phase/create" className="rounded p-2 bg-blue-500 text-white">Create Phase</Link>
            <table className="table-auto border-collapse border border-gray-300 mt-4 p-2">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 px-4 py-2">No</th>
                            <th className="border border-gray-300 px-4 py-2">Name</th>
                            <th className="border border-gray-300 px-4 py-2">Slug</th>
                            <th className="border border-gray-300 px-4 py-2">Tournament Name</th>
                            <th className="border border-gray-300 px-4 py-2">Action</th>
                            
                        </tr>

                    </thead>
                    <tbody>
                        {phases.map((phase)=> (
                            <tr key={phase.id}>
                                <td className="border border-gray-300 px-4 py-2">{phase.id}</td>
                                <td className="border border-gray-300 px-4 py-2">{phase.name}</td>
                                <td className="border border-gray-300 px-4 py-2">{phase.slug}</td>
                                <td className="border border-gray-300 px-4 py-2">{phase.tournament.name}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <Link to={`/dashboard/phase/edit/${phase.id}`} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2">
                                        Edit
                                    </Link>
                                    <button onClick={() => handleDelete(phase.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
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