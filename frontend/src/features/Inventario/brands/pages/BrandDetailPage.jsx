import { useParams } from 'react-router-dom'

import { AuditLogHistory } from '@/components/shared/AuditLogHistory'
import { EntityDetailPage } from '@/components/shared/DetailPage/EntityDetailPage'
import { BrandForm } from '../components/BrandForm'
import { DeleteBrandDialog } from '../components/DeleteBrandDialog'
import { emptyBrand } from '../dto/brand.dto'
import { useBrandDeleteDialog } from '../hooks/useBrandDeleteDialog'
import { useBrandDetail } from '../hooks/useBrandDetail'

export default function BrandDetailPage() {
  const { brandId } = useParams()
  const { auditRefreshKey, brand, deleteBrand, error, loading, saveBrand, saving } =
    useBrandDetail(brandId)
  const deleteDialog = useBrandDeleteDialog(deleteBrand)

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
          onDelete={deleteDialog.openDialog}
        />
      </EntityDetailPage.Content>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Auditoría</h2>
        <AuditLogHistory entityType="brand" entityId={brand?.id} refreshKey={auditRefreshKey} />
      </section>

      <DeleteBrandDialog
        open={deleteDialog.open}
        onOpenChange={deleteDialog.setOpen}
        saving={saving}
        onConfirm={deleteDialog.confirm}
      />
    </EntityDetailPage>
  )
}
