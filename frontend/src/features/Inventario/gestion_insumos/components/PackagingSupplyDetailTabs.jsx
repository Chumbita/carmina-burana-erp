import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { useNotification } from "@/components/shared/notifications/useNotification"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/AlertDialog"
import { useFormBlocker } from "../hooks/useFormBlocker"
import { ConfirmNavigationModal } from "./ConfirmNavigationModal"
import { PackagingSupplyForm } from "./PackagingSupplyForm"

export function PackagingSupplyDetailTabs({ packagingSupply, onPackagingSupplyUpdated, onDeleteSupply, availableInputs = [] }) {
  const [contentOption, setContentOption] = useState("detalle")
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const formRef = useRef(null)
  const notify = useNotification()
  const navigate = useNavigate()
  const { blocker } = useFormBlocker(formRef)

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

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await onDeleteSupply()
      setOpenDeleteDialog(false)
      navigate("/inventario/insumos", {
        state: {
          notification: { type: "success", message: `"${packagingSupply?.name}" eliminado con éxito` },
        },
      })
    } catch (error) {
      notify.error(`Error al eliminar: ${error?.message ?? ""}`)
    } finally {
      setIsDeleting(false)
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
          <div className="space-y-4">
            <PackagingSupplyForm
              formRef={formRef}
              defaultValues={packagingSupply}
              onSubmit={handleSubmit}
              submitLabel="Guardar cambios"
              layout="page"
              showDeleteButton
              onDelete={() => setOpenDeleteDialog(true)}
              existingInputs={availableInputs}
              excludeId={packagingSupply?.id}
            />
          </div>
        )}

        {contentOption === "lotes" && <p className="mt-4">Contenido de Lotes</p>}
      </Tabs>

      {blocker.state === "blocked" && (
        <ConfirmNavigationModal
          onSave={async () => {
            await formRef.current?.submit()
            blocker.proceed()
            navigate("/inventario/insumos")
          }}
          onDiscard={() => {
            formRef.current?.reset(packagingSupply)
            blocker.proceed()
          }}
          onCancel={() => blocker.reset()}
        />
      )}

      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar envase?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El envase será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="hover:bg-neutral-200 cursor-pointer">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 cursor-pointer"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
