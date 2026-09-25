import { api } from "../../../services/api"
import { useEffect, useState } from "react"
export default function DashboardStandingIndex(){
    const [standings, setStandings] = useState<Standing[]>([])

    const formatGameDiff = (game_diff: number) => {
        let formattedGameDiff;
        if (game_diff >= 1) {
            formattedGameDiff = `+${game_diff}`
        }else {
            formattedGameDiff = game_diff
        }
        return formattedGameDiff;
    }

    interface Standing {
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
    useEffect(() => {
        const fetchStandings = async() => {
            try {
                const response = await api.get("/standings")
                setStandings(response.data.data)
            }catch (error) {
                console.error("error fetching standings", error)
            }
        }
        fetchStandings()
    },[])
    return (
        <div className="p-4">
            <title>Standings</title>
            <p className="font-bold text-2xl">Standings</p>
            <table className="table-auto border-collapse border border-gray-300 mt-4 p-2">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 px-4 py-2">No</th>
                            <th className="border border-gray-300 px-4 py-2">Team </th>
                            <th className="border border-gray-300 px-4 py-2">MP</th>
                            <th className="border border-gray-300 px-4 py-2">MW-ML</th>
                            <th className="border border-gray-300 px-4 py-2">GW-GL</th>
                            <th className="border border-gray-300 px-4 py-2">GD</th>
                        </tr>

                    </thead>
                    <tbody>
                        {standings.map((standing, index: number) => {
                            const position = index + 1;

                            let rowClass = "";

                            if (position <= 2) {
                            rowClass = "bg-green-100 hover:bg-green-200";
                            } else if (position > standings.length - 3) {
                            rowClass = "bg-red-100 hover:bg-red-200";
                            } else {
                            rowClass = "bg-white hover:bg-gray-50";
                            }

                        
                        return (
                            <tr key={standing.id} className={rowClass}>
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
        </div>
    )
}