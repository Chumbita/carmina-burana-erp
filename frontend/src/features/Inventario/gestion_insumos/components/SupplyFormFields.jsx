import { Controller } from "react-hook-form"

import { Input } from "@/components/ui/Input"
import { DecimalInput } from "@/components/shared/DecimalInput"
import { Button } from "@/components/ui/Button"
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/Field"

import { SUPPLY_CATEGORIES } from "../schemas/supply.schema"

const REQUIRED_MARK = <span className="text-red-500 -ml-1">*</span>

function BrandField({ control, brands, brandsLoading, onRequestCreateBrand }) {
  return (
    <Controller
      name="brand_id"
      control={control}
      render={({ field }) => (
        <Field className="md:col-span-2">
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
  )
}

function UomField({ control, uoms, uomsLoading, triggerClassName }) {
  return (
    <Controller
      name="base_uom_id"
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>
            Unidad de medida {REQUIRED_MARK}
          </FieldLabel>
          <Select
            name={field.name}
            value={field.value !== undefined ? String(field.value) : ""}
            onValueChange={(val) => field.onChange(Number(val))}
            disabled={uomsLoading}
          >
            <SelectTrigger
              id={field.name}
              className={triggerClassName}
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
  )
}

function MinStockField({ control }) {
  return (
    <Controller
      name="min_stock_level"
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>
            Stock mínimo {REQUIRED_MARK}
          </FieldLabel>
          <DecimalInput {...field} id={field.name} aria-invalid={fieldState.invalid} />
        </Field>
      )}
    />
  )
}

/**
 * Presentación pura de los campos del insumo de producción.
 * No conoce servicios, navegación ni notificaciones.
 */
export function SupplyFormFields({
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
            <Input {...field} id={field.name} aria-invalid={fieldState.invalid} placeholder />
          </Field>
        )}
      />

      <BrandField
        control={control}
        brands={brands}
        brandsLoading={brandsLoading}
        onRequestCreateBrand={onRequestCreateBrand}
      />

      {/* Categoría */}
      <Controller
        name="supply_category"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid} className="md:col-span-2">
            <FieldLabel htmlFor={field.name}>
              Categoría {REQUIRED_MARK}
            </FieldLabel>
            <Select name={field.name} value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                <SelectValue placeholder="Seleccione categoría..." />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categorías</SelectLabel>
                  {SUPPLY_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
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
          <MinStockField control={control} />
          <UomField control={control} uoms={uoms} uomsLoading={uomsLoading} />
        </div>
      ) : (
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <UomField
            control={control}
            uoms={uoms}
            uomsLoading={uomsLoading}
            triggerClassName="bg-neutral-100 border-none"
          />
          <MinStockField control={control} />
        </div>
      )}
    </FieldGroup>
  )
}
