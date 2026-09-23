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
            <table className="table-container">
                    <thead>
                        <tr>
                            <th className="table-cell">No</th>
                            <th className="table-cell">Match</th>
                            <th className="table-cell">Best Of</th>
                            <th className="table-cell">Date</th>
                            <th className="table-cell">Time</th>
                            <th className="table-cell">Event</th>
                            <th className="table-cell">Phase</th>
                            <th className="table-cell">Tournament</th>
                            <th className="table-cell">Action</th>
                        </tr>

                    </thead>
                    <tbody>
                        {matches.map((match, index) => (
                            <tr key={match.id}>
                                <td className="table-cell">{index + 1}</td>
                                <td className="table-cell">{match.home_team.short_name} {match.home_score}-{match.away_score} {match.away_team.short_name}</td>
                                <td className="table-cell">{match.best_of}</td>
                                <td className="table-cell">{formatDate(match.date)}</td>
                                <td className="table-cell">{formatTime(match.time)}</td>
                                <td className="table-cell">{match.event.name}</td>
                                <td className="table-cell">{match.event.phase.name}</td>
                                <td className="table-cell">{match.event.phase.tournament.name}</td>
                                <td className="table-cell">
                                    <Link to={`/dashboard/match/${match.id}`} className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded mr-2">
                                        Details
                                    </Link>
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