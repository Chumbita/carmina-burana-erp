import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs"

import { ConfirmNavigationModal } from "./ConfirmNavigationModal"
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog"
import { PackagingSupplyForm } from "./PackagingSupplyForm"
import { TabLots } from "./TabLots"
import {
  usePackagingSupplyDetailTabs,
  PACKAGING_DETAIL_TABS,
} from "../hooks/usePackagingSupplyDetailTabs"

/**
 * Pestañas del panel de detalle de un envase.
 */
export function PackagingSupplyDetailTabs({
  packagingSupply,
  onPackagingSupplyUpdated,
  onDeleteSupply,
  availableSupplies = [],
  onStockAdjusted,
}) {
  const {
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
  } = usePackagingSupplyDetailTabs({
    packagingSupply,
    onUpdate: onPackagingSupplyUpdated,
    onDelete: onDeleteSupply,
  })

  return (
    <div>
      <Tabs defaultValue={PACKAGING_DETAIL_TABS.DETAIL} onValueChange={setActiveTab}>
        <TabsList variant="line">
          <TabsTrigger value={PACKAGING_DETAIL_TABS.DETAIL} className="cursor-pointer">
            Detalle
          </TabsTrigger>
          <TabsTrigger value={PACKAGING_DETAIL_TABS.LOTS} className="cursor-pointer">
            Lotes
          </TabsTrigger>
        </TabsList>

        {activeTab === PACKAGING_DETAIL_TABS.DETAIL && (
          <div className="space-y-4">
            <PackagingSupplyForm
              formRef={formRef}
              defaultValues={packagingSupply}
              onSubmit={submitDetail}
              submitLabel="Guardar cambios"
              layout="page"
              showDeleteButton
              onDelete={requestDelete}
              existingSupplies={availableSupplies}
              excludeId={packagingSupply?.id}
            />
          </div>
        )}

        {activeTab === PACKAGING_DETAIL_TABS.LOTS && (
          <TabLots
            itemId={packagingSupply?.id}
            base_uom_symbol={packagingSupply?.base_uom_symbol}
            onStockAdjusted={onStockAdjusted}
          />
        )}
      </Tabs>

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
        title="¿Eliminar envase?"
        description="Esta acción no se puede deshacer. El envase será eliminado permanentemente."
      />
    </div>
  )
}
