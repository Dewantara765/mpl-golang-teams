import { useEffect } from "react"
export default function NotFound() {
    useEffect(() => {
        document.title = "Not Found"
    })
    return (
        <div className="p-4">
            <span className="text-4xl font-bold">404 |</span> Not Found
        </div>
    )
}