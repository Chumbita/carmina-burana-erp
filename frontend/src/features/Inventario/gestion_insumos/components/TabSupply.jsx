import { SupplyForm } from "./SupplyForm"
import { ConfirmNavigationModal } from "./ConfirmNavigationModal"
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog"
import { useTabSupply } from "../hooks/useTabSupply"

/**
 * Contenedor de la pestaña "Detalle" de un insumo de producción.
 */
export function TabSupply({ insumo }) {
  const {
    formRef,
    isReady,
    defaultValues,
    supplies,
    blocker,
    openDeleteDialog,
    setOpenDeleteDialog,
    isDeleting,
    onSubmit,
    requestDelete,
    confirmDelete,
    saveAndLeave,
    discardChanges,
    cancelNavigation,
  } = useTabSupply(insumo)

  if (!isReady) return null

  return (
    <>
      <SupplyForm
        formRef={formRef}
        defaultValues={defaultValues}
        onSubmit={onSubmit}
        submitLabel="Guardar cambios"
        showDeleteButton
        onDelete={requestDelete}
        layout="page"
        existingSupplies={supplies}
        excludeId={insumo.id}
      />

      {/* Confirmación de navegación con cambios sin guardar */}
      {blocker.state === "blocked" && (
        <ConfirmNavigationModal
          onSave={saveAndLeave}
          onDiscard={discardChanges}
          onCancel={cancelNavigation}
        />
      )}

      <ConfirmDeleteDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="¿Eliminar insumo?"
        description="Esta acción no se puede deshacer. El insumo será eliminado permanentemente. Para borrar el insumo, primero debes eliminar todos los lotes asociados."
      />
    </>
  )
}
