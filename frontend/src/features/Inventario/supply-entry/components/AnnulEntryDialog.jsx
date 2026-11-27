import { AlertTriangle } from 'lucide-react'

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

/**
 * Confirmación de anulación de un ingreso. Presentación pura sobre el
 * formulario de `useSupplyEntryDetail`.
 */
export function AnnulEntryDialog({
  open,
  onOpenChange,
  registerAnnulment,
  handleAnnulmentSubmit,
  handleAnnul,
  isAnnulmentValid,
  annulling,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Anular Recepción
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará los lotes generados, revertirá el stock y cambiará el estado a "Anulada".
            Esta acción no se puede deshacer.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleAnnulmentSubmit(handleAnnul)}>
          <div className="py-4">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Motivo de anulación <span className="text-destructive">*</span>
            </label>
            <textarea
              className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Especifique el motivo por el cual se anula esta recepción..."
              {...registerAnnulment('reason')}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={annulling} className="cursor-pointer">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              type="submit"
              disabled={!isAnnulmentValid || annulling}
              className="cursor-pointer bg-destructive text-white hover:bg-destructive/90"
            >
              {annulling ? 'Anulando...' : 'Anular Recepción'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  )
}
