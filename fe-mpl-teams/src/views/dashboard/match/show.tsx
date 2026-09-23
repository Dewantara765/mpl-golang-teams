import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { api } from "../../../services/api"
import { formatDate } from "../../../../utils/formatDate"
import { formatTime } from "../../../../utils/formatTime"
import { convertDuration } from "../../../../utils/duration"
export default function DashboardMatchShow(){
    const {id} = useParams()
    const [home_team_name, setHomeTeamName] = useState<string>("")
    const [home_score, setHomeScore] = useState<number>(0);
    const [away_score, setAwayScore] = useState<number>(0);
    const [best_of, setBestOf] = useState<number>(0);
    const [away_team_name, setAwayTeamName] = useState<string>("")
    const [home_team_logo, setHomeTeamLogo] = useState<string>("")
    const [away_team_logo, setAwayTeamLogo] = useState<string>("")
    const [date, setDate] = useState<string>("");
    const [time, setTime] = useState<string>("");
    const [event_name, setEventName] = useState<string>("");
    const [phase_name, setPhaseName] = useState<string>("");
    const [tournament_name, setTournamentName] = useState<string>("");
    const [games, setGames] = useState<Game[]>([]);

    interface Game {
        id: number,
        game_number: number,
        match: Match,
        winner_team: Team,
        winner_team_id: number,
        duration: number,
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

        interface Team {
        name: string,
        short_name: string,
        logo: string
    }

    
    useEffect(() => {
        const fetchMatch = async() => {
            try {
                const response = await api.get(`matches/${id}`)
                const match = response.data.data;
                setHomeTeamName(match.home_team.name)
                setAwayTeamName(match.away_team.name)
                setHomeScore(match.home_score)
                setAwayScore(match.away_score)
                setBestOf(match.best_of)
                setHomeTeamLogo(`http://localhost:8080/${match.home_team.logo}`)
                setAwayTeamLogo(`http://localhost:8080/${match.away_team.logo}`)
                setDate(formatDate(match.date))
                setTime(formatTime(match.time))
                setEventName(match.event.name)
                setPhaseName(match.event.phase.name)
                setTournamentName(match.event.phase.tournament.name)
                setGames(match.games)
                
                
            }catch (error : any) {
                console.error("Error fetching matches:", error);
            }
        }
        fetchMatch()
        
    },[])
    return (     
        <div className="p-4">
            <title>Dashboard - Match details </title>
            <p className="header-title">Match details</p>
            <table className="table-container">
                <tbody>
                    <tr>
                        <th className="table-cell">Hasil pertandingan</th>
                        <td className="table-cell">
                            <div className="flex gap-2">
                                <img src={home_team_logo} alt={home_team_name} className="w-10 object-contain"/>
                                <div>{home_team_name} <b>{home_score}</b>-<b>{away_score}</b> {away_team_name} </div>
                                <img src={away_team_logo} alt={away_team_name} className="w-10 object-contain"/>
                            </div>
                            <div className="text-center">
                                (BO{best_of})
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
                            {event_name}
                            
                        </td>
                    </tr>
                    <tr>
                        <th className="table-cell">Phase</th>
                        <td className="table-cell">
                            {phase_name}
                            
                        </td>
                    </tr>
                    <tr>
                        <th className="table-cell">Tournament</th>
                        <td className="table-cell">
                            {tournament_name}
                            
                        </td>
                    </tr>
                </tbody>

            </table>
            <div className="sub-header-title">Daftar game :</div>
            <table className="table-container">
                <thead>
                    <tr>
                        <th className="table-cell">Game</th>
                        <th className="table-cell">Durasi</th>
                        <th className="table-cell">Pemenang</th>
                    </tr>
                </thead>
                <tbody>
                    {games.map((game) => (
                        <tr key={game.id}>
                            <td className="table-cell">Game {game.game_number}</td>
                            <td className="table-cell">{convertDuration(game.duration)}</td>
                            <td className="table-cell">
                                {game.winner_team.short_name}</td>
                        </tr>
                    )

                    )}

                </tbody>
            </table> 
            
            <Link to={`/dashboard/match/${id}/create`} className="button">Buat game</Link>
            
        </div>
    )
}