import { useEffect, useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createSupplySchema, SUPPLY_CATEGORIES } from "../schemas/supply.schema"

import { useBrands } from "../hooks/useBrands"
import { useUoms } from "../hooks/useUoms"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { DecimalInput } from "@/components/shared/DecimalInput"
import { Save, Plus } from 'lucide-react'
import { BrandForm } from "@/features/Inventario/brands/components/BrandForm"
import { brandService } from "@/features/Inventario/brands/services/brandService"
import { useNotification } from "@/components/shared/notifications/useNotification"
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

export function SupplyForm({
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
  existingSupplies = [],
  excludeId = null,
}) {
  const { brands, loading: brandsLoading, addBrand } = useBrands()
  const { uoms, loading: uomsLoading } = useUoms()
  const [brandDialogOpen, setBrandDialogOpen] = useState(false)
  const [brandSaving, setBrandSaving] = useState(false)
  const notify = useNotification()

  const schema = createSupplySchema(existingSupplies, excludeId)

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { isDirty, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name:             defaultValues?.name             ?? "",
      brand_id:         defaultValues?.brand_id         ?? undefined,
      supply_category:  defaultValues?.supply_category  ?? "",
      base_uom_id:      defaultValues?.base_uom_id      ?? undefined,
      min_stock_level:  defaultValues?.min_stock_level != null ? Number(defaultValues.min_stock_level) : 1,
    },
    mode: "onChange",
  })

  useEffect(() => {
    if (!formRef) return

    formRef.current = {
      submit: () => handleSubmit(onSubmit)(),
      reset,
      isDirty,
    }
  }, [formRef, handleSubmit, isDirty, onSubmit, reset])

  const isModal = layout === "modal"

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={isModal ? "space-y-4" : "grid grid-cols-1 md:grid-cols-4 gap-4"}
    >
      <FieldGroup className={isModal ? "-space-y-4" : "contents"}>

        {/* Nombre */}
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="md:col-span-2">
              <FieldLabel htmlFor={field.name}>
                Nombre <span className="text-red-500 -ml-1">*</span>
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder
              />
            </Field>
          )}
        />

        {/* Marca */}
        <Controller
          name="brand_id"
          control={control}
          render={({ field }) => (
            <Field className="md:col-span-2">
              <FieldLabel htmlFor={field.name}>
                Marca <span className="text-red-500 -ml-1">*</span>
              </FieldLabel>
              <div className="flex gap-1">
                <Select
                  name={field.name}
                  value={field.value !== undefined ? String(field.value) : ""}
                  onValueChange={(val) => field.onChange(Number(val))}
                  disabled={brandsLoading}
                >
                  <SelectTrigger id={field.name} className="flex-1 min-w-0">
                    <SelectValue
                      placeholder={brandsLoading ? "Cargando marcas..." : "Seleccione marca..."}
                    />
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
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  aria-label="Crear marca"
                  onClick={() => setBrandDialogOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </Field>
          )}
        />

        {/* Categoría */}
        <Controller
          name="supply_category"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className="md:col-span-2">
              <FieldLabel htmlFor={field.name}>
                Categoría <span className="text-red-500 -ml-1">*</span>
              </FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Seleccione categoría..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categorías</SelectLabel>
                    {SUPPLY_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        {/* Layout condicional para modal o page */}
        {isModal ? (
          <div className="grid grid-cols-2 gap-4">
            {/* Stock Mínimo */}
            <Controller
              name="min_stock_level"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Stock mínimo <span className="text-red-500 -ml-1">*</span>
                  </FieldLabel>
                  <DecimalInput
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  />
                </Field>
              )}
            />

            {/* Unidad de Medida */}
            <Controller
              name="base_uom_id"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Unidad de medida <span className="text-red-500 -ml-1">*</span>
                  </FieldLabel>
                  <Select
                    name={field.name}
                    value={field.value !== undefined ? String(field.value) : ""}
                    onValueChange={(val) => field.onChange(Number(val))}
                    disabled={uomsLoading}
                  >
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                      <SelectValue
                        placeholder={uomsLoading ? "Cargando unidades..." : "Seleccione unidad..."}
                      />
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
                </Field>
              )}
            />
          </div>
        ) : (
          <>
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              {/* Unidad de Medida (layout page) */}
              <Controller
                name="base_uom_id"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Unidad de medida <span className="text-red-500 -ml-1">*</span>
                    </FieldLabel>
                    <Select
                      name={field.name}
                      value={field.value !== undefined ? String(field.value) : ""}
                      onValueChange={(val) => field.onChange(Number(val))}
                      disabled={uomsLoading}
                    >
                      <SelectTrigger
                        id={field.name}
                        className="bg-neutral-100 border-none"
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue
                          placeholder={uomsLoading ? "Cargando unidades..." : "Seleccione unidad..."}
                        />
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
                  </Field>
                )}
              />

              {/* Stock Mínimo (layout page) */}
              <Controller
                name="min_stock_level"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Stock mínimo <span className="text-red-500 -ml-1">*</span>
                    </FieldLabel>
                    <DecimalInput
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    />
                  </Field>
                )}
              />
            </div>
          </>
        )}
      </FieldGroup>

      {/* Botones */}
      <div
        className={
          isModal
            ? "flex justify-end gap-2"
            : "md:col-span-4 flex justify-end mt-4 gap-2"
        }
      >
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
          disabled={isModal ? isSubmitting || !isValid : !isDirty || !isValid || isSubmitting}
          className="cursor-pointer"
        >
          {isSubmitting ? "Guardando..." : (
            <>
              <Save data-icon="inline-start" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>

      <BrandForm
        open={brandDialogOpen}
        onOpenChange={setBrandDialogOpen}
        brand={{ name: "" }}
        emptyBrand={{ name: "" }}
        saving={brandSaving}
        submitLabel="Crear marca"
        onSubmit={async (data) => {
          try {
            setBrandSaving(true)
            const newBrand = await brandService.create({ name: data.name.trim() })
            addBrand(newBrand)
            setValue("brand_id", newBrand.id, { shouldDirty: true, shouldValidate: true })
            notify.success("Marca creada correctamente")
            setBrandDialogOpen(false)
          } catch (error) {
            notify.error(error.response?.data?.detail || "Error al crear marca")
          } finally {
            setBrandSaving(false)
          }
        }}
      />
    </form>
  )
}
