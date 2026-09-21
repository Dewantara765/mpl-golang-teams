import { useEffect, useState } from "react"
import { api } from "../../../services/api"
import { Link } from "react-router-dom";
import { getPaginationPages } from "../../../../utils/pagination";
export default function DashboardHeroIndex(){
    const [heroes, setHeroes] = useState<Hero[]>([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(7);
    const [total_pages, setTotalPages] = useState(0);
    const pages = getPaginationPages(page, total_pages);

    interface Hero {
        id: number,
        name: string,
        logo: string,
    }
    useEffect(() => {
        document.title = "Dashboard Hero Index"
        const fetchHeroes = async() => {
            try {
                const response = await api.get(`/heroes?page=${page}&limit=${limit}`);
                setHeroes(response.data.data)
                setTotalPages(response.data.total_pages)
            }catch (error) {
                console.error("Error fetching heroes", error)
            }
        };
        fetchHeroes();
    },[page])

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this hero?")) {
            try {
                await api.delete(`/heroes/${id}`)
                setHeroes(heroes.filter((hero: any) => hero.id !== id) || null)
            } catch (error) {
                console.error("Error deleting team:", error)
                alert(error.response?.data?.message ?? "Failed to delete team.")
            }
        }
    }
    return (
        <div className="p-4">
            <Link to="/dashboard/hero/create" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Create Hero</Link>
            <table className="table-auto border-collapse border border-gray-300 mt-4 p-2">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 px-4 py-2">No</th>
                            <th className="border border-gray-300 px-4 py-2">Name</th>
                            <th className="border border-gray-300 px-4 py-2">Logo</th>
                            <th className="border border-gray-300 px-4 py-2">Action</th>
                        </tr>

                    </thead>
                    <tbody>
                        {heroes.map((hero, index: number) => (
                            <tr key={hero.id}>
                                <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                                <td className="border border-gray-300 px-4 py-2">{hero.name}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    {hero.logo && (
                                        <img src={`http://localhost:8080/${hero.logo}`} alt={`${hero.name} logo`} className="w-12 object-cover" />
                                    )}
                                </td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <Link to={`/dashboard/hero/edit/${hero.id}`} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2">
                                        Edit
                                    </Link>
                                    <button onClick={() => handleDelete(hero.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
                                        Delete
                                    </button>
                                    
                                </td>
                            </tr>

                            )

                            )}

                    </tbody>
                </table>
                <div className="flex items-center gap-2 mt-6">

            {/* Previous */}
            <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-2 border rounded"
            >
                Previous
            </button>

            {/* Page Numbers */}
            {pages.map((item, index) => {

                if (item === "...") {
                    return (
                        <span key={`dots-${index}`} className="px-2">
                            ...
                        </span>
                    );
                }

                return (
                    <button
                        key={item}
                        onClick={() => setPage(item as number)}
                        className={`px-3 py-2 border rounded ${
                            page === item
                                ? "bg-blue-600 text-white"
                                : "bg-white text-black"
                        }`}
                    >
                        {item}
                    </button>
                );
            })}

            {/* Next */}
            <button
                disabled={page === total_pages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-2 border rounded"
            >
                Next
            </button>

        </div>
            

        </div>
    )
}