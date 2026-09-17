import {useState, useEffect} from 'react'
import {api} from '../../services/api.ts'
import {useParams} from 'react-router-dom'
export default function MatchIndex() {
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const [selectedPhase, setSelectedPhase] = useState("all");
    const [selectedEvent, setSelectedEvent] = useState("all");
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
        time: string

    }

    interface Team {
        name: string,
        short_name: string,
        logo: string
    }
    

    useEffect(() => {
        document.title = 'Match Index';
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

    const formatDate = (date: string) => {
        const formattedDate = date.slice(0,10)
        const month = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"]
        const [year, monthIndex, day] = formattedDate.split('-');
        return `${day} ${month[parseInt(monthIndex) - 1]} ${year}`;
    }

    const formatTime = (time: string) => {
        const formattedTime = time.slice(0,5)
        return formattedTime
    }
    return (
        <div className="p-4">
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
                                                            className="border w-full lg:w-1/4 p-3 font-normal m-2"
                                                        >
                                                             <div className="flex items-center justify-between gap-3">
                                                    <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                                                        <span className="truncate text-sm sm:text-base">
                                                            {match.home_team.short_name}
                                                        </span>

                                                        <img
                                                            className="w-10 h-10 lg:h-14 lg:w-14 object-contain sm:h-16 sm:w-16"
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
                                                </div>

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