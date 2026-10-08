import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { api } from "../../../services/api"
import { formatDate } from "../../../../utils/formatDate"
import { formatTime } from "../../../../utils/formatTime"
import { convertDuration } from "../../../../utils/duration"
export default function DashboardMatchShow(){
    const {id} = useParams()
    const [match, setMatch] = useState<Match | null>(null);
    const [date, setDate] = useState<string>("");
    const [time, setTime] = useState<string>("");

    const [games, setGames] = useState<Game[]>([]);
    const [selectedGame, setSelectedGame] = useState<Game | null>(null);
    const [showDraft, setShowDraft] = useState<boolean>(false);
    const [drafts, setDrafts] = useState<Draft[]>([]);

    const bans = drafts.filter(draft => draft.type === "ban");
    const picks = drafts.filter(draft => draft.type === "pick");

    interface Draft {
        id: number,
        game: {
            id: number,
            game_number: number,
        }
        team: {
            id: number,
            name: string,
            short_name: string,
            logo: string
        }
        hero: {
            id: number,
            name: string,
            logo: string
        }
        type: string,
    }

    interface Game {
        id: number,
        game_number: number,
        match: Match,
        winner_team: Team,
        winner_team_id: number,
        duration: number,
        first_pick_team: Team,
        first_pick_team_id: number,
    }

    interface Match {
        id: number;
        home_team : Team
        away_team: Team
        home_score : number,
        away_score : number,
        date: string,
        time: string,
        best_of: number,
        Games: Game[],
        event: {
            id: number,
            name: string,
            phase: {
                id: number,
                name: string,
                tournament: {
                    id: number,
                    name: string
                }
            }
        }

    }

        interface Team {
        name: string,
        short_name: string,
        logo: string
    }

    
    useEffect(() => {
        const fetchMatch = async() => {
            try {
                const response = await api.get(`matches/${id}`)
                const matchData = response.data.data;
                setMatch(matchData)
                setDate(formatDate(matchData.date))
                setTime(formatTime(matchData.time))
                setGames(matchData.games)
                
                
            }catch (error : any) {
                console.error("Error fetching matches:", error);
            }
        }
        fetchMatch()
        
    },[])
        const fetchHeroDrafts = async (gameId: number) => {
        try {
            const response = await api.get(`hero-drafts/games/${gameId}`);
            setDrafts(response.data);
            

        } catch (error) {
            console.error("Error fetching hero drafts:", error);
        }
    };
    return (     
        <div className="p-4">
            <title>Dashboard - Match details </title>
            <p className="header-title">Match details</p>
            {match ?
            <table className="table-container">
                <tbody>
                    <tr>
                        <th className="table-cell">Hasil pertandingan</th>
                        <td className="table-cell">
                            <div className="flex gap-2">
                                <img src={`http://localhost:8080/${match?.home_team.logo}`} alt={match?.home_team.name} className="w-10 object-contain"/>
                                <div>{match?.home_team.name} <b>{match?.home_score}</b>-<b>{match?.away_score}</b> {match?.away_team.name} </div>
                                <img src={`http://localhost:8080/${match?.away_team.logo}`} alt={match?.away_team.name} className="w-10 object-contain"/>
                            </div>
                            <div className="text-center">
                                (BO{match?.best_of})
                            </div>
                            
                        </td>
                    </tr>
                    <tr>
                        <th className="table-cell">Tanggal & Waktu</th>
                        <td className="table-cell">
                            {date} {time} WIB
                            
                        </td>
                    </tr>
                    <tr>
                        <th className="table-cell">Event</th>
                        <td className="table-cell">
                            {match?.event.name}
                            
                        </td>
                    </tr>
                    <tr>
                        <th className="table-cell">Phase</th>
                        <td className="table-cell">
                            {match?.event.phase.name}
                            
                        </td>
                    </tr>
                    <tr>
                        <th className="table-cell">Tournament</th>
                        <td className="table-cell">
                            {match?.event.phase.tournament.name}
                            
                        </td>
                    </tr>
                </tbody>

            </table>
            : <div>Tidak ada data..</div>}
            <div className="sub-header-title">Daftar game :</div>
            {games ? (
            <table className="table-container">
                <thead>
                    <tr>
                        <th className="table-cell">Game</th>
                        <th className="table-cell">Durasi</th>
                        <th className="table-cell">Pemenang</th>
                        <th className="table-cell">First Pick</th>
                        <th className="table-cell">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {games.map((game) => (
                        <tr key={game.id}>
                            <td className="table-cell">Game {game.game_number}</td>
                            <td className="table-cell">{convertDuration(game.duration)}</td>
                                <td className="table-cell">
                                    {game.winner_team.short_name}</td>
                                <td className="table-cell">
                                    {game.first_pick_team.short_name}
                                </td>
                            <td className="table-cell">
                                <div className="flex gap-2">
                                    <Link to={`/dashboard/match/${id}/game/${game.id}/create`} className="button">
                                        Add Draft
                                    </Link>
                                    <button className="show-button"
                                    onClick={() => {
                                        setSelectedGame(game)
                                        fetchHeroDrafts(game.id)
                                        setShowDraft(true);
                                        }}>
                                        Show Draft
                                    </button>
                                    {/* <Link to={`/dashboard/match/${id}/game/${game.id}/update_fp`} className="edit-button">
                                        Update First Pick
                                    </Link> */}
                                </div>
                            </td>
                        </tr>
                    )

                    )}

                </tbody>
            </table> 
            ): <div>Tidak ada data game..</div>}
            <Link to={`/dashboard/match/${id}/create`} className="button">Buat game</Link>
            {showDraft && selectedGame && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center" onClick={() => setShowDraft(false)}>
                <div className="bg-white p-6 rounded-lg w-[700px]">

                    <h2 className="text-xl font-bold mb-6">
                        Game {selectedGame.game_number} - Hero Draft
                    </h2>

                    <h3 className="font-bold mb-3">
                        Ban
                    </h3>

                    <div className="grid grid-cols-5 gap-3 mb-6">
                        {bans.map(draft => (
                            <div key={draft.id}>
                                <img
                                    src={`http://localhost:8080/${draft.hero.logo}`}
                                    alt={draft.hero.name}
                                    className="w-16 h-16 object-cover rounded grayscale"
                                />

                                <p className="text-xs">
                                    {draft.hero.name}
                                </p>

                                <p className="text-xs text-gray-500">
                                    {draft.team.short_name}
                                </p>
                            </div>
                        ))}
                    </div>

                    <h3 className="font-bold mb-3">
                        Pick
                    </h3>

                    <div className="grid grid-cols-5 gap-3">
                        {picks.map(draft => (
                            <div key={draft.id}>
                                <img
                                    src={`http://localhost:8080/${draft.hero.logo}`}
                                    alt={draft.hero.name}
                                    className="w-16 h-16 object-cover rounded"
                                />

                                <p className="text-xs">
                                    {draft.hero.name}
                                </p>

                                <p className="text-xs text-gray-500">
                                    {draft.team.short_name}
                                </p>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setShowDraft(false)}
                        className="mt-6 bg-gray-500 text-white px-4 py-2 rounded"
                    >
                        Tutup
                    </button>

                </div>
            </div>
        )}
        
            
        </div>
    )
}