import { useState } from 'react'
import { BomsTable } from "../components/BomsTable"
import { NewBomModal } from "../components/NewBomModal"
import { bomService } from "../services/bomService"

// Componentes shadcn
import { Button } from "@/components/ui/Button"

// Iconos
import { Plus } from "lucide-react"

export default function BomsPage() {
  const [openModal, setOpenModal] = useState(false)
  const [boms, setBoms] = useState([])

  async function handleCreateBom(data) {
    const newBom = await bomService.create(data)
    setBoms(prev => [...prev, newBom])
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <Button
          size="sm"
          className="cursor-pointer"
          onClick={() => setOpenModal(true)}
        >
          <Plus />
          Nueva Fórmula
        </Button>
      </header>
      <div>
        <BomsTable boms={boms} />
      </div>

      <NewBomModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleCreateBom}
      />
    </div>
  )
}
