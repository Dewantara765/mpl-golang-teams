import {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../../services/api";
import Select from "react-select";
import AsyncSelect from "react-select/async";
export default function CreateMatch() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const [home_team_id, setHomeTeamId] = useState<number>(0);
    const [away_team_id, setAwayTeamId] = useState<number>(0);
    const [event_id, setEventId] = useState<number>(0);
    const [selectedEvent, setSelectedEvent] = useState<EventOption | null>(null);
    // const [home_score, setHomeScore] = useState<number >(0);
    // const [away_score, setAwayScore] = useState<number>(0);
    const [date, setDate] = useState<string>("");
    const [time, setTime] = useState<string>("");
    const [best_of, setBestOf] = useState<number>(1);
    const navigate = useNavigate();
    const [errors, setErrors] = useState<{
        home_team_id?: number;
        away_team_id?: number;
        event_id?: number;
        date?: string;
        time?: string;
        best_of?: string;}>({});


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
        setErrors({});
        const formattedTime = time.length === 5 ? time + ":00" : time; // Add seconds if not present
        const data = {
            home_team_id,
            away_team_id,
            event_id: selectedEvent?.value,
            date,
            time: formattedTime,
            best_of,
        };
        try {
            await api.post("/matches", data);
            navigate("/dashboard/match");
        } catch (error : any) {
            console.error("Error creating match:", error);
            setErrors(
            error.response?.data?.errors ?? {
                general: "Failed to create match",
            }
    );
        }
    };

    interface EventOption {
        value: number;
        label: string;
    }

    const loadEvents = async (
        inputValue: string
    ): Promise<EventOption[]> => {
        const response = await api.get("/events", {
            params: {
                search: inputValue,
                page: 1,
                limit: 7,
            },
        });

        const events: Event[] = response.data.data;

        return events.map((event) => ({
            value: event.id,
            label: `${event.name} - ${event.phase.name} - ${event.phase.tournament.name}`,
        }));
    };

    return (
        <div className='p-4'>
            <p className="font-semibold text-xl mb-3">Create Match Page</p>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                {errors.general && (
                    <p className="text-sm text-red-500 mb-3">
                        {errors.general}
                    </p>
                )}
                <div className="flex gap-2 items-center">
                    <label htmlFor="home_team" className="input-label">Home Team</label>
                    <select name="home_team" id="home_team" value={home_team_id} className="w-40 select-field"
                    onChange={(e) => setHomeTeamId(Number(e.target.value))}>
                        <option value="">Pilih Home Team..</option>
                    {teams.map((team) => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                    ))}

                    </select>
                    {errors.home_team_id && (
                        <p className="text-red-500 text-sm">{errors.home_team_id}</p>
                    )

                    }
                
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
                    {errors.away_team_id && (
                        <p className="text-red-500 text-sm">{errors.away_team_id}</p>
                    )

                    }
                </div>
                
                <div className="flex gap-2 items-center">
                    <label htmlFor="event" className="input-label">Event</label>
                    <AsyncSelect<EventOption>
                            loadOptions={loadEvents}
                            placeholder="Cari event..."
                            value={selectedEvent}
                            onChange={setSelectedEvent}
                            isSearchable
                            cacheOptions
                            defaultOptions
                        />
                    {errors.event_id && (
                        <p className="text-red-500 text-sm">{errors.event_id}</p>
                    )

                    }
                </div>
                <div className="flex gap-2 items-center">
                    <label htmlFor="best_of" className="input-label">Best Of</label>
                    <input value={best_of} type="number" id="best_of" className="mt-1 block w-50 input-field" 
                    onChange={(e) => setBestOf(Number(e.target.value))} />
                    {errors.best_of && (
                        <p className="text-red-500 text-sm">{errors.best_of}</p>
                    )

                    }
                </div>
                <div className="flex gap-2 items-center">
                    <label htmlFor="date" className="input-label">Date</label>
                    <input value={date} type="date" id="date" className="mt-1 block w-50 input-field" 
                    onChange={(e) => setDate(e.target.value)} />
                    {errors.date && (
                        <p className="text-red-500 text-sm">{errors.date}</p>
                    )

                    }
                </div>

                <div className="flex gap-2 items-center">
                    <label htmlFor="time" className="input-label">Time</label>
                    <input value={time} type="time" id="time" className="mt-1 block w-50 input-field" 
                    onChange={(e) => setTime(e.target.value)} />
                    {errors.time && (
                        <p className="text-red-500 text-sm">{errors.time}</p>
                    )

                    }
                </div>
                <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Add Match</button>
            </form>
        </div>
    )
}