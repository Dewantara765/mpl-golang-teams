import {useEffect, useState} from "react";
import { api } from "../../../services/api";
import { Link } from "react-router-dom";
export default function DashboardEventIndex() {
    const [events, setEvents] = useState<Event[]>([]);
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
        document.title = "Dashboard - Event Index"
        const fetchEvents = async () => {
            try {
                const response = await api.get("/events");
                setEvents(response.data.data);
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };
        fetchEvents();
    }, []);

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
        </div>
    )
}