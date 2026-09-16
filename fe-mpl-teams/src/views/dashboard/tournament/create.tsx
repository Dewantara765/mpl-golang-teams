import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../../../services/api"

export default function TournamentCreate() {
    const [name, setName]= useState<string>("")
    const [slug, setSlug]= useState<string>("")
    const [start_date, setStartDate]= useState<string>("")
    const [end_date, setEndDate]= useState<string>("")
    const [errors, setErrors] = useState<{name?: string, slug?: string, start_date?: string, end_date?: string}>({})
    const navigate = useNavigate()
    useEffect(() => {
        document.title = "Create Tournament"
    },[])
    
    const handleSubmit = async(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const data = {name, slug, start_date, end_date}
        try {
            await api.post("/tournaments", data, 
                {headers: {"Content-Type" : "application/json"},}

            );
            navigate("/dashboard/tournament")
        } catch (error : any) {
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors)
            }
        }
    }

    return (
        <div className="p-4">
            <p className="text-xl font-semibold">Add tournament page.</p>
            <form onSubmit={handleSubmit}   className="mt-4 space-y-4">
                <div className="flex gap-2 items-center">
                    <label htmlFor="name" className="block w-40 input-label">Name</label>
                    <input value={name} type="text" id="name" className="mt-1 block w-50 input-field" 
                    onChange={(e) => setName(e.target.value)} />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                <div className="flex gap-2 items-center">
                    <label htmlFor="slug" className="block w-40 input-label">Slug</label>
                    <input value={slug} type="text" id="slug" className="mt-1 block w-50 input-field" 
                    onChange={(e) => setSlug(e.target.value)} />
                    {errors.slug && <p className="text-red-500 text-sm">{errors.slug}</p>}
                </div>
                
                <div className="flex gap-2 items-center">
                    <label htmlFor="startDate" className="block w-40 input-label">Start Date</label>
                    <input value={start_date} type="date" id="startDate" className="mt-1 block w-50 input-field" 
                    onChange={(e) => setStartDate(e.target.value)} />
                    {errors.start_date && <p className="text-red-500 text-sm">{errors.start_date}</p>}
                </div>
                
                <div className="flex gap-2 items-center">
                    <label htmlFor="endDate" className="block w-40 input-label">End Date</label>
                    <input value={end_date} type="date" id="endDate" className="mt-1 block w-50 input-field" 
                    onChange={(e) => setEndDate(e.target.value)} />
                    {errors.end_date && <p className="text-red-500 text-sm">{errors.end_date}</p>}
                </div>
                
                
                <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Add Tournament</button>
            </form>
        </div>
    )
}