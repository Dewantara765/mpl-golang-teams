import {useEffect, useState} from "react";
import { api } from "../../../services/api";
import { data, Link, useSearchParams } from "react-router-dom";
export default function DashboardMatchIndex(){
    const [matches, setMatches] = useState<Match[]>([]);
    
    const [page, setPage] = useState(1);
    const [pageSize] = useState(7);
    const [totalPage, setTotalPage] = useState(0);

    const formatDate = (date: string) => {
        const formattedDate = date.slice(0,10)
        return formattedDate
    }

    const formatTime = (time: string) => {
        const formattedTime = time.slice(0,5)
        return formattedTime
    }

    interface Match {
        id: number,
        home_team: {
            short_name: string,
        },
        away_team: {
            short_name: string,
        },
        home_score: number,
        away_score: number,
        date: string,
        time: string,
        best_of: number,
        event: {
            name: string,
            phase: {
                name: string,
                tournament: {
                    name: string,
                }
            }
        },
    }

    useEffect(() => {
        document.title = "Dashboard - Match Index"
        const fetchMatches = async () => {
            try {
                const response = await api.get(`/matches?page=${page}&pageSize=${pageSize}`);
                setMatches(response.data.data);
                setTotalPage(response.data.totalPage);
            } catch (error) {
                console.error("Error fetching matches:", error);
            }
        };
        fetchMatches();
    },[page])

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/matches/${id}`);
            setMatches(matches.filter((match) => match.id !== id));
        }
        catch (error) {
            console.error("Error deleting match:", error);
        }
    }


    return (
        <div className='p-4'>
            <p className="font-semibold text-xl mb-3">Match Index Page</p>
            <Link to="/dashboard/match/create" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Create Match
            </Link>
            <table className="table-auto border-collapse border border-gray-300 mt-4 p-2">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 px-4 py-2">No</th>
                            <th className="border border-gray-300 px-4 py-2">Match</th>
                            <th className="border border-gray-300 px-4 py-2">Best Of</th>
                            <th className="border border-gray-300 px-4 py-2">Date</th>
                            <th className="border border-gray-300 px-4 py-2">Time</th>
                            <th className="border border-gray-300 px-4 py-2">Event</th>
                            <th className="border border-gray-300 px-4 py-2">Phase</th>
                            <th className="border border-gray-300 px-4 py-2">Tournament</th>
                            <th className="border border-gray-300 px-4 py-2">Action</th>
                        </tr>

                    </thead>
                    <tbody>
                        {matches.map((match, index) => (
                            <tr key={match.id}>
                                <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                                <td className="border border-gray-300 px-4 py-2">{match.home_team.short_name} {match.home_score}-{match.away_score} {match.away_team.short_name}</td>
                                <td className="border border-gray-300 px-4 py-2">{match.best_of}</td>
                                <td className="border border-gray-300 px-4 py-2">{formatDate(match.date)}</td>
                                <td className="border border-gray-300 px-4 py-2">{formatTime(match.time)}</td>
                                <td className="border border-gray-300 px-4 py-2">{match.event.name}</td>
                                <td className="border border-gray-300 px-4 py-2">{match.event.phase.name}</td>
                                <td className="border border-gray-300 px-4 py-2">{match.event.phase.tournament.name}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <Link to={`/dashboard/match/edit/${match.id}`} className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded mr-2">
                                        Edit
                                    </Link>
                                    <button onClick={() => handleDelete(match.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        )

                        )}
                    </tbody>
                </table>
                <div className="flex gap-2 mt-4">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    Previous
                </button>

                {Array.from(
                    { length: totalPage },
                    (_, index) => index + 1
                ).map((pageNumber) => (
                    <button
                        key={pageNumber}
                        onClick={() => setPage(pageNumber)}
                        className={
                            page === pageNumber
                                ? "font-bold"
                                : ""
                        }
                    >
                        {pageNumber}
                    </button>
                ))}

                <button
                    disabled={page === totalPage}
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </button>
            </div>
                    </div>
                )
}