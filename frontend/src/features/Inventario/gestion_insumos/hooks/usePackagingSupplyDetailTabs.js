import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useNotification } from "@/components/shared/notifications/useNotification"
import { useEntityDetail } from "@/components/shared/DetailPage/EntityDetailContext"
import { useSupplies } from "./useSupplies"
import { useFormBlocker } from "./useFormBlocker"

const SUPPLIES_ROUTE = "/inventario/insumos"

export const PACKAGING_DETAIL_TABS = {
  DETAIL: "detalle",
  LOTS: "lotes",
}

/**
 * Lógica de la pestaña "Detalle" de un envase: actualización, borrado y
 * bloqueo de navegación con cambios sin guardar.
 */
export function usePackagingSupplyDetailTabs({ packagingSupply, onUpdate, onDelete }) {
  const [activeTab, setActiveTab] = useState(PACKAGING_DETAIL_TABS.DETAIL)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const formRef = useRef(null)
  const notify = useNotification()
  const navigate = useNavigate()
  const { blocker } = useFormBlocker(formRef)
  const { getSupplies } = useSupplies()
  const { handleUpdated } = useEntityDetail()

  async function submitDetail(data) {
    try {
      await onUpdate(data)
      await getSupplies()
      handleUpdated?.()
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

  function requestDelete() {
    setOpenDeleteDialog(true)
  }

  async function confirmDelete() {
    setIsDeleting(true)
    try {
      await onDelete()
      setOpenDeleteDialog(false)
      navigate(SUPPLIES_ROUTE, {
        state: {
          notification: {
            type: "success",
            message: `"${packagingSupply?.name}" eliminado con éxito`,
          },
        },
      })
    } catch (error) {
      notify.error(`Error al eliminar: ${error?.message ?? ""}`)
    } finally {
      setIsDeleting(false)
    }
  }

  async function saveAndLeave() {
    await formRef.current?.submit()
    blocker.proceed()
    navigate(SUPPLIES_ROUTE)
  }

  function discardChanges() {
    formRef.current?.reset(packagingSupply)
    blocker.proceed()
  }

  function cancelNavigation() {
    blocker.reset()
  }

  return {
    activeTab,
    setActiveTab,
    formRef,
    blocker,
    openDeleteDialog,
    setOpenDeleteDialog,
    isDeleting,
    submitDetail,
    confirmDelete,
    requestDelete,
    saveAndLeave,
    discardChanges,
    cancelNavigation,
  }
}
