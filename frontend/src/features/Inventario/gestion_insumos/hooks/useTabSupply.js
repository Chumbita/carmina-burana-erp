import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useNotification } from "@/components/shared/notifications/useNotification"
import { useEntityDetail } from "@/components/shared/DetailPage/EntityDetailContext"
import { useSupplies } from "./useSupplies"
import { useBrands } from "./useBrands"
import { useUoms } from "./useUoms"
import { useFormBlocker } from "./useFormBlocker"
import { toSupplyFormValues } from "../dto/supply.dto"

const SUPPLIES_ROUTE = "/inventario/insumos"

/**
 * Lógica de la pestaña "Detalle" de un insumo: edición, borrado y
 * bloqueo de navegación con cambios sin guardar.
 */
export function useTabSupply(insumo) {
  const formRef = useRef(null)
  const navigate = useNavigate()
  const notify = useNotification()
  const { handleUpdated } = useEntityDetail()
  const { blocker } = useFormBlocker(formRef)

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const { updateSupply, deleteSupply, loading, supplies } = useSupplies()
  const { loading: brandsLoading } = useBrands()
  const { loading: uomsLoading } = useUoms()

  // No montar el form hasta tener todos los datos (evita que useForm capture IDs undefined)
  const isReady = Boolean(
    insumo && !brandsLoading && !uomsLoading && insumo.brand_id && insumo.base_uom_id
  )

  const defaultValues = isReady ? toSupplyFormValues(insumo) : null

  async function onSubmit(data) {
    try {
      await updateSupply(insumo.id, data)
      notify.success("Insumo actualizado correctamente")

      if (formRef.current?.reset) {
        formRef.current.reset(toSupplyFormValues({ ...insumo, ...data }), {
          keepDirty: false,
          keepDirtyValues: false,
        })
      }

      if (handleUpdated) handleUpdated()

      return true
    } catch (error) {
      console.error(error)
      notify.error(`Error al actualizar el insumo: ${error}`)
      return false
    }
  }

  function requestDelete() {
    setOpenDeleteDialog(true)
  }

  async function confirmDelete() {
    try {
      await deleteSupply(insumo.id)
      setOpenDeleteDialog(false)
      navigate(SUPPLIES_ROUTE, {
        state: {
          notification: { type: "success", message: `${insumo.name} eliminado con éxito` },
        },
      })
    } catch (error) {
      notify.error(`Ha ocurrido un problema: ${error}`)
    }
  }

  async function saveAndLeave() {
    await formRef.current?.submit()
    blocker.proceed()
    navigate(SUPPLIES_ROUTE, {
      state: {
        notification: { type: "success", message: `${insumo.name} actualizado con éxito` },
      },
    })
  }

  function discardChanges() {
    formRef.current?.reset(toSupplyFormValues(insumo))
    blocker.proceed()
  }

  function cancelNavigation() {
    blocker.reset()
  }

  return {
    formRef,
    isReady,
    defaultValues,
    supplies,
    blocker,
    openDeleteDialog,
    setOpenDeleteDialog,
    isDeleting: loading,
    onSubmit,
    requestDelete,
    confirmDelete,
    saveAndLeave,
    discardChanges,
    cancelNavigation,
  }
}
