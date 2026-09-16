import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../services/api";

export default function CreateMatch() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [home_team_id, setHomeTeamId] = useState<number>(0);
    const [away_team_id, setAwayTeamId] = useState<number>(0);
    const [event_id, setEventId] = useState<number>(0);
    const [home_score, setHomeScore] = useState<number>(0);
    const [away_score, setAwayScore] = useState<number>(0);
    const [date, setDate] = useState<string>("");
    const [time, setTime] = useState<string>("");
    const [best_of, setBestOf] = useState<number>(1);
    const navigate = useNavigate();


    interface Team {
        id: number,
        name: string,
    }

    interface Event {
        id: number,
        name: string,
        phase: {
            name: string,
            tournament: {
                id: number,
                name: string,
            }
        }
    }
    useEffect(() => {
        document.title = "Dashboard - Create Match"
        const fetchTeams = async () => {
            try {
                const response = await api.get("/teams");
                setTeams(response.data.data);
            } catch (error) {
                console.error("Error fetching teams:", error);
            }
        };

        const fetchEvents = async () => {
            try {
                const response = await api.get("/events");
                setEvents(response.data.data);
            } catch (error) {
                console.error("Error fetching events:", error);
            }
        };
        fetchEvents();
        fetchTeams();
    },[])
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formattedTime = time.length === 5 ? time + ":00" : time; // Add seconds if not present
        const data = {
            home_team_id,
            away_team_id,
            event_id,
            home_score,
            away_score,
            date,
            time: formattedTime,
            best_of,
        };
        try {
            await api.post("/matches", data);
            navigate("/dashboard/match");
        } catch (error) {
            console.error("Error creating match:", error);
        }
    };
    return (
        <div className='p-4'>
            <p className="font-semibold text-xl mb-3">Create Match Page</p>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                <div className="flex gap-2 items-center">
                    <label htmlFor="home_team" className="input-label">Home Team</label>
                    <select name="home_team" id="home_team" value={home_team_id} className="w-40 select-field"
                    onChange={(e) => setHomeTeamId(Number(e.target.value))}>
                        <option value="">Pilih Home Team..</option>
                    {teams.map((team) => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                    ))}

                    </select>
                
                </div>
                <div className="flex gap-2 items-center">
                    <label htmlFor="away_team" className="input-label">Away Team</label>
                    <select name="away_team" id="away_team" value={away_team_id} className="w-40 select-field"
                    onChange={(e) => setAwayTeamId(Number(e.target.value))}>
                        <option value="">Pilih Away Team..</option>
                    {teams.map((team) => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                    </select>
                </div>
                
                <div className="flex gap-2 items-center">
                    <label htmlFor="event" className="input-label">Event</label>
                    <select name="event" id="event" value={event_id} className="w-80 select-field"
                    onChange={(e) => setEventId(Number(e.target.value))}>
                        <option value="">Pilih Event..</option>
                    {events.map((event) => (
                        <option key={event.id} value={event.id}>{event.name} - {event.phase.tournament.name}</option>
                    ))}
                    
                    </select>
                </div>
                <div className="flex gap-2 items-center">
                    <label htmlFor="best_of" className="input-label">Best Of</label>
                    <input value={best_of} type="number" id="best_of" className="mt-1 block w-50 input-field" 
                    onChange={(e) => setBestOf(Number(e.target.value))} />
                </div>

                <div className="flex gap-2 items-center">
                    <label htmlFor="home_score" className="input-label">Home Score</label>
                    <input value={home_score} type="number" id="home_score" className="mt-1 block w-50 input-field" 
                    onChange={(e) => setHomeScore(Number(e.target.value))} />
                </div>
                <div className="flex gap-2 items-center">
                    <label htmlFor="away_score" className="input-label">Away Score</label>
                    <input value={away_score} type="number" id="away_score" className="mt-1 block w-50 input-field" 
                    onChange={(e) => setAwayScore(Number(e.target.value))} />
                </div>
                <div className="flex gap-2 items-center">
                    <label htmlFor="date" className="input-label">Date</label>
                    <input value={date} type="date" id="date" className="mt-1 block w-50 input-field" 
                    onChange={(e) => setDate(e.target.value)} />
                </div>

                <div className="flex gap-2 items-center">
                    <label htmlFor="time" className="input-label">Time</label>
                    <input value={time} type="time" id="time" className="mt-1 block w-50 input-field" 
                    onChange={(e) => setTime(e.target.value)} />
                </div>
                <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Add Match</button>
            </form>
        </div>
    )
}