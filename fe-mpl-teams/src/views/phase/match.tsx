import { useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import { api } from "../../services/api";

export default function PhaseMatches(){
    const { slug, phaseSlug } = useParams<{
        slug: string;
        phaseSlug: string;
    }>();

    const [phase, setPhase] = useState<Phase[]>([]);
    const [loading, setLoading] = useState(true);

    interface Phase {
        id: number,
        name: string,
        slug: string,
        events: Event[],

    }

    interface Event {
        id: number,
        name: string,
        type: string,
        phase: Phase,
        matches: Match[],
    }

    interface Match {
        id: number,
        home_team : Team,
        away_team: Team,
        home_score: number,
        away_score : number,
        best_of : number,
        date: string,
        time : string,
        event : Event
    }

    interface Team {
        id: number,
        name: string,
        short_name : string,
        logo: string,
    }

    useEffect(() => {
        if (!slug || !phaseSlug) return;
        const fetchMatches = async () => {
            try {
                setLoading(true);

                const response = await api.get(
                    `/tournaments/${slug}/phases/${phaseSlug}`
                );

                setPhase(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchMatches()
    },[slug, phaseSlug])

    if (loading) {
        return <div>Loading...</div>;
    }
    return (
        <div className="p-4">
            <title>Phase matches</title>
            <div className="header-title">List Match</div>
            {phase.events.map((event) => (
                <div key={event.id}>
                    <div className="font-semibold">{event.name}</div>

                    {event.matches.map((match) => (
                        <div key={match.id}>
                            {match.home_team.name} {match.home_score}-{match.away_score} {match.away_team.name}
                        </div>
                    ))}
                </div>
            ))}

        </div>
    )
}