import { useEffect, useState } from "react"
import { useParams } from "react-router-dom";
import { api } from "../../services/api";
import { convertDuration } from "../../../utils/duration";
import {formatDate} from "../../../utils/formatDate";
import {formatTime} from "../../../utils/formatTime";

export default function PhaseMatches(){
    const { slug, phaseSlug } = useParams<{
        slug: string;
        phaseSlug: string;
    }>();

    const [phase, setPhase] = useState<Phase[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

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
        event : Event,
        games : Game[],
    }

    interface Game {
        id: number,
        game_number: number,
        match: Match,
        winner_team: Team,
        duration: number,
        hero_draft: HeroDraft[],
    }

    interface HeroDraft {
        id: number,
        game: Game,
        team_id: number,
        hero_id: number,
        type: string,
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {phase.events.map((event) => (
                    <div key={event.id}>
                        <div className="font-semibold">{event.name}</div>
                        <table className="table-container">
                        <tbody>

                        {event.matches.map((match) => (
                            <tr key={match.id} onClick={() => setSelectedMatch(match)}>
                                <td className="table-cell">
                                    <div className="flex gap-2">
                                        <img src={`http://localhost:8080/${match.home_team.logo}`} alt={match.home_team.name}
                                        className="w-7 object-contain"/>
                                        {match.home_team.name}
                                    </div></td>
                                <td className="table-cell">{match.home_score}-{match.away_score}</td> 
                                <td className="table-cell">
                                    <div className="flex gap-2">
                                        {match.away_team.name}
                                        <img src={`http://localhost:8080/${match.away_team.logo}`} alt={match.away_team.name}
                                        className="w-7 object-contain"/>
                                    </div>
                                    
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    </div>
                ))}
                {selectedMatch && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-transparent p-4"
                        onClick={() => setSelectedMatch(null)}
                    >
                        <div
                            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between border-b pb-4">
                                <div>
                                    <h2 className="text-xl font-bold">
                                        {selectedMatch.home_team.short_name} {selectedMatch.home_score} - {selectedMatch.away_score} {selectedMatch.away_team.short_name}
                                    </h2>

                                    <p className="text-sm text-gray-500">
                                        {formatDate(selectedMatch.date)} {formatTime(selectedMatch.time)} WIB
                                    </p>

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
                                {selectedMatch.games.map((game) => {
                                    const homePicks = game.hero_draft?.filter(
                                        (draft) =>
                                            draft.team_id === selectedMatch.home_team.id &&
                                            draft.type === "pick"
                                    );

                                    const awayPicks = game.hero_draft?.filter(
                                        (draft) =>
                                            draft.team_id === selectedMatch.away_team.id &&
                                            draft.type === "pick"
                                    );

                                    const homeBans = game.hero_draft?.filter(
                                        (draft) =>
                                            draft.team_id === selectedMatch.home_team.id &&
                                            draft.type === "ban"
                                    );

                                    const awayBans = game.hero_draft?.filter(
                                        (draft) =>
                                            draft.team_id === selectedMatch.away_team.id &&
                                            draft.type === "ban"
                                    );

                                    return (
                                        <div
                                            key={game.id}
                                            className="rounded-lg border p-4"
                                        >
                                            {/* Game Header */}
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold">
                                                    Game {game.game_number}
                                                </span>

                                                <span className="text-sm text-gray-500">
                                                    {convertDuration(game.duration)}
                                                </span>
                                            </div>

                                            {/* Teams */}
                                            <div className="mt-4 grid grid-cols-2 gap-6">

                                                {/* HOME */}
                                                <div>
                                                    <h3 className="font-semibold">
                                                        {selectedMatch.home_team.short_name}
                                                    </h3>

                                                    {/* Picks */}
                                                    <p className="mt-3 text-xs font-semibold text-gray-500">
                                                        PICK
                                                    </p>

                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {homePicks.map((draft) => (
                                                            <img
                                                                key={draft.id}
                                                                src={`http://localhost:8080/${draft.hero.logo}`}
                                                                alt={draft.hero.name}
                                                                title={draft.hero.name}
                                                                className="h-10 w-10 rounded"
                                                            />
                                                        ))}
                                                    </div>

                                                    {/* Bans */}
                                                    <p className="mt-4 text-xs font-semibold text-gray-500">
                                                        BAN
                                                    </p>

                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {homeBans.map((draft) => (
                                                            <img
                                                                key={draft.id}
                                                                src={`http://localhost:8080/${draft.hero.logo}`}
                                                                alt={draft.hero.name}
                                                                title={draft.hero.name}
                                                                className="h-10 w-10 rounded grayscale"
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* AWAY */}
                                                <div>
                                                    <h3 className="font-semibold">
                                                        {selectedMatch.away_team.short_name}
                                                    </h3>

                                                    {/* Picks */}
                                                    <p className="mt-3 text-xs font-semibold text-gray-500">
                                                        PICK
                                                    </p>

                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {awayPicks.map((draft) => (
                                                            <img
                                                                key={draft.id}
                                                                src={`http://localhost:8080/${draft.hero.logo}`}
                                                                alt={draft.hero.name}
                                                                title={draft.hero.name}
                                                                className="h-10 w-10 rounded"
                                                            />
                                                        ))}
                                                    </div>

                                                    {/* Bans */}
                                                    <p className="mt-4 text-xs font-semibold text-gray-500">
                                                        BAN
                                                    </p>

                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {awayBans.map((draft) => (
                                                            <img
                                                                key={draft.id}
                                                                src={`http://localhost:8080/${draft.hero.logo}`}
                                                                alt={draft.hero.name}
                                                                title={draft.hero.name}
                                                                className="h-10 w-10 rounded grayscale"
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Winner */}
                                            <div className="mt-4 border-t pt-3 text-sm">
                                                <span className="font-semibold">
                                                    {game.winner_team_id === selectedMatch.home_team.id
                                                        ? selectedMatch.home_team.short_name
                                                        : selectedMatch.away_team.short_name}
                                                </span>{" "}
                                                Menang
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </div>
    )
}