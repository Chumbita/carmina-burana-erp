import { SupplyForm } from "./SupplyForm"
import { ConfirmNavigationModal } from "./ConfirmNavigationModal"

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

import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSupplies } from "../hooks/useSupplies"
import { useNotification } from "@/components/shared/notifications/useNotification"
import { useFormBlocker } from "../hooks/useFormBlocker";
import { useEntityDetail } from "@/components/shared/DetailPage/EntityDetailContext";

export function TabInput({ supply, onSupplyUpdated }) {
  const formRef = useRef(null)
  const navigate = useNavigate()
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const { blocker } = useFormBlocker(formRef)

  const { handleUpdated } = useEntityDetail();
  const { supplies: allSupplies, updateSupply, deleteSupply } = useSupplies()
  const notify = useNotification()

  async function onSubmit(data) {
    try {
      const updated = onSupplyUpdated
        ? await onSupplyUpdated(data)
        : await updateSupply(supply.id, data)

      notify.success(`Insumo actualizado correctamente`)

      formRef.current?.reset(updated || data, {
        keepDirty: false,
        keepDirtyValues: false,
      })

      if (handleUpdated) {
        handleUpdated();
      }

      return true
    } catch (error) {
      notify.error(`Error al actualizar el insumo ${error}`)
      return false
    }
  }

  function onDelete() {
    setOpenDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteSupply(supply.id)
      setOpenDeleteDialog(false)
      navigate("/inventario/insumos", {
        state: {
          notification: { type: 'success', message: `${supply.name} eliminado con éxito` }
        }
      })
    } catch (error) {
      notify.error(`Ha ocurrido un problema ${error}`)
    }
  }

  const formDefaults = {
    name:            supply?.name            ?? "",
    brand_id:        supply?.brand_id        ?? undefined,
    supply_category: supply?.supply_category ?? "",
    base_uom_id:     supply?.base_uom_id     ?? undefined,
    min_stock_level: supply?.min_stock_level ?? 0,
  }

  return (
    <>
      <SupplyForm
        formRef={formRef}
        defaultValues={formDefaults}
        onSubmit={onSubmit}
        submitLabel="Guardar cambios"
        showDeleteButton={true}
        onDelete={onDelete}
        layout="page"
        existingInputs={allSupplies}
        excludeId={supply.id}
      />

      {blocker.state === "blocked" && (
        <ConfirmNavigationModal
          onSave={async () => {
            await formRef.current?.submit()
            blocker.proceed()
            navigate("/inventario/insumos", {
              state: {
                notification: { type: 'success', message: `${supply.name} actualizado con éxito` }
              }
            })
          }}
          onDiscard={() => {
            formRef.current?.reset(formDefaults)
            blocker.proceed()
          }}
          onCancel={() => blocker.reset()}
        />
      )}

      <DeleteInsumoDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}

function DeleteInsumoDialog({ open, onOpenChange, onConfirm }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar insumo?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. El insumo será eliminado permanentemente. Para borrar el insumo, primero debes eliminar todos los lotes asociados.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel className="hover:bg-neutral-200 cursor-pointer">
            Cancelar
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 cursor-pointer"
          >
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
