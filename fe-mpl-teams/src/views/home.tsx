import { useState, useEffect } from 'react'
import {api} from '../services/api'
export default function Home() {
    interface Team {
        id: number
        name: string
        short_name: string
        logo: string
    }
    const [teams, setTeams] = useState<Team[]>([])

    useEffect(() => {
      document.title = 'Home - MPL Teams'
        const fetchTeams = async () => {
            try {
                const response = await api.get('/teams')
                setTeams(JSON.parse(JSON.stringify(response.data.data)))
            } catch (error) {
                console.error('Error fetching teams:', error)
            }
        }

        fetchTeams()
    }, [])

    return (
    <div className="flex text-blue-500 py-2">
      {teams.map((team) => (
        <div key={team.id} className="mx-4 my-4 flex flex-col items-center border border-gray-300 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
          <img src={`http://localhost:8080/${team.logo}`} alt={team.name} />
          <h2 className="text-lg font-bold justify-center">{team.short_name}</h2>
        </div>
      ))}
    </div>
  )
}