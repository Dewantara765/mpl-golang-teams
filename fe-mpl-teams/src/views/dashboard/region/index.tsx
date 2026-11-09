import api from "../../../services/axios"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
export default function RegionIndex() {
    const [regions, setRegions] = useState<Region[]>([])


    interface Region {
        id: number;
        name: string;
        code: string;
        logo: string;
    }

    useEffect(() => {
        document.title = "Region Index Dashboard"
        const fetchRegions = async () => {
            try {
                const response = await api.get("/regions")
                setRegions(response.data.data)
            } catch (error) {
                console.error("Error fetching regions:", error)
            }
        }

        fetchRegions();
    }, [])

    return (
        <div>
            <div className="text-xl font-bold">Region Index</div>
            <Link to="/dashboard/region/create" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 inline-block">
                Create Region
            </Link>
            {regions && regions.length > 0 ? (
                <table className="table-auto border-collapse border border-gray-300 mt-4">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 px-4 py-2">No</th>
                            <th className="border border-gray-300 px-4 py-2">Name</th>
                            <th className="border border-gray-300 px-4 py-2">Code</th>
                            <th className="border border-gray-300 px-4 py-2">Logo</th>
                            <th className="border border-gray-300 px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {regions.map((region: Region, index: number) => (
                            <tr key={region.id}>
                                <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                                <td className="border border-gray-300 px-4 py-2">{region.name}</td>
                                <td className="border border-gray-300 px-4 py-2">{region.code}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    {region.logo && (
                                        <img src={`http://localhost:8080/${region.logo}`} alt={`${region.name} logo`} className="w-12 object-cover" />
                                    )}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <Link to={`/dashboard/region/edit/${region.id}`} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2">
                                        Edit
                                    </Link>
                                    {/* <button onClick={() => handleDelete(region.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
                                        Delete
                                    </button> */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No regions available.</p>
            )}
        </div>
    )

}