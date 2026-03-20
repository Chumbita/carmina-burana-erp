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
      console.log('Annulling entry:', entryId, 'Reason:', reason)
      // TODO: Implement API call for annulment
      await new Promise(resolve => setTimeout(resolve, 1500))
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
        
        <div className="border border-red-200 bg-red-50 rounded-lg p-4">
          <p className="text-sm text-red-600">{detailHook.error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Detail component - it already includes its own header */}
      <SupplyEntryDetail
        detailHook={detailHook}
        onBack={handleBack}
      />
    </div>
  )
}
