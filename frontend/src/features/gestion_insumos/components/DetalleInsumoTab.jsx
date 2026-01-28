import { Label } from "@/components/ui/Label"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { insumoSchema } from "../schemas/insumo.schema"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImageUpload } from "./ImageUpload"
import { useRef } from "react"
import { useEffect, useState } from "react"

import { useBlocker } from "react-router-dom"


export function InsumoDetailTable({ insumo, onSave }) {
 
  const fileRef = useRef(null)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty }
  } = useForm({
    resolver: zodResolver(insumoSchema),
    defaultValues: {
      nombre: insumo.nombre,
      marca: insumo.marca,
      categoria: insumo.categoria,
      unidadMedida: insumo.unidadMedida,
      stockMinimo: insumo.stockMinimo,
      imagen: insumo.imagen
    }
  })

  function onSubmit(data) {
    console.log("Guardar cambios:", data)
    onSave?.(data)
  }

  //no recargar el navegador si hay cambios sin guardar
  useEffect(() => {
  const handleBeforeUnload = (e) => {
    if (!isDirty) return
    e.preventDefault()
    e.returnValue = "" // requerido por el navegador
  }

  window.addEventListener("beforeunload", handleBeforeUnload)
  return () => window.removeEventListener("beforeunload", handleBeforeUnload)
}, [isDirty])

 //NO navegar si hay cambios sin guardar
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  )
    
  function handleNavigate(action) {
  if (isDirty) {
    setNextAction(() => action)
    setShowConfirm(true)
    return
  }
  action()
}


  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <div className="flex flex-col gap-2">
        <Label>Nombre</Label>
        <Input {...register("nombre")} />
        {errors.nombre && <p className="text-sm text-red-500">{errors.nombre.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Marca</Label>
        <Input {...register("marca")} />
        {errors.marca && <p className="text-sm text-red-500">{errors.marca.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Categoría</Label>
        <Input {...register("categoria")} />
        {errors.categoria && <p className="text-sm text-red-500">{errors.categoria.message}</p>}
      </div>

      <div>                 
          <Label className="mb-2">{errors.unidadMedida && (
          <p className="text-sm text-red-500 -mr-1.5">
              {errors.unidadMedida.message}
          </p>
          )}Unidad de medida</Label>
          <Controller
          control={control}
          name="unidadMedida"
          render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-full bg-neutral-100 border-none">
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

      <div className="flex flex-col gap-2">
        <Label>Stock mínimo</Label>
        <Input
          type="number"
          {...register("stockMinimo", { valueAsNumber: true })}
        />
        {errors.stockMinimo && <p className="text-sm text-red-500">{errors.stockMinimo.message}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Imagen</Label>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileRef}
          onChange={(e) => {
            const file = e.target.files[0]
            if (file) {
              // acá luego podés subirla o generar preview
            }
          }}
        />

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => fileRef.current.click()}
        >
          Editar imagen
        </Button>
      </div>
      
      <div className="md:col-span-2 flex justify-end mt-4 ">
        <Button
          size="sm"
          type="submit"
          disabled={!isDirty}
          className="cursor-pointer"
        >
          Guardar cambios
        </Button>
      </div>
      
      {/* bloqueador de navegacion  */}
        {blocker.state === "blocked" && (
      <ConfirmModal
        onSave={() => {
          handleSubmit(onSubmit)()
          blocker.proceed()
        }}
        onDiscard={() => {
          reset()
          blocker.proceed()
        }}
        onCancel={() => blocker.reset()}
      />
    )}
    </form>
  )
}


import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function ConfirmModal({ onSave, onDiscard, onCancel }) {
  return (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-md">Cambios sin guardar</DialogTitle>
        </DialogHeader>

        <p className="text-sm"> Tienes cambios sin guardar. ¿Qué deseas hacer?</p>

        <div className="flex justify-end gap-2 mt-4">
          <Button size="sm" variant="ghost" onClick={onCancel} className="start">
            Cancelar
          </Button>
          <Button size="sm" variant="outline" onClick={onDiscard}>
            Descartar
          </Button>
          <Button size="sm" onClick={onSave}>
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
