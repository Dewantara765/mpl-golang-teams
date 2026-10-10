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
    const [showBans, setShowBans] = useState<Record<number, boolean>>({});

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
        winner_team_id: number,
        duration: number,
        first_pick_team_id: number,
        hero_drafts: HeroDraft[],
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
        document.title = "Phase Matches";
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
            
            <div className="header-title">List Match</div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {phase.events.map((event) => (
                    <div key={event.id}>
                        <div className="font-semibold">{event.name}</div>
                        <table className="table-container">
                        <tbody>

                        {event.matches.map((match) => (
                            <tr key={match.id} onClick={() => setSelectedMatch(match)}>
                                <td className={`table-cell ${match.home_score > match.away_score ? "font-bold bg-green-200" : ""}`}>
                                    <div className="flex gap-2">
                                        <img src={`http://localhost:8080/${match.home_team.logo}`} alt={match.home_team.name}
                                        className="w-7 object-contain"/>
                                        <div>{match.home_team.short_name}</div>
                                    </div></td>
                                <td className={`table-cell ${match.home_score > match.away_score ? "font-bold" : ""}`}>{match.home_score}</td>
                                <td className={`table-cell ${match.home_score < match.away_score ? "font-bold" : ""}`}>{match.away_score}</td> 
                                <td className={`table-cell ${match.home_score < match.away_score ? "font-bold bg-green-200" : ""}`}>
                                    <div className="flex gap-2">
                                        <div>{match.away_team.short_name}</div>
                                        <img src={`http://localhost:8080/${match.away_team.logo}`} alt={match.away_team.short_name}
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
                                        {selectedMatch.home_team.name} {selectedMatch.home_score} - {selectedMatch.away_score} {selectedMatch.away_team.name}
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
                                    const homePicks = game.hero_drafts?.filter(
                                        (draft : any) =>
                                            draft.team_id === selectedMatch.home_team.id &&
                                            draft.type === "pick"
                                    );

                                    const sortedHomePicks = homePicks.sort((a,b) => a.id - b.id);

                                    const awayPicks = game.hero_drafts?.filter(
                                        (draft : any) =>
                                            draft.team_id === selectedMatch.away_team.id &&
                                            draft.type === "pick"
                                    );

                                    const sortedAwayPicks = awayPicks.sort((a,b) => a.id - b.id);

                                    const homeBans = game.hero_drafts?.filter(
                                        (draft : any) =>
                                            draft.team_id === selectedMatch.home_team.id &&
                                            draft.type === "ban"
                                    );

                                    const sortedHomeBans = homeBans.sort((a,b) => a.id - b.id);

                                    const awayBans = game.hero_drafts?.filter(
                                        (draft) =>
                                            draft.team_id === selectedMatch.away_team.id &&
                                            draft.type === "ban"
                                    );

                                    const sortedAwayBans = awayBans.sort((a,b) => a.id - b.id);

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

                                                <span className="text-sm text-gray-500">{convertDuration(game.duration)}</span>

                                                
                                            </div>

                                            {/* Teams */}
                                            <div className="mt-4 grid grid-cols-2 gap-6">

                                                {/* HOME */}
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold">{selectedMatch.home_team.short_name}</h3> 
                                                        {game.winner_team_id === selectedMatch.home_team.id ? 
                                                            <div className="rounded bg-green-500 px-2 py-1 text-xs font-semibold text-white">Menang</div> : 
                                                            <div className="rounded bg-gray-500 px-2 py-1 text-xs font-semibold text-white">Kalah</div>}
                                                    </div>
                                                    {/* Picks */}
                                                    {/* <p className="mt-3 text-xs font-semibold text-gray-500">
                                                        PICK
                                                    </p> */}

                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {sortedHomePicks.map((draft : any) => (
                                                            <img
                                                                key={draft.id}
                                                                src={`http://localhost:8080/${draft.hero.logo}`}
                                                                alt={draft.hero.name}
                                                                title={draft.hero.name}
                                                                className={`h-9 w-9 rounded ${game?.first_pick_team_id === selectedMatch.home_team.id ? 'ring-2 ring-blue-500' : 'ring-2 ring-red-500'}`}
                                                            />
                                                        ))}
                                                    </div>

                                                    {/* Bans */}
                                                    
                                                    
                                                    
                                                </div>

                                                

                                                {/* AWAY */}
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-semibold">
                                                            {selectedMatch.away_team.short_name}
                                                            
                                                        </h3>
                                                        {game.winner_team_id === selectedMatch.away_team.id ? 
                                                                <div className="rounded bg-green-500 px-2 py-1 text-xs font-semibold text-white">Menang</div> : 
                                                                <div className="rounded bg-gray-500 px-2 py-1 text-xs font-semibold text-white">Kalah</div>}
                                                    </div>
                                                    {/* Picks */}
                                                    {/* <p className="mt-3 text-xs font-semibold text-gray-500">
                                                        PICK
                                                    </p> */}

                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        {sortedAwayPicks.map((draft : any) => (
                                                            <img
                                                                key={draft.id}
                                                                src={`http://localhost:8080/${draft.hero.logo}`}
                                                                alt={draft.hero.name}
                                                                title={draft.hero.name}
                                                                className={`h-9 w-9 rounded ${game?.first_pick_team_id === selectedMatch.away_team.id ? 'ring-2 ring-blue-500' : 'ring-2 ring-red-500'}`}
                                                            />
                                                        ))}
                                                    </div>

                                                    

                                                    
                                                </div>
                                                {/* Bans */}
                                                
                                            </div>
                                            <button
                                                    onClick={() =>
                                                        setShowBans(prev => ({
                                                            ...prev,
                                                            [game.id]: !prev[game.id],
                                                        }))
                                                    }
                                                    className="mt-3 text-sm font-medium text-gray-600 hover:text-gray-900"
                                                >
                                                    {showBans[game.id] ? "▲ Hide Bans" : "▼ Show Bans"}
                                                </button>

                                                {showBans[game.id] && (
                                                    <div className="mt-3 border-t pt-3">
                                                        {/* <div className="mb-2 text-xs font-semibold text-gray-500">
                                                            BAN
                                                        </div> */}

                                                        <div className="grid grid-cols-2 gap-6">

                                                            {/* HOME BANS */}
                                                            <div className="flex flex-wrap gap-2">
                                                                {sortedHomeBans.map((draft: any) => (
                                                                    <img
                                                                        key={draft.id}
                                                                        src={`http://localhost:8080/${draft.hero.logo}`}
                                                                        alt={draft.hero.name}
                                                                        title={draft.hero.name}
                                                                        className={`h-9 w-9 rounded grayscale ${
                                                                            game.first_pick_team_id === selectedMatch.home_team.id
                                                                                ? "ring-2 ring-blue-500"
                                                                                : "ring-2 ring-red-500"
                                                                        }`}
                                                                    />
                                                                ))}
                                                            </div>

                                                            {/* AWAY BANS */}
                                                            <div className="flex flex-wrap gap-2">
                                                                {sortedAwayBans.map((draft: any) => (
                                                                    <img
                                                                        key={draft.id}
                                                                        src={`http://localhost:8080/${draft.hero.logo}`}
                                                                        alt={draft.hero.name}
                                                                        title={draft.hero.name}
                                                                        className={`h-9 w-9 rounded grayscale ${
                                                                            game.first_pick_team_id === selectedMatch.away_team.id
                                                                                ? "ring-2 ring-blue-500"
                                                                                : "ring-2 ring-red-500"
                                                                        }`}
                                                                    />
                                                                ))}
                                                            </div>

                                                        </div>
                                                    </div>
                                                )}

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