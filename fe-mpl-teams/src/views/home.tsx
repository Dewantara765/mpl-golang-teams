import { useState, useEffect } from 'react'
import {api} from '../services/api'
export default function Home() {
    interface Team {
        id: number
        name: string
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
    <div>
      {teams.map((team) => (
        <div key={team.id}>
          <h2>{team.name}</h2>
          <img src={`http://localhost:8080/${team.logo}`} alt={team.name} />
        </div>
      ))}
    </div>
  )
}