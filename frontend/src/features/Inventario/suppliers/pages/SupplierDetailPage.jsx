import { useParams } from 'react-router-dom'

import { AuditLogHistory } from '@/components/shared/AuditLogHistory'
import { EntityDetailPage } from '@/components/shared/DetailPage/EntityDetailPage'
import { DeleteSupplierDialog } from '../components/DeleteSupplierDialog'
import { SupplierForm } from '../components/SupplierForm'
import { emptySupplier } from '../dto/supplier.dto'
import { useSupplierDeleteDialog } from '../hooks/useSupplierDeleteDialog'
import { useSupplierDetail } from '../hooks/useSupplierDetail'

export default function SupplierDetailPage() {
  const { supplierId } = useParams()
  const { auditRefreshKey, deleteSupplier, error, loading, saving, supplier, saveSupplier } =
    useSupplierDetail(supplierId)
  const deleteDialog = useSupplierDeleteDialog(deleteSupplier)

  return (
    <EntityDetailPage loading={loading} error={error} layout="stack">
      <EntityDetailPage.Header name={supplier?.name} />

      <EntityDetailPage.Content>
        <SupplierForm
          supplier={supplier}
          emptySupplier={emptySupplier}
          saving={saving}
          onSubmit={saveSupplier}
          layout="page"
          submitLabel="Guardar cambios"
          showDeleteButton={supplier?.status === 'ACTIVE'}
          onDelete={deleteDialog.openDialog}
        />
      </EntityDetailPage.Content>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Auditoría</h2>
        <AuditLogHistory
          entityType="supplier"
          entityId={supplier?.id}
          refreshKey={auditRefreshKey}
        />
      </section>

      <DeleteSupplierDialog
        open={deleteDialog.open}
        onOpenChange={deleteDialog.setOpen}
        saving={saving}
        onConfirm={deleteDialog.confirm}
      />
    </EntityDetailPage>
  )
}
