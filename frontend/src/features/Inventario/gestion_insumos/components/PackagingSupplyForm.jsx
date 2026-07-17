import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createPackagingSupplySchema, PACKAGING_TYPES } from "../schemas/supply.schema"

import { useBrands } from "../hooks/useBrands"
import { useUoms } from "../hooks/useUoms"

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

export function PackagingSupplyForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Guardar",
  cancelLabel = "Cancelar",
  isSubmitting = false,
  showDeleteButton = false,
  onDelete,
  layout = "modal",
  formRef,
  existingInputs = [],
  excludeId = null,
}) {
  const { brands, loading: brandsLoading } = useBrands()
  const { uoms, loading: uomsLoading } = useUoms()

  const schema = createPackagingSupplySchema(existingInputs, excludeId)

  const {
    handleSubmit,
    control,
    reset,
    formState: { isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name:             defaultValues?.name             ?? "",
      brand_id:         defaultValues?.brand_id         ?? undefined,
      base_uom_id:      defaultValues?.base_uom_id      ?? undefined,
      min_stock_level:  defaultValues?.min_stock_level  ?? 1,
      packaging_type:   defaultValues?.packaging_type   ?? "",
      material:         defaultValues?.material         ?? "",
      capacity_ml:      defaultValues?.capacity_ml      ?? undefined,
    },
    mode: "onChange",
  })

  if (formRef) {
    formRef.current = {
      submit: () => handleSubmit(onSubmit)(),
      reset,
      isDirty,
    }
  }

  const isModal = layout === "modal"

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={isModal ? "space-y-4" : "grid grid-cols-1 md:grid-cols-4 gap-4"}
    >
      <FieldGroup className={isModal ? "-space-y-4" : "contents"}>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="md:col-span-2">
              <FieldLabel htmlFor={field.name}>
                Nombre <span className="text-red-500 -ml-1">*</span>
              </FieldLabel>
              <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="brand_id"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Marca <span className="text-red-500 -ml-1">*</span>
              </FieldLabel>
              <Select
                name={field.name}
                value={field.value !== undefined ? String(field.value) : ""}
                onValueChange={(val) => field.onChange(Number(val))}
                disabled={brandsLoading}
              >
                <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder={brandsLoading ? "Cargando marcas..." : "Seleccione marca..."} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Marcas</SelectLabel>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={String(brand.id)}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
            name="packaging_type"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Tipo <span className="text-red-500 -ml-1">*</span>
                </FieldLabel>
                <Select name={field.name} value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Seleccione tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Tipos de envase</SelectLabel>
                      {PACKAGING_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="material"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Material <span className="text-red-500 -ml-1">*</span>
                </FieldLabel>
                <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="capacity_ml"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Capacidad ml</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  step="0.01"
                  aria-invalid={fieldState.invalid}
                  value={field.value != null ? Number(field.value).toFixed(2) : ""}
                  onChange={(event) => {
                    const value = event.target.value
                    field.onChange(value === "" ? undefined : Math.round(parseFloat(value) * 100) / 100)
                  }}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="min_stock_level"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Stock mínimo</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  step="1"
                  aria-invalid={fieldState.invalid}
                  value={field.value != null ? parseInt(field.value, 10) : ""}
                  onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="base_uom_id"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Unidad <span className="text-red-500 -ml-1">*</span>
                </FieldLabel>
                <Select
                  name={field.name}
                  value={field.value !== undefined ? String(field.value) : ""}
                  onValueChange={(val) => field.onChange(Number(val))}
                  disabled={uomsLoading}
                >
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder={uomsLoading ? "Cargando..." : "Unidad..."} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Unidades</SelectLabel>
                      {uoms.map((uom) => (
                        <SelectItem key={uom.id} value={String(uom.id)}>
                          {uom.symbol}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
      </FieldGroup>

      <div className={isModal ? "flex justify-between gap-2" : "md:col-span-4 flex justify-end mt-4 gap-2"}>
        {showDeleteButton && (
          <Button
            type="button"
            size="sm"
            onClick={onDelete}
            className="bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer"
          >
            Eliminar
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
          disabled={isModal ? isSubmitting : !isDirty || isSubmitting}
          className="cursor-pointer"
        >
          {isSubmitting ? "Guardando..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}
