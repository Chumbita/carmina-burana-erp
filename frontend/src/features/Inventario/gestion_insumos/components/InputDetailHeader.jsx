// InputDetailHeader.jsx
import { Button } from "@/components/ui/Button"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

export function InputDetailHeader({ name }) {
  const navigate = useNavigate()
  return (
    <header className="lg:col-span-2 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
      </div>
    </header>
  )
}