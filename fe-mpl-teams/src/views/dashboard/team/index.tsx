import { Link, useSearchParams } from "react-router-dom";
import api from "../../../services/axios"
import { useEffect, useState } from "react"
import { getPaginationPages } from "../../../../utils/pagination";

export default function Team() {
    const [teams, setTeams] = useState<[]>([])
    const [totalPage, setTotalPage] = useState(0);
    const [page, setPage] = useState(1);
    const pages = getPaginationPages(page, totalPage);
    const [sort, setSort] = useState<string>("id");
    const [order, setOrder] = useState<string>("asc");
    const [search, setSearch] = useState<string>("")
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        document.title = "Team Index Dashboard"
        try {
            const fetchTeams = async () => {
            const page = searchParams.get("page") || "1";
            const sort = searchParams.get("sort") || "id";
            const order = searchParams.get("order") || "desc";
                const response = await api.get("/teams", {
                    params: {
                        search: search,
                        page,
                        sort,
                        order,
                    }
                })
                setPage(Number(page))
                setSort(sort)
                setOrder(order)
                setTeams(response.data.data)
                setTotalPage(response.data.totalPage)
            }
            fetchTeams()
        } catch (error) {
            console.error("Error fetching teams:", error)
        }
    }, [searchParams, page, sort, order, debouncedSearch])

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this team?")) {
            try {
                await api.delete(`/api/admin/teams/${id}`)
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
            <div className="flex">
                    <label htmlFor="name" className="block input-label">Search</label>
                    <input value={search} type="text" id="name" className="mt-1 block w-50 input-field" 
                    placeholder="Search team..."
                    onChange={(e) => setSearch(e.target.value)} />
                </div>
            
            {teams && teams.length > 0 ? (
                <table className="table-auto border-collapse border border-gray-300 mt-4">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 px-4 py-2">No</th>
                            <th className="border border-gray-300 px-4 py-2">Name</th>
                            <th className="border border-gray-300 px-4 py-2">Short Name</th>
                            <th className="border border-gray-300 px-4 py-2">Logo</th>
                            <th className="border border-gray-300 px-4 py-2">Region</th>
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
                                <td className="border border-gray-300 px-4 py-2">{team.region.name}</td>
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
            <div className="flex items-center gap-2 mt-6">

                    {/* Previous */}
                    {page !== 1 ?
                    <Link to={`/dashboard/team?page=${page - 1}&order=desc`}>
                        <button
                            className="px-3 py-2 border rounded"
                        >
                            Previous
                        </button>
                    </Link>
                    : 
                    <button
                            className="px-3 py-2 border rounded opacity-50"
                        >
                            Previous
                        </button>}

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
                        <Link key={item} to={`/dashboard/team?page=${item}&order=${order}`}>
                            <button
                                className={`px-3 py-2 border rounded ${
                                    page === item
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-black"
                                }`}
                            >
                                {item}
                            </button>
                        </Link>
                        );
                    })}

                    {/* Next */}
                    {page !== totalPage ?
                    <Link to={`/dashboard/team?page=${page + 1}&order=desc`}>
                        <button
                            className="px-3 py-2 border rounded"
                        >
                            Next
                        </button>
                    </Link>
                    : 
                    <button
                            className="px-3 py-2 border rounded opacity-50"
                        >
                            Next
                        </button>}

                </div>
        </div>
    )
}
