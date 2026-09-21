import { useEffect, useState } from "react"
import { api } from "../../services/api"
export default function HeroIndex(){
    const [heroes, setHeroes] = useState<Hero[]>([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(7);
    const sort = "desc";
    const [total_pages, setTotalPages] = useState(0);

    interface Hero {
        id: number,
        name: string,
        logo: string,
    }
    useEffect(() => {
        document.title = "Hero Index"
        const fetchHeroes = async() => {
            try {
                const response = await api.get(`/heroes?page=${page}&limit=${limit}`)
                setHeroes(response.data.data)
                setTotalPages(response.data.total_pages)
            }catch (error) {
                console.error("Error fetching heroes", error)
            }
        };
        fetchHeroes();
    },[page])
    return (
        <div className="p-4">
            <div className="flex gap-3">
                {heroes.map((hero) => (
                    <div key={hero.id} className="w-full md:w-1/8 mx-4 my-4 flex flex-col items-center border border-gray-300 rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                        <img src={`http://localhost:8080/${hero.logo}`} alt={hero.name} />
                        <h2 className="text-lg font-bold justify-center">{hero.name}</h2>
                    </div>
                )

                )}
            </div>
            <div className="flex gap-2 mt-4">
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    Previous
                </button>

                {Array.from(
                    { length: total_pages },
                    (_, index) => index + 1
                ).map((pageNumber) => (
                    <button
                        key={pageNumber}
                        onClick={() => setPage(pageNumber)}
                        className={
                            page === pageNumber
                                ? "font-bold"
                                : ""
                        }
                    >
                        {pageNumber}
                    </button>
                ))}

                <button
                    disabled={page === total_pages}
                    onClick={() => setPage(page + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    )
}