import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'

import { SupplyEntryDetail } from '../components/SupplyEntryDetail'
import { useSupplyEntryDetail } from '../hooks/useSupplyEntryDetail'

/**
 * SupplyEntryDetailPage - Page for viewing detailed supply entry information
 * Follows the same pattern as InputDetailPage
 */
export default function SupplyEntryDetailPage() {
  const { entryId } = useParams()
  const navigate = useNavigate()

  const detailHook = useSupplyEntryDetail(
    entryId,
    async (entryId, reason) => {
      // Esta función ya no se usa, la lógica está en el hook
      console.log('Annulling entry:', entryId, 'Reason:', reason)
    }
  )

  const handleBack = () => {
    navigate('/inventario/ingreso-insumos')
  }

  if (detailHook.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neutral-500">Cargando...</div>
      </div>
    )
  }

  if (detailHook.error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button onClick={handleBack} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-neutral-900">Error</h1>
        </div>
        
        <div className="border border-red-200 bg-red-50 rounded-lg p-4">
          <p className="text-sm text-red-600">
            {typeof detailHook.error === 'string' ? detailHook.error : detailHook.error?.message || 'Error al cargar el abastecimiento'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Detail component - it already includes its own header */}
      <SupplyEntryDetail
        detailHook={detailHook}
        onBack={handleBack}
      />
    </div>
  )
}
