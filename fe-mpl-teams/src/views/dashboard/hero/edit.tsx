import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { api } from "../../../services/api"
export default function HeroEdit(){
    const {id} = useParams()
    const [name, setName] = useState<string>("")
    const [logo, setLogo] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [errors, setErrors] = useState<{ name?: string }>({})
    const navigate = useNavigate()
    useEffect(() => {
        document.title = "Hero Edit"
        const fetchHero = async() => {
            try {
                const response = await api.get(`/heroes/${id}`)
                setName(response.data.data.name)
                setLogo(`http://localhost:8080/${response.data.data.logo}`)
                setPreview(`http://localhost:8080/${response.data.data.logo}`)
            }catch (error : any) {
                if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors)
                }
            }
        }
        fetchHero()
        },[id])


        const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            setLogo(file)
            setPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData()
        formData.append("name", name)
        if (logo) {
            formData.append("logo", logo)
        }

        try {
            await api.put(`/heroes/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            navigate("/dashboard/hero")
        } catch (error : any) {
                if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors)
            }
        }
    }
            
        
    

    return (
        <div className="p-4">
            <p className="text-xl font-bold">Hero Edit</p>
            <form onSubmit={handleSubmit}  className="mt-4 space-y-4">
                <div className="flex gap-2 items-center">
                    <label htmlFor="name" className="block input-label">Hero Name</label>
                    <input value={name} type="text" id="name" className="mt-1 block w-50 input-field" 
                    onChange={(e) => setName(e.target.value)} />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                <div className="flex gap-2 items-center">
                    <label htmlFor="logo" className="block input-label">Logo</label>
                    <input type="file" id="logo" className="mt-1 block w-50 input-field" accept="image/*"
                    onChange={handleLogoChange} />
                </div>
                {preview && (
                    <div className="flex">
                        <img src={preview} alt="Preview" className="max-h-32 max-w-32 object-contain" />
                    </div>
                )}
                <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Update Hero</button>
            </form>
        </div>
    )
}