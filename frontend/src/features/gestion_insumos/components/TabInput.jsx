import { useRef, useEffect, useState } from "react"
import { useBlocker, useNavigate } from "react-router-dom"
import { InputForm } from "./InputForm"
import { useDeleteInsumo } from "../hooks/useDeleteInsumo"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/AlertDialog"

import { Button } from "@/components/ui/Button"

import {
  AlertIndicatorSuccess,
  AlertIndicatorDestructive,
} from "../components/Notifications"



export function TabInput({ insumo }) {
  const formRef = useRef(null)
  const navigate = useNavigate()
  const [notification, setNotification] = useState(null)
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)

  const { deleteInsumo, isDeleting } = useDeleteInsumo(
    () => {
      setNotification({
        type: "success",
        message: "Insumo eliminado correctamente",
      })
    },
    () => {
      setNotification({
        type: "error",
        message: "No se pudo eliminar el insumo",
      })
    }
  )

  function onSubmit(data) {
    alert("Guardar cambios")
  }

  function onDelete() {
    setOpenDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    await deleteInsumo(insumo.id)
    navigate(-1)
    setOpenDeleteDialog(false)
  }

  const handleCloseNotification = () => {
    setNotification(null)
  }

  // bloquear recarga navegador
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!formRef.current?.isDirty) return
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  // bloquear navegación router
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      formRef.current?.isDirty &&
      currentLocation.pathname !== nextLocation.pathname
  )

  return (
    <>
      <InputForm
        formRef={formRef}
        defaultValues={{
          name: insumo.name,
          brand: insumo.brand,
          category: insumo.category,
          unit: insumo.unit,
          minimum_stock: insumo.minimum_stock,
          image: insumo.image,
        }}
        onSubmit={onSubmit}
        submitLabel="Guardar cambios"
        showDeleteButton={true}
        onDelete={onDelete}
        layout="page"
      />

      {/* confirm navegación */}
      {blocker.state === "blocked" && (
        <ConfirmModal
          onSave={() => {
            formRef.current?.handleSubmit(onSubmit)()
            blocker.proceed()
          }}
          onDiscard={() => {
            formRef.current?.reset()
            blocker.proceed()
          }}
          onCancel={() => blocker.reset()}
        />
      )}

      {/* dialog delete */}
      <DeleteInsumoDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* notificaciones */}
      {notification?.type === "success" && (
        <AlertIndicatorSuccess
          message={notification.message}
          onClose={handleCloseNotification}
          duration={6000}
        />
      )}

      {notification?.type === "error" && (
        <AlertIndicatorDestructive
          message={notification.message}
          onClose={handleCloseNotification}
          duration={6000}
        />
      )}
    </>
  )
}

function ConfirmModal({ onSave, onDiscard, onCancel }) {
  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-md">Cambios sin guardar</DialogTitle>
        </DialogHeader>

        <p className="text-sm">Tienes cambios sin guardar. ¿Qué deseas hacer?</p>

        <div className="flex justify-end gap-2 mt-4">
          <Button size="sm" variant="outline" onClick={onCancel} className="mr-auto cursor-pointer">
            Cancelar
          </Button>
          <Button size="sm" variant="secondary" onClick={onDiscard} className="cursor-pointer">
            Descartar
          </Button>
          <Button size="sm" onClick={onSave} className="cursor-pointer">
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DeleteInsumoDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar insumo?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. El insumo será eliminado permanentemente. Para borrar el insumo, primero debes eliminar todos los lotes asociados.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancelar
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
