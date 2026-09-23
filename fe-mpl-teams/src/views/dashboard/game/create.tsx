import { useState, useEffect} from "react"
import { useParams, useNavigate } from "react-router-dom"
import { api } from "../../../services/api";
import { convertDuration } from "../../../../utils/duration";
export default function GameCreate(){
    const {id} = useParams();
    const [game_number, setGameNumber] = useState<number>(0);
    const [winner_team_id, setWinnerTeamId] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [match, setMatch] = useState<Match | null>(null);
    const [minutes, setMinutes] = useState<number>(0);
    const [seconds, setSeconds] = useState<number>(0);
    const navigate = useNavigate()

    const convertToSeconds = (minutes: number, seconds: number) => {
        const convertedDuration = (minutes * 60) + seconds;
        return convertedDuration
        
    }

    interface Match {
        id: number,
        home_team : {
            id: number,
            short_name: string,
        }
        away_team : {
            id: number,
            short_name: string,
        }
    }

    useEffect(() => {
        const fetchMatch = async() => {
            try {
                const response = await api.get(`/matches/${id}`)
                setMatch(response.data.data)
            } catch (error) {
                console.error("Error fetching matches", error)
            }
        }
        fetchMatch()
    },[])

    const handleSubmit = async(event : React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const data = {match_id : Number(id), game_number, duration, winner_team_id}
        try {
            await api.post("/games", data);
            navigate(`/dashboard/match/${id}`)
        }catch (error : any) {
            console.error("Error creating games", error)
        }
    }
    return (
        <div className="p-4">
            <title>Create Game</title>
            <div className="header-title">Create Game</div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="input-container">
                    <label htmlFor="game_number" className="input-label">Game</label>
                    <input value={game_number} type="text" id="game_number" className="mt-1 block w-50 input-field" 
                    onChange={(e) => setGameNumber(Number(e.target.value))} />
                </div>
                <div className="input-container">
                    <label htmlFor="duration" className="input-label">Durasi (dalam detik)</label>
                    <input value={duration} type="text" id="duration" className="mt-1 block w-50 input-field" 
                    onChange={(e) => setDuration(Number(e.target.value))} />
                </div>
                <div className="input-container">
                    <label htmlFor="winner_team" className="input-label">Tim Pemenang</label>
                    <select name="winner_team" id="winner_team" value={winner_team_id} className="w-80 select-field"
                    onChange={(e) => setWinnerTeamId(Number(e.target.value))}>
                        <option value="">Pilih Tim Pemenang..</option>
                        <option value={match?.home_team.id}>{match?.home_team.short_name}</option>
                        <option value={match?.away_team.id}>{match?.away_team.short_name}</option>
                    </select>
                </div>
                <button type="submit" className="button">Add Game</button>
            </form>
            <div className="sub-header-title">Konversi ke detik</div>
            <div className="input-container">
                    <label htmlFor="minutes" className="input-label">Menit</label>
                    <input value={minutes} type="text" id="minutes" className="mt-1 block w-50 input-field" 
                    onChange={(e) => setMinutes(Number(e.target.value))} />
            </div>
            <div className="input-container">
                    <label htmlFor="seconds" className="input-label">Detik</label>
                    <input value={seconds} type="text" id="seconds" className="mt-1 block w-50 input-field" 
                    onChange={(e) => setSeconds(Number(e.target.value))} max={59}/>
            </div>
            <div>Durasi dalam detik adalah {convertToSeconds(minutes, seconds)} detik</div>
        </div>
    )
}