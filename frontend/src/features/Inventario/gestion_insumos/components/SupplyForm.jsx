import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createSupplySchema, SUPPLY_CATEGORIES } from "../schemas/supply.schema"

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
  existingInputs = [],
  excludeId = null,
}) {
  const { brands, loading: brandsLoading } = useBrands()
  const { uoms, loading: uomsLoading } = useUoms()

  const schema = createSupplySchema(existingInputs, excludeId)

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
      supply_category:  defaultValues?.supply_category  ?? "",
      base_uom_id:      defaultValues?.base_uom_id      ?? undefined,
      min_stock_level:  defaultValues?.min_stock_level  ?? 0,
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Categoría */}
        <Controller
          name="supply_category"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
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
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          </div>
        ) : (
          <>
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
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            {/* Stock Mínimo (layout page) */}
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
          </>
        )}
      </FieldGroup>

      {/* Botones */}
      <div
        className={
          isModal
            ? "flex justify-between gap-2"
            : "md:col-span-2 flex justify-end mt-4 gap-2"
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
          disabled={isModal ? isSubmitting : !isDirty || isSubmitting}
          className="cursor-pointer"
        >
          {isSubmitting ? "Guardando..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}