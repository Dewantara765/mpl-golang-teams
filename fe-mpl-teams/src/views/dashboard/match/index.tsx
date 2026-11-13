import {useEffect, useState, useMemo} from "react";
import { useNavigate } from "react-router-dom";
import  api  from "../../../services/axios";
import { Link, useSearchParams } from "react-router-dom";
import { getPaginationPages } from "../../../../utils/pagination";
export default function DashboardMatchIndex(){
    const [matches, setMatches] = useState<Match[]>([]);
    const [tournaments, setTournaments] = useState<Tournament[]>([])
    const [selectedTournament, setSelectedTournament] = useState("1");
    const [page, setPage] = useState(1);
    const [total_pages, setTotalPages] = useState(0);
    const pages = getPaginationPages(page, total_pages);
    const [sort, setSort] = useState<string>("id");
    const [order, setOrder] = useState<string>("asc");
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    

    const formatDate = (date: string) => {
        const formattedDate = date.slice(0,10)
        return formattedDate
    }

    const formatTime = (time: string) => {
        const formattedTime = time.slice(0,5)
        return formattedTime
    }

    const createPageUrl = (newPage) => {
        const params = new URLSearchParams(location.search);

        params.set("page", newPage);

        return `/dashboard/match?${params.toString()}`;
    };

    const filteredMatches = useMemo(() => {
            return matches.filter(
                (match) =>
                match.event.phase.tournament_id === Number(selectedTournament)
            );
    }, [matches, selectedTournament]);

    const handleTournamentChange = (tournamentID : string) => {
        const params = new URLSearchParams(searchParams);

        params.set("tournament_id", tournamentID);
        params.set("page", "1");

        navigate(`/dashboard/match?${params.toString()}`);
    };

    interface Match {
        id: number,
        home_team: {
            short_name: string | null,
        },
        away_team: {
            short_name: string | null,
        },
        home_score: number | null,
        away_score: number | null,
        date: string,
        time: string,
        best_of: number,
        event: {
            name: string,
            phase: {
                tournament_id: number,
                name: string,
                tournament: {
                    name: string,
                }
            }
        },
    }

    interface Tournament {
        id: number,
        name: string,
        start_date: string,
        end_date: string,
        slug: string,
    }   

    useEffect(() => {
        document.title = "Dashboard - Match Index"
        const fetchMatches = async () => {
            const page = searchParams.get("page") || "1";
            const sort = searchParams.get("sort") || "id";
            const order = searchParams.get("order") || "desc"; 
            const tournament_id = searchParams.get("tournament_id") || "1";
            try {
                const response = await api.get("/matches", {
                    params: {
                        page,
                        sort,
                        order,
                        tournament_id,
                    }
                });
                setPage(Number(page))
                setSort(sort)
                setOrder(order)
                setMatches(response.data.data)
                setTotalPages(response.data.total_pages)
                setSelectedTournament(tournament_id)
            } catch (error) {
                console.error("Error fetching matches:", error);
            }
        };

        const fetchTournaments = async() => {
            try {
                const response = await api.get("/tournaments")
                setTournaments(response.data.data)
            }catch (error) {
                console.error("error fetching tournaments", error)
            }
        }

        fetchMatches();
        fetchTournaments()
    },[searchParams, page, sort, order, selectedTournament])

    const handleDelete = async (id: number) => {
        try {
            await api.delete(`/api/admin/matches/${id}`);
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

            <select
                value={selectedTournament}
                onChange={(e) => handleTournamentChange(e.target.value)}
                >
                {tournaments.map((tournament) => (
                    <option key={tournament.id} value={tournament.id}>
                    {tournament.name}
                    </option>
                ))}
            </select>
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
                        {filteredMatches.map((match, index) => (
                            <tr key={match.id}>
                                <td className="table-cell">{index + 1}</td>
                                <td className="table-cell">{!match.home_team?.short_name ? "TBD" : match.home_team.short_name} {match.home_score ?? ""}-{match.away_score ?? ""} {!match.away_team?.short_name ? "TBD" : match.away_team.short_name}</td>
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
                <div className="flex items-center gap-2 mt-6">

                        {/* Previous */}
                        {page > 1 ? (
                            <Link to={createPageUrl(page - 1)}>
                                <button className="px-3 py-2 border rounded">
                                    Previous
                                </button>
                            </Link>
                        ) : (
                            <button
                                disabled
                                className="px-3 py-2 border rounded opacity-50"
                            >
                                Previous
                            </button>
                        )}

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
                                <Link key={item} to={createPageUrl(item)}>
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
                        {page < total_pages ? (
                            <Link to={createPageUrl(page + 1)}>
                                <button className="px-3 py-2 border rounded">
                                    Next
                                </button>
                            </Link>
                        ) : (
                            <button
                                disabled
                                className="px-3 py-2 border rounded opacity-50"
                            >
                                Next
                            </button>
                        )}

                    </div>
                    </div>
                )
}