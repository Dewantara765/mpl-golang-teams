import {useParams, useNavigate} from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../../../services/api";
export default function CreateDraft() {
    const {id} = useParams();
    const navigate = useNavigate();
    const {game_id} = useParams();
    const [teams, setTeams] = useState<Team[]>([]);
    const [heroes, setHeroes] = useState<Hero[]>([]);
    const [team_id, setTeamId] = useState<number>(0);
    const [selectedHeroes, setSelectedHeroes] = useState<number[]>([]);
    const [type, setType] = useState<string>("");
    interface Team {
        id: number,
        name: string,
    }

    interface Hero {
        id: number,
        name: string,
        logo: string,
    }

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const response = await api.get("/teams");
                setTeams(response.data.data);
            } catch (error) {
                console.error("Error fetching teams:", error);
            }
        };

        const fetchHeroes = async () => {
            try {
                const response = await api.get("/heroes?all=true");
                setHeroes(response.data.data);
            } catch (error) {
                console.error("Error fetching heroes:", error);
            }
        };

        fetchTeams();
        fetchHeroes();
    }, [id, game_id]);

    const selectHero = (heroId: number) => {
    setSelectedHeroes((prev) => {
        if (prev.includes(heroId)) {
            return prev.filter((id) => id !== heroId);
        }

        if (prev.length >= 5) {
            return prev;
        }

        return [...prev, heroId];
    });
};


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = {
            team_id,
            hero_ids: selectedHeroes,
            type,
            game_id: Number(game_id),
        };
        try {
            await api.post("/hero-drafts", data);
            setSelectedHeroes([]);
            navigate(`/dashboard/match/${id}`);
        } catch (error) {
            console.error("Error creating draft:", error);
        }
    }

    return (
        <div className="p-4">
            <title>Create Draft</title>
            <div className="header-title">Create Draft for Game ID {game_id} in Match ID {id}</div>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                <div className="flex gap-2 items-center">
                    <label htmlFor="team" className="input-label">Team</label>
                    <select name="team" id="team" value={team_id} className="w-40 select-field"
                    onChange={(e) => setTeamId(Number(e.target.value))}>
                        <option value="">Pilih Team..</option>
                    {teams.map((team) => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                    ))}

                

                    </select>
                </div>
                
                <div className="flex gap-2 items-center">
                    <label htmlFor="type" className="input-label">Type</label>
                    <select name="type" id="type" value={type} className="w-40 select-field"
                    onChange={(e) => setType(e.target.value)}>
                        <option value="">Pilih Type..</option>
                        <option value="pick">Pick</option>
                        <option value="ban">Ban</option>

                

                    </select>
                </div>
                <div className="flex gap-2">
                    <label htmlFor="type" className="input-label">Heroes ({selectedHeroes.length}/5)</label>
                    <div className="grid grid-cols-12 gap-2">
                        {heroes.map((hero) => (
                            <button
                                key={hero.id}
                                type="button"
                                title={hero.name}
                                onClick={() => selectHero(hero.id)}
                                className={`w-12 h-12 border rounded-md overflow-hidden ${
                                    selectedHeroes.includes(hero.id)
                                        ? "ring-2 ring-blue-500 "
                                        : ""}
                                `}
                            >
                                <img src={`http://localhost:8080/${hero.logo}`} alt={hero.name} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-4">
                    <h3 className="font-semibold">
                        Selected Heroes ({selectedHeroes.length}/5)
                    </h3>

                    <div className="flex gap-2 mt-2">
                        {selectedHeroes.map((heroId) => {
                            const hero = heroes.find((hero) => hero.id === heroId);

                            return hero ? (
                                <span
                                    key={hero.id}
                                    className="px-3 py-1 bg-blue-100 rounded"
                                >
                                    {hero.name}
                                </span>
                            ) : null;
                        })}
                    </div>
                </div>


                
                <button type="submit" className="button">Create Draft</button>
            </form>
        </div>
    );
}