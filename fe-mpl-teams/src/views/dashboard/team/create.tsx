import { useEffect, useState }from "react"
import { api } from "../../../services/api"
import { useNavigate } from "react-router-dom"


export default function TeamCreate() {
    const [name, setName] = useState<string>("")
    const [shortName, setShortName] = useState<string>("")
    const [logo, setLogo] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)

    const navigate = useNavigate()
    useEffect(() => {
        document.title = "Create Team"
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
        formData.append("short_name", shortName)
        if (logo) {
            formData.append("logo", logo)
        }

        try {
            await api.post("/teams", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            
            alert("Team created successfully!")
            
            navigate("/dashboard/team")
        } catch (error) {
            console.error("Error creating team:", error)
            alert(error.response?.data?.message ??
        "Failed to create team."
    )
        }
    }
    return (
        <div className="p-4">
            <p className="text-xl font-bold">Create Team</p>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div className="flex gap-2 items-center">
                    <label htmlFor="name" className="block w-40 text-md font-medium text-gray-700">Team Name</label>
                    <input value={name} type="text" id="name" className="mt-1 block w-50 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                    onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="flex gap-2 items-center">
                    <label htmlFor="shortName" className="block w-40 text-md font-medium text-gray-700">Short Name</label>
                    <input value={shortName} type="text" id="shortName" className="mt-1 block w-50 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
                    onChange={(e) => setShortName(e.target.value)} />
                </div>
                <div className="flex gap-2 items-center">
                    <label htmlFor="logo" className="block w-40 text-md font-medium text-gray-700">Logo</label>
                    <input type="file" id="logo" className="mt-1 block w-50 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" 
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

