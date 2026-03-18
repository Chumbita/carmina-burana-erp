//componentes 
import { InputForm } from "./InputForm"
import { Notification } from "../components/Notifications"
import { ConfirmNavigationModal } from "./ConfirmNavigationModal"

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

//hooks
import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useInputs } from "../hooks/useInputs"
import { useNotification } from "../hooks/useNotification"
import { useFormBlocker } from "../hooks/useFormBlocker";


export function TabInput({ insumo, onInputUpdated }) {
  const formRef = useRef(null)
  const navigate = useNavigate()
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const { blocker } = useFormBlocker(formRef)

  const {
    updateInput,
    deleteInput,
    loading,
    error,
    inputs
  } = useInputs()

  const {
    notification,
    notify,
    clearNotification
  } = useNotification()

//editar insumo
async function onSubmit(data) {
  try {
    await updateInput(insumo.id, data)
    notify.success(`Insumo actualizado correctamente`)

    if (formRef.current?.reset) {
      formRef.current.reset({
        name: data.name,
        brand: data.brand,
        category: data.category,
        unit: data.unit,
        minimum_stock: data.minimum_stock,
        image: data.image,
      }, {
        keepDirty: false,
        keepDirtyValues: false,
      })
    }
    
    // Notificar que el insumo fue actualizado para refrescar el historial
    if (onInputUpdated) {
      onInputUpdated();
    }
    
    return true
  } catch (error) {
    console.error(error)
      notify.error(`Error al actualizar el insumo ${error}`)
    return false
  }
}

//borrar insumo
  function onDelete() {
    setOpenDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    try {
      await deleteInput(insumo.id)
      setOpenDeleteDialog(false) 
      navigate("/inventario/insumos", { 
        state: { 
          notification: { type: 'success', message: `${insumo.name} eliminado con éxito` } 
        } 
      })
    }catch (error) {
      notify.error(`Ha ocurrido un problema ${error}`)
    }
  }

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
        existingInputs={inputs} // Para validación de nombre único
        excludeId={insumo.id} // Excluir el insumo actual de la validación
      />

      {/* confirm navegación */}
     {blocker.state === "blocked" && (
    <ConfirmNavigationModal
      onSave={async () => {
        const success = await formRef.current?.submit()  
        blocker.proceed()
        navigate("/inventario/insumos", { 
        state: { 
          notification: { type: 'success', message: `${insumo.name} actualizado con éxito` } 
        } 
      })
      }}
      onDiscard={() => {
        // Resetear a los valores originales
        formRef.current?.reset({
          name: insumo.name,
          brand: insumo.brand,
          category: insumo.category,
          unit: insumo.unit,
          minimum_stock: insumo.minimum_stock,
          image: insumo.image,
        })
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
        isDeleting={loading}
      />

      {/* notificaciones */}
      <Notification notification={notification} onClose={clearNotification} />
    </>
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
          <AlertDialogCancel disabled={isDeleting} className="hover:bg-neutral-200 cursor-pointer">
            Cancelar
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 cursor-pointer"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
