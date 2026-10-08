import {useState, useEffect} from 'react'
import {api} from '../../services/api.ts'
import {Link, useParams} from 'react-router-dom'

export default function MatchIndex() {
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const { slug } = useParams<{ slug: string }>();

    const formatGameDiff = (gameDiff: number) => {
        return gameDiff > 0 ? `+${gameDiff}` : gameDiff;
    };

    interface Standing {
        phase: {
            id: number,
            name: string,
        }
        id : number,
        team : {
            id: number,
            name: string,
            logo: string,
        }
        match_played: number,
        match_win: number,
        match_lose: number,
        game_win: number,
        game_lose: number,
        game_diff: number
    }
    interface Tournament {
        id: number;
        name: string;
        start_date: string;
        end_date: string;
        phases: Phase[];
    }
    interface Phase {
        id: number;
        name: string;
        slug: string;
        standings: Standing[];
        team: Team;
    }


    interface Team {
        name: string,
        short_name: string,
        logo: string
    }
    

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const response = await api.get(`/tournaments/slug/${slug}`);
                setTournament(response.data.data);
            } catch (error) {
                console.error('Error fetching tournament:', error);
            }
        };
        
        fetchTournaments();
    }, []);

    return (
        <div className="p-4">
            <title>Tournament Details</title>
                <div className='header-title'>{tournament?.name}</div>
                {tournament?.phases.map((phase) => (
                    <div key={phase.id}>{phase.name}
                    <div><Link to={`${phase.slug}`} className='underline text-blue-500'>Lihat Match {phase.name}</Link></div>
                    {phase.name.toLowerCase() !== "playoff" && (
                    <table className="table-auto border-collapse border border-gray-500 mt-4 p-2">
                    <thead>
                        <tr>
                            <th className="border border-gray-500 px-4 py-2">No</th>
                            <th className="border border-gray-500 px-4 py-2">Team </th>
                            <th className="border border-gray-500 px-4 py-2">MP</th>
                            <th className="border border-gray-500 px-4 py-2">MW-ML</th>
                            <th className="border border-gray-500 px-4 py-2">GW-GL</th>
                            <th className="border border-gray-500 px-4 py-2">GD</th>
                        </tr>

                    </thead>
                    <tbody>
                        {phase.standings.map((standing, index: number) => {
                            const position = index + 1;

                            let rowClass = "";

                            if (position <= 2) {
                            rowClass = "bg-green-100 hover:bg-green-200";
                            } else if (position > phase.standings.length - 3) {
                            rowClass = "bg-red-100 hover:bg-red-200";
                            } else {
                            rowClass = "bg-white hover:bg-gray-50";
                            }

                        
                        return (
                            <tr key={standing.id} className={`${rowClass} font-normal`}>
                                <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                                <td className="border border-gray-300 px-4 py-2">
                                    <div className="flex gap-2">
                                        <img src={`http://localhost:8080/${standing.team.logo}`} alt={standing.team.name} 
                                            className="w-10 object-cover"/>
                                        <div>{standing.team.name}</div>
                                    </div>
                                    
                                    </td>
                                <td className="border border-gray-300 px-4 py-2">{standing.match_played}</td>
                                <td className="border border-gray-300 px-4 py-2">{standing.match_win}-{standing.match_lose}</td>
                                <td className="border border-gray-300 px-4 py-2">{standing.game_win}-{standing.game_lose}</td>
                                <td className="border border-gray-300 px-4 py-2">{formatGameDiff(standing.game_diff)}</td>

                            </tr>
                        )
                    
                    } )}

                    </tbody>
                    </table>
                )
                
                }
                    </div>
                )

                )}
            
                
                

        
        </div>
    )
}