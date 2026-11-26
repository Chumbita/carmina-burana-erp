import { Controller } from "react-hook-form"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { DecimalInput } from "@/components/shared/DecimalInput"
import { Plus } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/Field"

import { PACKAGING_TYPES } from "../schemas/supply.schema"

const REQUIRED_MARK = <span className="text-red-500 -ml-1">*</span>

/**
 * Presentación pura de los campos del envase.
 * No conoce servicios, navegación ni notificaciones.
 */
export function PackagingSupplyFormFields({
  control,
  isModal,
  brands,
  brandsLoading,
  uoms,
  uomsLoading,
  onRequestCreateBrand,
}) {
  return (
    <FieldGroup className={isModal ? "-space-y-4" : "contents"}>
      {/* Nombre */}
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="md:col-span-2">
            <FieldLabel htmlFor={field.name}>
              Nombre {REQUIRED_MARK}
            </FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="Ej. Lata 375cc"
            />
          </Field>
        )}
      />

      {/* Marca */}
      <Controller
        name="brand_id"
        control={control}
        render={({ field }) => (
          <Field>
            <FieldLabel htmlFor={field.name}>
              Marca {REQUIRED_MARK}
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
                onClick={onRequestCreateBrand}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </Field>
        )}
      />

      {/* Tipo de envase */}
      <Controller
        name="packaging_type"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>
              Tipo {REQUIRED_MARK}
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
          </Field>
        )}
      />

      {/* Material */}
      <Controller
        name="material"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>
              Material del envase {REQUIRED_MARK}
            </FieldLabel>
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="Vidrio, aluminio..."
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      {/* Unidad */}
      <Controller
        name="base_uom_id"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>
              Unidad {REQUIRED_MARK}
            </FieldLabel>
            <Select
              name={field.name}
              value={field.value !== undefined ? String(field.value) : ""}
              onValueChange={(val) => field.onChange(Number(val))}
              disabled={uomsLoading}
            >
              <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                <SelectValue placeholder={uomsLoading ? "Cargando..." : "Seleccione unidad..."} />
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

      {/* Capacidad */}
      <Controller
        name="capacity_ml"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Capacidad del envase (ml)</FieldLabel>
            <DecimalInput
              {...field}
              id={field.name}
              placeholder="Ej: 330"
              aria-invalid={fieldState.invalid}
            />
          </Field>
        )}
      />

      {/* Stock mínimo */}
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
              onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
            />
          </Field>
        )}
      />
    </FieldGroup>
  )
}
