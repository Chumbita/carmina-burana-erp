//componentes
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

//hooks
import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSupplies } from "../hooks/useSupplies"
import { useBrands } from "../hooks/useBrands"
import { useUoms } from "../hooks/useUoms"
import { useNotification } from "@/components/shared/notifications/useNotification"
import { useFormBlocker } from "../hooks/useFormBlocker"
import { useEntityDetail } from "@/components/shared/DetailPage/EntityDetailContext"

export function TabInput({ insumo }) {
  const formRef = useRef(null)
  const navigate = useNavigate()
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const { blocker } = useFormBlocker(formRef)
  const { handleUpdated } = useEntityDetail()

  const { updateSupply, deleteSupply, loading, supplies } = useSupplies()
  const { brands, loading: brandsLoading } = useBrands()
  const { uoms, loading: uomsLoading } = useUoms()

  const notify = useNotification()

  // Resolver IDs a partir de los strings que devuelve el GET detallado
  const resolvedBrandId = brands.find((b) => b.name === insumo?.brand)?.id
  const resolvedUomId = uoms.find((u) => u.symbol === insumo?.base_uom_symbol)?.id

  // No montar el form hasta tener todos los datos (evita que useForm capture IDs undefined)
  const isReady = insumo && !brandsLoading && !uomsLoading && resolvedBrandId && resolvedUomId

  const defaultValues = isReady
    ? {
        name: insumo.name,
        brand_id: resolvedBrandId,
        supply_category: insumo.supply_category,
        base_uom_id: resolvedUomId,
        min_stock_level: Number(insumo.min_stock_level),
      }
    : null

  // Editar insumo
  async function onSubmit(data) {
    try {
      await updateSupply(insumo.id, data)
      notify.success("Insumo actualizado correctamente")

      if (formRef.current?.reset) {
        formRef.current.reset(
          {
            name: data.name,
            brand_id: data.brand_id,
            supply_category: data.supply_category,
            base_uom_id: data.base_uom_id,
            min_stock_level: data.min_stock_level,
          },
          { keepDirty: false, keepDirtyValues: false }
        )
      }

      if (handleUpdated) handleUpdated()

      return true
    } catch (error) {
      console.error(error)
      notify.error(`Error al actualizar el insumo: ${error}`)
      return false
    }
  }

  // Borrar insumo
  function onDelete() {
    setOpenDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteSupply(insumo.id)
      setOpenDeleteDialog(false)
      navigate("/inventario/insumos", {
        state: {
          notification: { type: "success", message: `${insumo.name} eliminado con éxito` },
        },
      })
    } catch (error) {
      notify.error(`Ha ocurrido un problema: ${error}`)
    }
  }

  if (!isReady) return null

  return (
    <>
      <SupplyForm
        formRef={formRef}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitLabel="Guardar cambios"
        showDeleteButton={true}
        onDelete={onDelete}
        layout="page"
        existingInputs={supplies}
        excludeId={insumo.id}
      />

      {/* Confirmación de navegación con cambios sin guardar */}
      {blocker.state === "blocked" && (
        <ConfirmNavigationModal
          onSave={async () => {
            await formRef.current?.submit()
            blocker.proceed()
            navigate("/inventario/insumos", {
              state: {
                notification: { type: "success", message: `${insumo.name} actualizado con éxito` },
              },
            })
          }}
          onDiscard={() => {
            formRef.current?.reset({
              name: insumo.name,
              brand_id: resolvedBrandId,
              supply_category: insumo.supply_category,
              base_uom_id: resolvedUomId,
              min_stock_level: Number(insumo.min_stock_level),
            })
            blocker.proceed()
          }}
          onCancel={() => blocker.reset()}
        />
      )}

      {/* Diálogo de confirmación de borrado */}
      <DeleteSupplyDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        onConfirm={handleConfirmDelete}
        isDeleting={loading}
      />
    </>
  )
}

function DeleteSupplyDialog({ open, onOpenChange, onConfirm, isDeleting }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar insumo?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. El insumo será eliminado permanentemente. Para borrar
            el insumo, primero debes eliminar todos los lotes asociados.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting} className="hover:bg-neutral-200 cursor-pointer">
            Cancelar
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 cursor-pointer"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
