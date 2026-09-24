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
                            <th className="border border-gray-300 px-4 py-2">MW</th>
                            <th className="border border-gray-300 px-4 py-2">ML</th>
                            <th className="border border-gray-300 px-4 py-2">GW</th>
                            <th className="border border-gray-300 px-4 py-2">GL</th>
                            <th className="border border-gray-300 px-4 py-2">GD</th>
                        </tr>

                    </thead>
                    <tbody>
                        {standings.map((standing) => (
                            <tr key={standing.id}>
                                <td className="border border-gray-300 px-4 py-2">{standing.id}</td>
                                <td className="border border-gray-300 px-4 py-2">{standing.team.name}</td>
                                <td className="border border-gray-300 px-4 py-2">{standing.match_played}</td>
                                <td className="border border-gray-300 px-4 py-2">{standing.match_win}</td>
                                <td className="border border-gray-300 px-4 py-2">{standing.match_lose}</td>
                                <td className="border border-gray-300 px-4 py-2">{standing.game_win}</td>
                                <td className="border border-gray-300 px-4 py-2">{standing.game_lose}</td>
                                <td className="border border-gray-300 px-4 py-2">{formatGameDiff(standing.game_diff)}</td>

                            </tr>
                        )
                    
                    )}

                    </tbody>
            </table>
        </div>
    )
}