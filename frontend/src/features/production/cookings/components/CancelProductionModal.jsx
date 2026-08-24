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
import { useNotification } from "@/components/shared/notifications/useNotification";

/**
 * Modal de confirmación para cancelar una orden de producción en estado PLANNED.
 *
 * props:
 *  - open: bool
 *  - order: orden a cancelar (id, item_name, row_number?)
 *  - onCancel: async (orderId) => void
 *  - onClose: () => void
 */
export function CancelProductionModal({ open, order, onCancel, onClose }) {
  const notify = useNotification();
  const [submitting, setSubmitting] = useState(false);

  if (!order) return null;

  const orderNumber = order.row_number ?? order.id;

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onCancel(order.id);
      notify.success(`Orden Nro ${orderNumber} cancelada.`);
      onClose();
    } catch (err) {
      const errorData = err.response?.data?.detail;
      notify.error(
        typeof errorData === "string"
          ? errorData
          : errorData?.message || "Ocurrió un error al cancelar la orden."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && !submitting && onClose()}>
      <DialogContent className="sm:!max-w-sm">
        <DialogHeader>
          <DialogTitle>¿Cancelar Orden?</DialogTitle>
          <DialogDescription>
            Se liberarán las reservas de insumos y la orden Nro {orderNumber} ({order.item_name}) pasará a estado CANCELLED.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose} disabled={submitting}>Volver</Button>
          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={handleConfirm} disabled={submitting}>
            Confirmar cancelación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CancelProductionModal;
