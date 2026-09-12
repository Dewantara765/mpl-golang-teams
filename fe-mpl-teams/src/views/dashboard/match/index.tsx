import {useEffect, useState} from "react";
import { api } from "../../../services/api";
export default function DashboardMatchIndex(){
    const [matches, setMatches] = useState<Match[]>([]);

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
                const response = await api.get("/matches");
                setMatches(response.data.data);
            } catch (error) {
                console.error("Error fetching matches:", error);
            }
        };
        fetchMatches();
    },[])
    return (
        <div className='p-4'>
            <p className="font-semibold text-xl mb-3">Match Index Page</p>
            <table className="table-auto border-collapse border border-gray-300 mt-4 p-2">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 px-4 py-2">No</th>
                            <th className="border border-gray-300 px-4 py-2">Match</th>
                            <th className="border border-gray-300 px-4 py-2">Date</th>
                            <th className="border border-gray-300 px-4 py-2">Time</th>
                            <th className="border border-gray-300 px-4 py-2">Event</th>
                            <th className="border border-gray-300 px-4 py-2">Phase</th>
                            <th className="border border-gray-300 px-4 py-2">Tournament</th>
                        </tr>

                    </thead>
                    <tbody>
                        {matches.map((match) => (
                            <tr key={match.id}>
                                <td className="border border-gray-300 px-4 py-2">{match.id}</td>
                                <td className="border border-gray-300 px-4 py-2">{match.home_team.short_name} {match.home_score}-{match.away_score} {match.away_team.short_name}</td>
                                <td className="border border-gray-300 px-4 py-2">{formatDate(match.date)}</td>
                                <td className="border border-gray-300 px-4 py-2">{formatTime(match.time)}</td>
                                <td className="border border-gray-300 px-4 py-2">{match.event.name}</td>
                                <td className="border border-gray-300 px-4 py-2">{match.event.phase.name}</td>
                                <td className="border border-gray-300 px-4 py-2">{match.event.phase.tournament.name}</td>
                                
                            </tr>
                        )

                        )}
                    </tbody>
                </table>
        </div>
    )
}