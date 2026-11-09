import { useEffect, useState }from "react"
import api from "../../../services/axios"
import { useNavigate } from "react-router-dom"



export default function TeamCreate() {
    const [name, setName] = useState<string>("")
    const [short_name, setShortName] = useState<string>("")
    const [logo, setLogo] = useState<File | null>(null)
    const [region_id, setRegionId] = useState<number>(0);
    const [regions, setRegions] = useState<Region[]>([]);
    const [preview, setPreview] = useState<string | null>(null)
    const [errors, setErrors] = useState<{ name?: string; short_name?: string }>({})

    interface Region {
        id: number,
        name: string,
        code: string,
        logo: string,
    }

    const navigate = useNavigate()
    useEffect(() => {
        document.title = "Create Team"
        const fetchRegions = async () => {
            try {
                const response = await api.get("/regions")
                setRegions(response.data.data)
            } catch (error : any) {
                console.error("Error fetching regions:", error)
            }
        }
        fetchRegions()
    }, [])

    

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] 
        if (file) {
            setLogo(file)
            setPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData()
        formData.append("name", name)
        formData.append("short_name", short_name)
        formData.append("region_id", region_id?.toString() || "")
        if (logo) {
            formData.append("logo", logo)
        }

        try {
            await api.post("/api/admin/teams", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    
                },
            })
            
            
            navigate("/dashboard/team")
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors)
            }
        }
    }
    return (
        <div className="p-4">
            <p className="text-xl font-bold">Create Team</p>
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
                    <label htmlFor="region" className="block w-40 text-md font-medium text-gray-700">Region</label>
                    <select name="region" id="region" value={region_id} className="w-80 border border-gray-500 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => setRegionId(Number(e.target.value))}>
                        <option value="">Pilih Region..</option>
                    {regions.map((region) => (
                        <option key={region.id} value={region.id}>{region.name}</option>
                    ))}
                    
                    </select>
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
                <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Add Team</button>
            </form>
        </div>
    )
}

