import {useParams, useNavigate} from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../../services/api";
export default function UpdateFirstPick() {
    const {id} = useParams();
    const {game_id} = useParams();
    const navigate = useNavigate();
    const [match, setMatch] = useState<Match | null>(null);
    const [game, setGame] = useState<Game | null>(null);
    const [team_id, setTeamId] = useState<number>(0);

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

    interface Game {
        id: number,
        game_number: number,
        duration: number,
        winner_team_id: number,
        first_pick_team_id: number,
    }

    useEffect(() => {
        const fetchMatch = async () => {
            try {
                const response = await api.get(`/matches/${id}`);
                setMatch(response.data.data);
            } catch (error) {
                console.error("Error fetching teams:", error);
            }
        };

        const fetchGame = async () => {
            try {
                const response = await api.get(`/games/${game_id}`);
                setGame(response.data.data);
            } catch (error) {
                console.error("Error fetching game:", error);
            }

        };
        fetchMatch();
        fetchGame();

    }, [id, game_id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.put(`/games/${game_id}/first-pick`, { team_id });
            navigate(`/dashboard/match/${id}`);
        } catch (error) {
            console.error("Error updating First Pick:", error);
            
        }
    }
    return (
        <div className="p-4">
            <title>Update First Pick </title>
            <div className="header-title">Update First Pick for Game {game?.game_number} in Match ID {match?.id}</div>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                <div className="flex gap-2 items-center">
                    <label htmlFor="team" className="input-label">First Pick Team</label>
                    <select name="team" id="team" value={team_id} className="w-40 select-field"
                    onChange={(e) => setTeamId(Number(e.target.value))}>
                        <option value="">Pilih Team..</option>
                        <option value={match?.home_team.id}>{match?.home_team.short_name}</option>
                        <option value={match?.away_team.id}>{match?.away_team.short_name}</option>
                

                

                    </select>
                </div>
                <button type="submit" className="button">Update First Pick</button>
            </form>
        </div>
    
    )
}