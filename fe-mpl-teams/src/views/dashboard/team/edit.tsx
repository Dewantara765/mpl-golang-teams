import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { api } from "../../../services/api"

export default function TeamEdit() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [team, setTeam] = useState<[] | null>(null)
    const [name, setName] = useState<string>("")
    const [short_name, setShortName] = useState<string>("")
    const [logo, setLogo] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [errors, setErrors] = useState<{ name?: string; short_name?: string }>({})

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            setLogo(file)
            setPreview(URL.createObjectURL(file))
        }
    }
    useEffect(() => {
        document.title = "Edit Team"
        const fetchTeam = async () => {
            try {
                const response = await api.get(`/teams/${id}`)
                setTeam(response.data.data)
                setName(response.data.data.name)
                setShortName(response.data.data.short_name)
                setLogo(`http://localhost:8080/${response.data.data.logo}`)
                setPreview(`http://localhost:8080/${response.data.data.logo}`)
            } catch (error : any) {
                if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors)
            }
            }
        }
        fetchTeam()
    }, [id])

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData()
        formData.append("name", name)
        formData.append("short_name", short_name)
        if (logo) {
            formData.append("logo", logo)
        }

        try {
            await api.put(`/teams/${id}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            navigate("/dashboard/team")
        } catch (error : any) {
                if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors)
            }
        }
    }

    return (
        <div className="p-4">
            <p className="text-lg font-bold">Edit Team</p>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="flex gap-2 items-center">
                    <label htmlFor="name" className="block input-label">Team Name</label>
                    <input value={name} type="text" id="name" className="mt-1 block w-50 input-field" 
                    onChange={(e) => setName(e.target.value)} />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>
                <div className="flex gap-2 items-center">
                    <label htmlFor="shortName" className="block input-label">Short Name</label>
                    <input value={short_name} type="text" id="shortName" className="mt-1 block w-50 input-field" 
                    onChange={(e) => setShortName(e.target.value)} />
                    {errors.short_name && <p className="text-red-500 text-sm">{errors.short_name}</p>}
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
                <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Update Team</button>
            </form>
        </div>
    )
}
