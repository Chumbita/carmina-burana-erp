import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'

import { sumEntryItemsAmount } from '../dto/supplyEntry.dto'
import { AnnulEntryDialog } from './AnnulEntryDialog'
import { SupplyEntryDetailHeader } from './SupplyEntryDetailHeader'
import { SupplyEntryDetailItemsTable } from './SupplyEntryDetailItemsTable'
import { SupplyEntrySummaryCards } from './SupplyEntrySummaryCards'

/**
 * Vista de detalle de un ingreso de insumos.
 * Presentación pura: todo el estado y las acciones vienen de `useSupplyEntryDetail`.
 */
export function SupplyEntryDetail({ detailHook, onBack }) {
  const {
    loading,
    error,
    entry,
    showAnnulDialog,
    annulling,
    canAnnul,
    isAnnulmentValid,
    registerAnnulment,
    handleAnnulmentSubmit,
    setShowAnnulDialog,
    handleAnnul,
    handleExport,
    handlePrint,
    handleNavigateToBatch,
  } = detailHook

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (error || !entry) {
    return (
      <div className="max-w-4xl p-6">
        <Card className="border-destructive/30 bg-destructive/10">
          <div className="p-4">
            <p className="text-sm text-destructive">
              {typeof error === 'string' ? error : error?.message || 'Error al cargar el abastecimiento'}
            </p>
            <Button onClick={onBack} className="mt-4">
              Volver
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <SupplyEntryDetailHeader
        entry={entry}
        canAnnul={canAnnul}
        onBack={onBack}
        onOpenAnnulDialog={() => setShowAnnulDialog(true)}
        onExport={handleExport}
        onPrint={handlePrint}
      />

      <SupplyEntrySummaryCards entry={entry} totalItems={sumEntryItemsAmount(entry)} />

      <SupplyEntryDetailItemsTable
        items={entry.items}
        onNavigateToBatch={handleNavigateToBatch}
      />

      <AnnulEntryDialog
        open={showAnnulDialog}
        onOpenChange={setShowAnnulDialog}
        registerAnnulment={registerAnnulment}
        handleAnnulmentSubmit={handleAnnulmentSubmit}
        handleAnnul={handleAnnul}
        isAnnulmentValid={isAnnulmentValid}
        annulling={annulling}
      />
    </div>
  )
}
