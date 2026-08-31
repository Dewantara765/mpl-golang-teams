import {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import {api} from '../../services/api.ts';
export default function TournamentIndex() { 
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    interface Tournament {
        id: number;
        name: string;
        start_date: string;
        end_date: string;
        slug: string;
    }
    useEffect(() => {
        document.title = 'Tournament Index';
        const fetchTournaments = async () => {
            try {
                const response = await api.get('/tournaments');
                setTournaments(response.data.data);
            } catch (error) {
                console.error('Error fetching tournaments:', error);
            }
        };
        fetchTournaments();
    }, []);

    return (
        <div className="p-4">
            <h1>Tournament Index Page</h1>
            {tournaments && tournaments.length > 0 ? (
                <table className="table-auto border-collapse border border-gray-300 mt-4 p-2">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 px-4 py-2">Name</th>
                            <th className="border border-gray-300 px-4 py-2">Start Date</th>
                            <th className="border border-gray-300 px-4 py-2">End Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tournaments.map((tournament) => (
                            <tr key={tournament.id} className="font-normal">
                                <td className="border border-gray-300 px-4 py-2">
                                    <Link className="text-blue-500 underline" to={`/tournament/${tournament.slug}`}>{tournament.name}</Link></td>
                                <td className="border border-gray-300 px-4 py-2">{tournament.start_date}</td>
                                <td className="border border-gray-300 px-4 py-2">{tournament.end_date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No tournaments available.</p>
            )}
        </div>
    );
}