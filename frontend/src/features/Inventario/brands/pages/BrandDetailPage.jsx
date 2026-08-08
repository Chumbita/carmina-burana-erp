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
import { BrandForm } from '../components/BrandForm'
import { emptyBrand } from '../hooks/useBrandsPage'
import { useBrandDetail } from '../hooks/useBrandDetail'

export default function BrandDetailPage() {
  const { brandId } = useParams()
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const {
    auditRefreshKey,
    brand,
    deleteBrand,
    error,
    loading,
    saveBrand,
    saving,
  } = useBrandDetail(brandId)

  return (
    <EntityDetailPage loading={loading} error={error} layout="stack">
      <EntityDetailPage.Header name={brand?.name} />

      <EntityDetailPage.Content>
        <BrandForm
          brand={brand}
          emptyBrand={emptyBrand}
          saving={saving}
          onSubmit={saveBrand}
          layout="page"
          submitLabel="Guardar cambios"
          showDeleteButton={brand?.is_active}
          onDelete={() => setOpenDeleteDialog(true)}
        />
      </EntityDetailPage.Content>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Auditoría</h2>
        <AuditLogHistory entityType="brand" entityId={brand?.id} refreshKey={auditRefreshKey} />
      </section>

      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar marca</AlertDialogTitle>
            <AlertDialogDescription>
              La marca dejará de estar disponible para nuevos insumos, pero se mantendrá en registros existentes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={saving}
              onClick={async () => {
                await deleteBrand()
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
