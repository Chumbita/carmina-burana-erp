import { useRef, useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { useNotification } from "@/components/shared/notifications/useNotification"
import { PackagingSupplyForm } from "./PackagingSupplyForm"

export function PackagingSupplyDetailTabs({ packagingSupply, onPackagingSupplyUpdated, availableInputs = [] }) {
  const [contentOption, setContentOption] = useState("detalle")
  const formRef = useRef(null)
  const notify = useNotification()

  async function handleSubmit(data) {
    try {
      await onPackagingSupplyUpdated(data)
      notify.success("Packaging actualizado correctamente")

      formRef.current?.reset(data, {
        keepDirty: false,
        keepDirtyValues: false,
      })

      return true
    } catch (error) {
      notify.error(`Error al actualizar el packaging ${error?.message ?? ""}`)
      return false
    }
  }

  return (
    <div>
      <Tabs defaultValue="detalle" onValueChange={setContentOption}>
        <TabsList variant="line">
          <TabsTrigger value="detalle" className="cursor-pointer">Detalle</TabsTrigger>
          <TabsTrigger value="lotes" className="cursor-pointer">Lotes</TabsTrigger>
        </TabsList>

        {contentOption === "detalle" && (
          <PackagingSupplyForm
            formRef={formRef}
            defaultValues={packagingSupply}
            onSubmit={handleSubmit}
            submitLabel="Guardar cambios"
            layout="page"
            existingInputs={availableInputs}
            excludeId={packagingSupply?.id}
          />
        )}

        {contentOption === "lotes" && <p className="mt-4">Contenido de Lotes</p>}
      </Tabs>
    </div>
  )
}
