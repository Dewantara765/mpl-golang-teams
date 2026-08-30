import {useState, useEffect} from 'react'
import {api} from '../../services/api.ts'
import {useParams} from 'react-router-dom'
export default function MatchIndex() {
    const [tournament, setTournament] = useState<Tournament | null>(null);
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
        home_team : Team[]
        away_team: Team[]
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
        return formattedDate
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
                    {tournament.phases.map((phase) => (
                        <div key={phase.id}>
                            <h2>{phase.name}</h2>
                            {phase.events.map((event) => (
                                <div key={event.id}>
                                    <h2>{event.name}</h2>
                                    {event.matches.map((match) => (
                                        <div key={match.id} className='border w-50 p-2 font-normal m-2'>
                                            <p>{match.home_team.short_name} {match.home_score}-{match.away_score} {match.away_team.short_name}
                                            </p>
                                            <p>{formatDate(match.date)} {formatTime(match.time)}</p>
                                        </div>
                                    )

                                    )}
                                </div>
                            )

                            )}
                        </div>
                        
                    
                    ))}
                </div>
            )}
        </div>
    )
}