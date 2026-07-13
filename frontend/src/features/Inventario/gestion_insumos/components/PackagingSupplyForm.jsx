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
  existingInputs = [],
  excludeId = null,
}) {
  const { brands, loading: brandsLoading } = useBrands()
  const { uoms, loading: uomsLoading } = useUoms()

  const schema = createPackagingSupplySchema(existingInputs, excludeId)

  const { handleSubmit, control } = useForm({
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup className="-space-y-4">
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  aria-invalid={fieldState.invalid}
                  value={field.value ?? ""}
                  onChange={(event) => {
                    const value = event.target.value
                    field.onChange(value === "" ? undefined : event.target.valueAsNumber)
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
                  aria-invalid={fieldState.invalid}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
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
        </div>
      </FieldGroup>

      <div className="flex justify-between gap-2">
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

        <Button size="sm" type="submit" disabled={isSubmitting} className="cursor-pointer">
          {isSubmitting ? "Guardando..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}
