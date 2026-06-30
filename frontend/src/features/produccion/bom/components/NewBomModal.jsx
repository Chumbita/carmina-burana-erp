import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { BomForm } from './BomForm'
import { useBomForm } from '../hooks/useBomForm'

export function NewBomModal({ open, onClose, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(data) {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      onClose()
    } catch {
      // el error se maneja en useBomForm
    } finally {
      setIsSubmitting(false)
    }
  }

  const formHook = useBomForm(handleSubmit)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="!w-[50vw] !max-w-[50vw] !sm:max-w-[50vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Nueva Fórmula</DialogTitle>
        </DialogHeader>

        <BomForm
          formHook={formHook}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  )
}
