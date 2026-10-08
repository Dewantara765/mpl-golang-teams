import {useState, useEffect} from 'react'
import {api} from '../../services/api.ts'
import {Link, useParams} from 'react-router-dom'

export default function MatchIndex() {
    const [tournament, setTournament] = useState<Tournament | null>(null);
    const { slug } = useParams<{ slug: string }>();
    const [loading, setLoading] = useState<boolean>(false);

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
                setLoading(true)
                const response = await api.get(`/tournaments/slug/${slug}`);
                setTournament(response.data.data);
            } catch (error) {
                console.error('Error fetching tournament:', error);
            } finally {
                setLoading(false)
            }
        };
        
        fetchTournaments();
    }, []);

    const phase = tournament?.phases.find(
        (phase) => phase.slug === "regular-season"
    );

    const teams = phase?.standings.map(
        (standing) => standing.team
    ) ?? [];

    const matches = phase?.events.flatMap(
        (event) => event.matches
    ) ?? [];

    const matchMap = new Map(
        matches.map((match) => [
            `${match.home_team_id}-${match.away_team_id}`,
            match,
        ])
    );

const getMatch = (
        homeTeamId: number,
        awayTeamId: number
    ) => {
        return matchMap.get(
            `${homeTeamId}-${awayTeamId}`
        );
    };



    return (
        <div className="p-4">
            <title>Tournament Details</title>
            {loading ? 
            <div>Loading... </div>
                : <>
                <div className='header-title'>{tournament?.name}</div>
                {tournament?.phases.map((phase) => (
                    <div key={phase.id}>{phase.name}
                    <div><Link to={`${phase.slug}`} className='underline text-blue-500'>Lihat Match {phase.name}</Link></div>
                    {phase.name.toLowerCase() !== "playoff" && (
                    <div className='grid lg:grid-cols-1 xl:grid-cols-[1fr_2fr] gap-4'>
                        <table className="table-auto border-collapse border border-gray-500 mt-4 p-2">
                        <thead>
                            <tr>
                                <th className="border border-gray-500 px-1 py-2">No</th>
                                <th className="border border-gray-500 px-1 py-2">Team </th>
                                <th className="border border-gray-500 px-1 py-2">Match</th>
                                <th className="border border-gray-500 px-1 py-2">Game</th>
                                <th className="border border-gray-500 px-1 py-2">Diff</th>
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
                                    <td className="border border-gray-300 px-1 py-2">{index + 1}</td>
                                    <td className="border border-gray-300 px-1 py-2">
                                        <div className="flex gap-2">
                                            <img src={`http://localhost:8080/${standing.team.logo}`} alt={standing.team.name} 
                                                className="w-8 lg:w-10 object-cover"/>
                                            <div>{standing.team.name}</div>
                                        </div>
                                        
                                        </td>
                                    <td className="border border-gray-300 px-1 py-2">{standing.match_win}-{standing.match_lose}</td>
                                    <td className="border border-gray-300 px-1 py-2">{standing.game_win}-{standing.game_lose}</td>
                                    <td className="border border-gray-300 px-1 py-2">{formatGameDiff(standing.game_diff)}</td>

                                </tr>
                            )
                        
                        } )}

                        </tbody>
                        </table>
                        <div>
                        <div className='sub-header-title'>Tabel Head-to-head</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>H/A</th>
                                    {teams.map((team) => (
                                        <th className="border border-gray-300 px-1 py-2" key={team.id}>
                                            {team.short_name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                            {teams.map((homeTeam) => (
                                <tr key={homeTeam.id}>
                                    <th className="border border-gray-300 px-1 py-2">
                                        {homeTeam.short_name}
                                    </th>

                                    {teams.map((awayTeam) =>  {
                                        const isSameTeam = homeTeam.id === awayTeam.id;

                                        if (isSameTeam) {
                                        return (
                                            <td
                                                key={awayTeam.id}
                                                className="bg-slate-500"
                                            />
                                        );
                                    }

                                    const match = getMatch(
                                        homeTeam.id,
                                        awayTeam.id
                                    );

                                    let bgColor = "";

                                    if (match) {
                                        if (
                                            match.home_score >
                                            match.away_score
                                        ) {
                                            bgColor = "bg-green-200";
                                        } else if (
                                            match.home_score <
                                            match.away_score
                                        ) {
                                            bgColor = "bg-red-200";
                                        } else {
                                            bgColor = "bg-gray-200";
                                        }
                                    }
                                        return (
                                        <td className={`border border-gray-300 px-1 py-2 ${bgColor}`} key={awayTeam.id}>
                                            {match
                                                ? `${match.home_score}-${match.away_score}`
                                                : "-"}
                                        </td>
                                    )})}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                        </div>
                    </div>
                )
                
                }
                    </div>
                )

                )}
                </>
                }
            
                
                
                
        
        </div>
    )
}