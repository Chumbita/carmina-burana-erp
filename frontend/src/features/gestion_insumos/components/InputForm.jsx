import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { insumoSchema } from "../schemas/insumo.schema"
import { useRef } from "react"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/Field"
import { ImageUpload } from "./ImageUpload"

export function InputForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Guardar",
  cancelLabel = "Cancelar",
  isSubmitting = false,
  showDeleteButton = false,
  onDelete,
  layout = "modal", // modal o page, varía estilos
  formRef
}) {
  const fileRef = useRef(null)

  const {
    handleSubmit,
    control,
    reset,
    formState: { isDirty },
  } = useForm({
    resolver: zodResolver(insumoSchema),
    defaultValues,
  })

  // Exponer métodos al padre si se necesita
  if (formRef) {
    formRef.current = { handleSubmit, reset, isDirty }
  }

  const isModal = layout === "modal"

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={isModal ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 gap-4"}
    >
      <FieldGroup className={isModal ? "-space-y-4" : "contents"}>
        {/* Nombre */}
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Nombre <span className="text-red-500 -ml-1">*</span>
                </FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Marca */}
        <Controller
          name="brand"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Marca<span className="text-red-500 -ml-1">*</span>
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Categoría */}
        <Controller
          name="category"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Categoría
                <span className="text-red-500 -ml-1">*</span>
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Layout condicional para modal o page */}
        {isModal ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-1 space-y-4">
              {/* Stock Mínimo */}
              <Controller
                name="minimum_stock"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Stock mínimo <span className="text-red-500 -ml-1">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="number"
                      aria-invalid={fieldState.invalid}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Unidad de Medida */}
              <Controller
                name="unit"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      {fieldState.invalid && <FieldError  />}
                      Unidad de medida <span className="text-red-500 -ml-1">*</span>
                    </FieldLabel>
                    <Select
                      name={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Seleccione unidad..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Unidades</SelectLabel>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="l">L</SelectItem>
                          <SelectItem value="un">un</SelectItem>.
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </div>

            {/* Imagen */}
            <Field>
              <FieldLabel>Imagen</FieldLabel>
              <Controller
                control={control}
                name="image"
                render={({ field }) => (
                  <ImageUpload value={field.value} onChange={field.onChange} />
                )}
              />
            </Field>
          </div>
        ) : (
          <>
            {/* Unidad de Medida */}
            <Controller
              name="unit"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Unidad de medida
                    <span className="text-red-500 -ml-1">*</span>
                  </FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id={field.name}
                      className="bg-neutral-100 border-none"
                      aria-invalid={fieldState.invalid}
                    >
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
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Stock Mínimo */}
            <Controller
              name="minimum_stock"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>                   
                    Stock mínimo
                    <span className="text-red-500 -ml-1">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="number"
                    aria-invalid={fieldState.invalid}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Imagen */}
            <Field>
              <FieldLabel>Imagen</FieldLabel>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileRef}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    // acá se maneja la imagen
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileRef.current?.click()}
                className="cursor-pointer"
              >
                Editar imagen
              </Button>
            </Field>
          </>
        )}
      </FieldGroup>

      {/* Botones */}
      <div className={isModal
        ? "flex justify-between gap-2"
        : "md:col-span-2 flex justify-end mt-4 gap-2"
      }>
        {showDeleteButton && (
          <Button
            size="sm"
            type="button"
            onClick={onDelete}
            className="bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer"
            disabled={isSubmitting}
          >
            Eliminar insumo
          </Button>
        )}

        {onCancel && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            {cancelLabel}
          </Button>
        )}

        <Button
          size="sm"
          type="submit"
          disabled={isModal ? isSubmitting : (!isDirty || isSubmitting)}
          className="cursor-pointer"
        >
          {isSubmitting ? "Guardando..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}