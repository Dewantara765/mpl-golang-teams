import {useEffect, useState} from "react";
import { api } from "../../../services/api";
import { Link, useSearchParams } from "react-router-dom";
import { getPaginationPages } from "../../../../utils/pagination";
export default function DashboardEventIndex() {
        const [events, setEvents] = useState<Event[]>([]);
        const [page, setPage] = useState(1);
        const [search, setSearch] = useState<string>("")
        const [debouncedSearch, setDebouncedSearch] = useState("");
        const [total_pages, setTotalPages] = useState(0);
        const pages = getPaginationPages(page, total_pages);
        const [sort, setSort] = useState<string>("id");
        const [order, setOrder] = useState<string>("asc");
    const [searchParams] = useSearchParams();
    interface Event {
        id: number,
        name: string,
        type: string,
        phase: {
            id: number,
            name: string
        },
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        document.title = "Dashboard - Event Index"
        const fetchEvents = async () => {
            const page = searchParams.get("page") || "1";
            const sort = searchParams.get("sort") || "id";
            const order = searchParams.get("order") || "desc"; 
            try {
                const response = await api.get("/events", {
                    params: {
                        search: search,
                        page,
                        sort,
                        order,
                    }
                });
                setPage(Number(page))
                setSort(sort)
                setOrder(order)
                setEvents(response.data.data);
                setTotalPages(response.data.total_pages)
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };
        fetchEvents();
    }, [searchParams, page, sort, order, debouncedSearch]);

    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                await api.delete(`/events/${id}`);
                setEvents(events.filter((event: any) => event.id !== id) || null);
            } catch (error) {
                console.error("Error deleting event:", error);
                alert(error.response?.data?.message ?? "Failed to delete event.");
            }
        }
    }


    return (
        <div className="p-4">
            <h1 className="text-xl font-bold">Event Index</h1>
            <Link to="/dashboard/event/create" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4 inline-block">Add Event</Link>
            <div className="flex">
                    <label htmlFor="name" className="block input-label">Search</label>
                    <input value={search} type="text" id="name" className="mt-1 block w-50 input-field" 
                    placeholder="Search event..."
                    onChange={(e) => setSearch(e.target.value)} />
                </div>
                <table className="table-auto border-collapse border border-gray-300 mt-4 p-2">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 px-4 py-2">No</th>
                            <th className="border border-gray-300 px-4 py-2">Name</th>
                            <th className="border border-gray-300 px-4 py-2">Type</th>
                            <th className="border border-gray-300 px-4 py-2">Phase Name</th>
                            <th className="border border-gray-300 px-4 py-2">Action</th>
                            
                        </tr>

                    </thead>
                    <tbody>
                        {events.map((event) => (
                            <tr key={event.id}>
                                <td className="border border-gray-300 px-4 py-2">{event.id}</td>
                                <td className="border border-gray-300 px-4 py-2">{event.name}</td>
                                <td className="border border-gray-300 px-4 py-2">{event.type}</td>
                                <td className="border border-gray-300 px-4 py-2">{event.phase.name}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <Link to={`/dashboard/event/edit/${event.id}`} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2">
                                        Edit
                                    </Link>
                                    <button onClick={() => handleDelete(event.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
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
                    {page !== 1 ?
                    <Link to={`/dashboard/event?page=${page - 1}&order=desc`}>
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
                        <Link key={item} to={`/dashboard/event?page=${item}&order=${order}`}>
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
                    {page !== total_pages ?
                    <Link to={`/dashboard/event?page=${page + 1}&order=desc`}>
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