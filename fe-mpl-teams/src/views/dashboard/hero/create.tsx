import { useEffect, useState } from "react"
import { api } from "../../../services/api"
import { useNavigate } from "react-router-dom";
export default function HeroCreate(){
    const [name, setName] = useState<string>("");
    const [logo, setLogo] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [errors, setErrors] = useState<{ name?: string }>({})
    const navigate = useNavigate()
    useEffect(() => {
        document.title = "Create Hero"
    })

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
        if (logo) {
            formData.append("logo", logo)
        }

        try {
            await api.post("/heroes", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            
            
            navigate("/dashboard/hero")
        } catch (error: any) {
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors)
            }
        }
    }
    return (
        <div className="p-4">
            <p className="text-xl font-bold">Create Hero</p>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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
                <button type="submit" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">Add Hero</button>
            </form>

        </div>
    )
}