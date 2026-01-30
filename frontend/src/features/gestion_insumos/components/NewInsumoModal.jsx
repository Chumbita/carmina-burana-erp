import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { useState } from "react"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { insumoSchema } from "../schemas/insumo.schema"

import { ImageUpload } from "./ImageUpload"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function NewInsumoModal({ open, onClose, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(insumoSchema),
    defaultValues: {
      nombre: "",
      marca: "",
      categoria: "",
      unidadMedida: "",
      stockMinimo: 0,
      imagen: ""
    }
  })

  function handleClose() {
    reset()
    onClose()
  }

  async function onFormSubmit(data) {
    setIsSubmitting(true)
    
    try {
      await onSubmit(data)
      // Solo resetear y cerrar si fue exitoso
      reset()
      // onClose() se ejecutará desde el padre después de actualizar el estado
    } catch (error) {
      console.error("Error en el formulario:", error)
      // Aquí podrías mostrar un mensaje de error al usuario
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo insumo</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          {/* Nombre */}
          <div>
            <Label className="mb-2">Nombre</Label>
            <Input {...register("nombre")} />
            {errors.nombre && (
              <p className="text-sm text-red-500">
                {errors.nombre.message}
              </p>
            )}
          </div>

          {/* Marca */} 
          <div>
            <Label className="mb-2">Marca</Label>
            <Input {...register("marca")} />
            {errors.marca && (
              <p className="text-sm text-red-500">
                {errors.marca.message}
              </p>
            )}                    
          </div>

          {/* Categoría */}           
          <div>   
            <Label className="mb-2">Categoría</Label>
            <Input {...register("categoria")} />
            {errors.categoria && (
              <p className="text-sm text-red-500">
                {errors.categoria.message}
              </p>
            )}                    
          </div>

          <div className="grid grid-cols-2 gap-4">   
            <div className="col-span-1 space-y-4">
              {/* Stock minimo */}
              <div>
                <Label className="mb-2">Stock mínimo</Label>
                <Input
                  type="number"
                  {...register("stockMinimo", { valueAsNumber: true })}
                />
                {errors.stockMinimo && (
                  <p className="text-sm text-red-500">
                    {errors.stockMinimo.message}
                  </p>
                )}
              </div>

              {/* Unidad de medida */}    
              <div>                 
                <Label className="mb-2">
                  {errors.unidadMedida && (
                    <p className="text-sm text-red-500 -mr-1.5">
                      {errors.unidadMedida.message}
                    </p>
                  )}
                  Unidad de medida
                </Label>
                <Controller
                  control={control}
                  name="unidadMedida"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione unidad..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Unidades</SelectLabel>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="l">L</SelectItem>
                          <SelectItem value="un">un</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {/* Imagen */}
            <div>
              <Label className="mb-2">Imagen</Label>
              <Controller
                control={control}
                name="imagen"
                render={({ field }) => (
                  <ImageUpload value={field.value} onChange={field.onChange} />
                )}
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex justify-between gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose} 
              className="cursor-pointer"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}