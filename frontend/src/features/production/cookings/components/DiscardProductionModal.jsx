import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/TextArea";
import { useNotification } from "@/components/shared/notifications/useNotification";

/**
 * Modal de confirmación para descartar una orden de producción en estado DONE.
 * Permite ingresar un motivo breve del descarte.
 *
 * props:
 *  - open: bool
 *  - order: orden a descartar (id, item_name, row_number?)
 *  - onDiscard: async (orderId, description) => void
 *  - onClose: () => void
 */
export function DiscardProductionModal({ open, order, onDiscard, onClose }) {
  const notify = useNotification();
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!order) return null;

  const orderNumber = order.row_number ?? order.id;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onDiscard(order.id, description);
      notify.success(`Orden Nro ${orderNumber} descartada.`);
      onClose();
    } catch (err) {
      const errorData = err.response?.data?.detail;
      notify.error(
        typeof errorData === "string"
          ? errorData
          : errorData?.message || "Ocurrió un error al descartar la orden."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && !submitting && onClose()}>
      <DialogContent className="sm:!max-w-sm">
        <DialogHeader>
          <DialogTitle>¿Descartar Orden?</DialogTitle>
          <DialogDescription>
            La orden Nro {orderNumber} ({order.item_name}) pasará a estado
            DISCARDED y el lote producido se descontará del inventario. Los insumos
            consumidos no se reponen.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Motivo del descarte
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Breve descripción del motivo..."
            className="min-h-[70px] text-xs py-1.5 px-3 leading-normal resize-none"
            maxLength={255}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>
            Volver
          </Button>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? "Descartando..." : "Confirmar descarte"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DiscardProductionModal;
