import {useState, useEffect} from 'react'
import api from '../../services/axios.ts'
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
            short_name: string;
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
    
    const sortedTeams = teams.sort((a,b) => a.id - b.id);

    const matches = phase?.events.flatMap(
        (event: { matches }) => event.matches
    ) ?? [];

    const matchMap = new Map(
        matches.map((match: { 
            home_team_id: number; 
            away_team_id: number; 
            home_score: number;
            away_score: number; }) => [
            `${match.home_team_id}-${match.away_team_id}`,
            match,
        ])
    );

const getHeadToHead = (
    teamId: number,
    opponentId: number
) => {
    // Ambil kedua pertemuan, apa pun posisi home/away-nya.
    const allMatches = matches.filter(
        (match) =>
            (
                match.home_team_id === teamId &&
                match.away_team_id === opponentId
            ) ||
            (
                match.home_team_id === opponentId &&
                match.away_team_id === teamId
            )
    );

    // Hanya pertandingan yang sudah selesai.
    const completedMatches = allMatches.filter(
        (match) =>
            match.status === "completed" &&
            match.home_score != null &&
            match.away_score != null
    );

    let teamTotal = 0;
    let opponentTotal = 0;

    const details = completedMatches.map((match) => {
        const isHome = match.home_team_id === teamId;

        const teamScore = isHome
            ? match.home_score!
            : match.away_score!;

        const opponentScore = isHome
            ? match.away_score!
            : match.home_score!;

        teamTotal += teamScore;
        opponentTotal += opponentScore;

        return `${teamScore}-${opponentScore}`;
    });

    return {
        teamTotal,
        opponentTotal,
        played: completedMatches.length,
        total: allMatches.length,
        details,
    };
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
                                                className="w-8 h-8 lg:w-10 lg:h-10 object-contain"/>
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
                                    {sortedTeams.map((team) => (
                                        <th className="border border-gray-300 py-2 w-20" key={team.id}>
                                            {team.short_name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                            {sortedTeams.map((homeTeam) => (
                                <tr key={homeTeam.id}>
                                    <th className="border border-gray-300 w-15 py-2">
                                        {homeTeam.short_name}
                                    </th>

                                    {sortedTeams.map((awayTeam) =>  {
                                        const result = getHeadToHead(
                                            homeTeam.id,
                                            awayTeam.id
                                        );

                                        const bgColor =
                                            result.played === 0
                                                ? "bg-white"
                                                : result.teamTotal > result.opponentTotal
                                                ? "bg-green-200"
                                                : result.teamTotal < result.opponentTotal
                                                ? "bg-red-200"
                                                : "bg-yellow-200";

                                    

                                    
                                        return (
                                        <td className={`border border-gray-300 px-1 py-2 ${homeTeam.id === awayTeam.id ? "bg-gray-300": bgColor} text-center`} key={awayTeam.id}>
                                            {homeTeam.id === awayTeam.id ? (
                                                <div className="bg-slate-500 h-full" />
                                            ) : (
                                                <>
                                                    <div className="font-semibold">
                                                        {result.played > 0
                                                            ? `${result.teamTotal}-${result.opponentTotal}`
                                                            : "-"}
                                                    </div>

                                                    <div className="text-xs">
                                                        {result.details.join(", ")}
                                                        {result.played > 0 &&
                                                            result.played < result.total &&
                                                            ","}
                                                    </div>
                                                </>
                                            )}
                                        </td>
                                    )})}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {/* {matches} */}
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