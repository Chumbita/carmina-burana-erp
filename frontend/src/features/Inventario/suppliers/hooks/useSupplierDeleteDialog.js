import { useCallback, useState } from 'react'

export function useSupplierDeleteDialog(onDelete) {
  const [open, setOpen] = useState(false)

  const openDialog = useCallback(() => setOpen(true), [])

  const confirm = useCallback(async () => {
    await onDelete()
    setOpen(false)
  }, [onDelete])

  return { open, setOpen, openDialog, confirm }
}
