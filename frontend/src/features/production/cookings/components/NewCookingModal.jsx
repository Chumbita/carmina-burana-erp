import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { CookingForm } from "./CookingForm";

export function NewCookingModal({ open, onClose, onSubmit }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva cocción</DialogTitle>
        </DialogHeader>
        <CookingForm
          onSubmit={onSubmit}
          onCancel={onClose}
          isSubmitting={false}
        />
      </DialogContent>
    </Dialog>
  );
}
