import { Link } from "react-router-dom";
import {api } from "../../../services/api"
import { useEffect, useState } from "react"

export default function Team() {
    const [teams, setTeams] = useState<[]>([])

    useEffect(() => {
        document.title = "Team Index Dashboard"
        try {
            const fetchTeams = async () => {
                const response = await api.get("/teams")
                setTeams(response.data.data)
            }
            fetchTeams()
        } catch (error) {
            console.error("Error fetching teams:", error)
        }
    }, [])

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this team?")) {
            try {
                await api.delete(`/teams/${id}`)
                setTeams(teams.filter((team: any) => team.id !== id) || null)
            } catch (error) {
                console.error("Error deleting team:", error)
                alert(error.response?.data?.message ?? "Failed to delete team.")
            }
        }
    }

    return (
        <div className="p-4">
            <Link to="/dashboard/team/create" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-4 rounded">
                Create Team
            </Link>
            
            {teams && teams.length > 0 ? (
                <table className="table-auto border-collapse border border-gray-300 mt-4">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 px-4 py-2">No</th>
                            <th className="border border-gray-300 px-4 py-2">Name</th>
                            <th className="border border-gray-300 px-4 py-2">Short Name</th>
                            <th className="border border-gray-300 px-4 py-2">Logo</th>
                            <th className="border border-gray-300 px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teams.map((team: any, index: number) => (
                            <tr key={team.id}>
                                <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                                <td className="border border-gray-300 px-4 py-2">{team.name}</td>
                                <td className="border border-gray-300 px-4 py-2">{team.short_name}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    {team.logo && (
                                        <img src={`http://localhost:8080/${team.logo}`} alt={`${team.name} logo`} className="w-12 object-cover" />
                                    )}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <Link to={`/dashboard/team/edit/${team.id}`} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2">
                                        Edit
                                    </Link>
                                    <button onClick={() => handleDelete(team.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No teams available.</p>
            )}
        </div>
    )
}
