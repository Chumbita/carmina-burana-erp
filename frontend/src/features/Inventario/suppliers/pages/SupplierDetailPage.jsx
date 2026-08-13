import { useState } from 'react'
import { useParams } from 'react-router-dom'

import { AuditLogHistory } from '@/components/shared/AuditLogHistory'
import { EntityDetailPage } from '@/components/shared/DetailPage/EntityDetailPage'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog'
import { SupplierForm } from '../components/SupplierForm'
import { emptySupplier } from '../hooks/useSuppliersPage'
import { useSupplierDetail } from '../hooks/useSupplierDetail'

export default function SupplierDetailPage() {
  const { supplierId } = useParams()
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const {
    auditRefreshKey,
    deleteSupplier,
    error,
    loading,
    saving,
    supplier,
    saveSupplier,
  } = useSupplierDetail(supplierId)

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
          onDelete={() => setOpenDeleteDialog(true)}
        />
      </EntityDetailPage.Content>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Auditoría</h2>
        <AuditLogHistory entityType="supplier" entityId={supplier?.id} refreshKey={auditRefreshKey} />
      </section>

      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar proveedor</AlertDialogTitle>
            <AlertDialogDescription>
              El proveedor dejará de aparecer como opción activa para nuevos ingresos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={saving}
              onClick={async () => {
                await deleteSupplier()
                setOpenDeleteDialog(false)
              }}
            >
              {saving ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </EntityDetailPage>
  )
}
