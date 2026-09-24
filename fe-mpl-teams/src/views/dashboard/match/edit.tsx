import {useEffect, useState} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../../services/api";
export default function EditMatch() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [teams, setTeams] = useState<Team[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [home_team_id, setHomeTeamId] = useState<number>(0);
    const [away_team_id, setAwayTeamId] = useState<number>(0);
    const [event_id, setEventId] = useState<number>(0);
    const [date, setDate] = useState<string>("");
    const [time, setTime] = useState<string>("");
    const [best_of, setBestOf] = useState<number>(1);

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
        document.title = "Dashboard - Edit Match"
        const fetchMatch = async () => {
            try {
                const response = await api.get(`/matches/${id}`);
                const matchData = response.data.data;
                setHomeTeamId(matchData.home_team_id);
                setAwayTeamId(matchData.away_team_id);
                setEventId(matchData.event_id);
                setDate(matchData.date.slice(0,10));
                setTime(matchData.time);
                setBestOf(matchData.best_of || 1);
            } catch (error) {
                console.error("Error fetching match:", error);
            }
        };
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
        fetchMatch();
        fetchEvents();
        fetchTeams();
    },[id])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault(); // Add seconds if not present 
        const data = {
            home_team_id,
            away_team_id,
            event_id,
            date,
            time,
            best_of
        };
        try {
            await api.put(`/matches/${id}`, data, {
                headers: {"Content-Type" : "application/json"},
            });
            navigate("/dashboard/match");
        } catch (error) {
            console.error("Error updating match:", error);
        }
    }

    return (
        <div className="p-4">
            <h1 className="text-xl font-semibold">Edit Match</h1>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                <div className="flex gap-2 items-center">
                    <label htmlFor="home_team" className="block w-40 text-md font-medium text-gray-700">Home Team</label>
                    <select name="home_team" id="home_team" value={home_team_id} className="w-40 border border-gray-500 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => setHomeTeamId(Number(e.target.value))}>
                        <option value="">Pilih Home Team..</option>
                    {teams.map((team) => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                    ))}

                    </select>
                
                </div>
                <div className="flex gap-2 items-center">
                    <label htmlFor="away_team" className="block w-40 text-md font-medium text-gray-700">Away Team</label>
                    <select name="away_team" id="away_team" value={away_team_id} className="w-40 border border-gray-500 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => setAwayTeamId(Number(e.target.value))}>
                        <option value="">Pilih Away Team..</option>
                    {teams.map((team) => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                    </select>
                </div>
                
                <div className="flex gap-2 items-center">
                    <label htmlFor="event" className="block w-40 text-md font-medium text-gray-700">Event</label>
                    <select name="event" id="event" value={event_id} className="w-80 border border-gray-500 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => setEventId(Number(e.target.value))}>
                        <option value="">Pilih Event..</option>
                    {events.map((event) => (
                        <option key={event.id} value={event.id}>{event.name} - {event.phase.tournament.name}</option>
                    ))}
                    
                    </select>
                </div>
                <div className="flex gap-2 items-center">
                    <label htmlFor="best_of" className="block w-40 text-md font-medium text-gray-700">Best Of</label>
                    <input value={best_of} type="number" id="best_of" className="mt-1 block w-50 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                    readOnly />
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
