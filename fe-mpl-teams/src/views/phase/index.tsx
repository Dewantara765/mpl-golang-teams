import {useState, useEffect} from 'react'
import {api} from '../../services/api.ts'
import {useParams} from 'react-router-dom'
import { formatDate } from '../../../utils/formatDate.ts';
import { formatTime } from '../../../utils/formatTime.ts';
import { convertDuration } from '../../../utils/duration.ts';
export default function MatchIndex() {
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [selectedPhase, setSelectedPhase] = useState("all");
    const [selectedEvent, setSelectedEvent] = useState("all");
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const { slug } = useParams<{ slug: string }>();
    interface Tournament {
        id: number;
        name: string;
        start_date: string;
        end_date: string;
        phases: Phase[];
    }
    interface Phase {
        id: number;
        name: string;
        slug: string;
        events: Event[];
    }
    interface Event {
        id: number;
        name: string;
        type: string;
        matches: Match[];
    }

    interface Match {
        id: number;
        home_team : Team
        away_team: Team
        home_score : number,
        away_score : number,
        date: string,
        time: string,
        Games: Game[],

    }
    interface Game {
        id: number,
        game_number: number,
        match: Match,
        winner_team: Team,
        duration: number,
    }

    interface Team {
        name: string,
        short_name: string,
        logo: string
    }
    

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const response = await api.get(`/tournaments/${slug}`);
                setTournament(response.data.data);
            } catch (error) {
                console.error('Error fetching tournament:', error);
            }
        };   
        
        fetchTournaments();
        
    }, []);


    

  
    return (
        <div className="p-4">
            <title>Tournament Details</title>
            {tournament && (
                <div>
                    <h2>{tournament.name}</h2>
                    <div className="flex flex-wrap gap-3 my-4">
                        {/* Filter Phase */}
                        <select
                            className="border rounded-lg p-2"
                            value={selectedPhase}
                            onChange={(e) => {
                                setSelectedPhase(e.target.value);
                                setSelectedEvent("all");
                            }}
                        >
                            <option value="all">Semua Phase</option>

                            {tournament.phases.map((phase) => (
                                <option key={phase.id} value={phase.id}>
                                    {phase.name}
                                </option>
                            ))}
                        </select>

                        {/* Filter Event */}
                        <select
                            className="border rounded-lg p-2"
                            value={selectedEvent}
                            onChange={(e) => setSelectedEvent(e.target.value)}
                        >
                            <option value="all">Semua Event</option>

                            {tournament.phases
                                .filter(
                                    (phase) =>
                                        selectedPhase === "all" ||
                                        String(phase.id) === selectedPhase
                                )
                                .flatMap((phase) => phase.events)
                                .map((event) => (
                                    <option key={event.id} value={event.id}>
                                        {event.name}
                                    </option>
                                ))}
                        </select>
                    </div>  
                    {tournament.phases
                            .filter(
                                (phase) =>
                                    selectedPhase === "all" ||
                                    String(phase.id) === selectedPhase
                            )
                            .map((phase) => (
                                <div key={phase.id} className="mb-6">

                                    <div className="font-bold text-lg mb-3">
                                        {phase.name}
                                    </div>

                                    {phase.events
                                        .filter(
                                            (event) =>
                                                selectedEvent === "all" ||
                                                String(event.id) === selectedEvent
                                        )
                                        .map((event) => (
                                            <div key={event.id} className="mb-4">

                                                <div className="font-semibold mb-2">
                                                    {event.name}
                                                </div>

                                                <div className="flex flex-wrap">

                                                    {event.matches.map((match) => (
                                                        <div
                                                            key={match.id}
                                                            className="border w-full md:w-1/3 p-3 font-normal m-2"
                                                        >
                                                    <div className="flex items-center justify-between gap-3">
                                                    <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                                                        <span className="truncate text-sm sm:text-base">
                                                            {match.home_team.short_name}
                                                        </span>

                                                        <img
                                                            className="w-10 h-10 md:h-14 md:w-14 object-contain sm:h-16 sm:w-16"
                                                            src={`http://localhost:8080/${match.home_team.logo}`}
                                                            alt={match.home_team.short_name}
                                                        />
                                                        </div>
                                                        <div className="shrink-0 text-xl font-bold sm:text-2xl">
                                                        {match.home_score}-{match.away_score}
                                                        </div>
                                                        <div className="flex min-w-0 flex-1 items-center gap-2">
                                                        <img
                                                            className="w-10 h-10 lg:h-14 lg:w-14 object-contain sm:h-16 sm:w-16"
                                                            src={`http://localhost:8080/${match.away_team.logo}`}
                                                            alt={match.away_team.short_name}
                                                        />

                                                        <span className="truncate text-sm sm:text-base">
                                                            {match.away_team.short_name}
                                                        </span>
                                                        </div>
                                                </div>
                                                <div className="mt-3 border-t pt-2 text-center text-sm sm:text-base">
                                                    {match.date && match.time ? (
                                                    <div>
                                                        {formatDate(match.date)} {formatTime(match.time)} WIB
                                                    </div>
                                                    ) : (
                                                    <div className="text-gray-500">
                                                        Jadwal belum tersedia
                                                    </div>
                                                    )}
                                                    <button onClick={() => setSelectedMatch(match)} className='button'>Detail</button>
                                                </div>
                                                {selectedMatch && (
                                                    <div
                                                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                                                        onClick={() => setSelectedMatch(null)}
                                                    >
                                                        <div
                                                            className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            {/* Header */}
                                                            <div className="flex items-center justify-between border-b pb-4">
                                                                <div>
                                                                    <h2 className="text-xl font-bold">
                                                                        {selectedMatch.home_team.short_name}
                                                                        {" vs "}
                                                                        {selectedMatch.away_team.short_name}
                                                                    </h2>

                                                                    <p className="text-sm text-gray-500">
                                                                        Game Details
                                                                    </p>
                                                                </div>

                                                                <button
                                                                    onClick={() => setSelectedMatch(null)}
                                                                    className="text-2xl text-gray-500 hover:text-gray-800"
                                                                >
                                                                    &times;
                                                                </button>
                                                            </div>

                                                            {/* Games */}
                                                            <div className="mt-4 space-y-3">
                                                                {selectedMatch.games.map((game) => (
                                                                    <div
                                                                        key={game.id}
                                                                        className="rounded-lg border p-4"
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <span className="font-semibold">
                                                                                Game {game.game_number} 
                                                                            </span>
                                                                            {game.winner_team_id === selectedMatch.home_team.id ?
                                                                            <span>
                                                                                {selectedMatch.home_team.short_name} Win
                                                                            </span> :
                                                                            <span>
                                                                                {selectedMatch.away_team.short_name} Win
                                                                            </span>
                                                                            
                                                                            }

                                                                        

                                                                            <span className="text-sm text-gray-500">
                                                                                {convertDuration(game.duration)}
                                                                            </span>
                                                                        </div>

                                                                        
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}


                                                
                                                

                                                        </div>
                                                        
                                                    ))}

                                                </div>

                                            </div>
                                        ))}
                                </div>
                            ))}
                </div>
            )}
        </div>
    )
}