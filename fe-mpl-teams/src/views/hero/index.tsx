import { useEffect, useState } from "react"
import { api } from "../../services/api"
import { getPaginationPages } from "../../../utils/pagination";
import { Link, useSearchParams } from "react-router-dom";
export default function HeroIndex(){
    const [heroes, setHeroes] = useState<Hero[]>([]);
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<string>("id");
    const [order, setOrder] = useState<string>("asc");
    const [total_pages, setTotalPages] = useState(0);
    const pages = getPaginationPages(page, total_pages);
    const [searchParams] = useSearchParams();
    

    interface Hero {
        id: number,
        name: string,
        logo: string,
    }
    useEffect(() => {
        document.title = "Hero Index"
        const fetchHeroes = async() => {
            const page = searchParams.get("page") || "1";
            const sort = searchParams.get("sort") || "id";
            const order = searchParams.get("order") || "asc"; 
            try {
                const response = await api.get("/heroes", {
                    params: {
                        page,
                        sort,
                        order,

                    }
                })
                setPage(Number(page))
                setSort(sort)
                setOrder(order)
                setHeroes(response.data.data)
                setTotalPages(response.data.total_pages)
            }catch (error) {
                console.error("Error fetching heroes", error)
            }
        };
        fetchHeroes();
    },[searchParams, page, sort, order])
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
            <div className="flex items-center gap-2 mt-6">

                    {/* Previous */}
                {page !== 1 ?
                    <Link to={`/heroes?page=${page - 1}&order=asc`}>
                        <button
                            className="px-3 py-2 border rounded"
                        >
                            Previous
                        </button>
                    </Link>
                : <button
                    className="px-3 py-2 border rounded opacity-50"
                    >
                        Previous
                    </button>}

                    {/* Page Numbers */}
                    {pages.map((item, index) => {

                        if (item === "...") {
                            return (
                                <span key={`dots-${index}`} className="px-2">
                                    ...
                                </span>
                            );
                        }

                        return (
                        <Link key={item} to={`/heroes?page=${item}&order=asc`}>
                            <button
                                className={`px-3 py-2 border rounded ${
                                    page === item
                                        ? "bg-blue-600 text-white"
                                        : "bg-white text-black"
                                }`}
                            >
                                {item}
                            </button>
                        </Link>
                        );
                    })}

                    {/* Next */}
                    {page !== total_pages ?
                    <Link to={`/heroes?page=${page + 1}&order=asc`}>
                    <button
                        className="px-3 py-2 border rounded"
                    >
                        Next
                    </button>
                    </Link>
                    : <button
                        className="px-3 py-2 border rounded opacity-50"
                    >
                        Next
                    </button>}

                </div>
        </div>
    )
}