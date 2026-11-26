import { Controller } from "react-hook-form"

import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/TextArea"
import { DecimalInput } from "@/components/shared/DecimalInput"
import { Field, FieldError, FieldLabel } from "@/components/ui/Field"

const UNIT_BADGE_CLASS =
  "pointer-events-none absolute right-0 top-0 bottom-0 flex items-center justify-center bg-muted/50 px-3 text-xs font-medium text-muted-foreground rounded-r-md"

/**
 * Presentación pura del formulario de ajuste de stock de un lote.
 */
export function AdjustLotFormFields({
  control,
  lot,
  baseUomSymbol,
  currentQuantity,
  reservedQuantity,
  delta,
  isEditable,
}) {
  return (
    <>
      {!isEditable && (
        <div className="rounded-md bg-amber-500/10 text-amber-700 border border-amber-500/30 px-3 py-2 text-sm">
          Este lote no se puede editar porque está{" "}
          {lot.status === "depleted" ? "agotado" : "vencido"}.
        </div>
      )}

      <Field>
        <FieldLabel htmlFor="lotCode">Lote</FieldLabel>
        <Input id="lotCode" value={lot.lot_code} disabled readOnly />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field>
          <FieldLabel>Cantidad actual</FieldLabel>
          <div className="relative">
            <Input
              value={currentQuantity.toLocaleString("es-AR")}
              disabled
              readOnly
              className="pr-12"
            />
            <span className={UNIT_BADGE_CLASS}>{baseUomSymbol ?? ""}</span>
          </div>
          {reservedQuantity > 0 && (
            <p className="text-xs text-muted-foreground">
              Reservado: {reservedQuantity} {baseUomSymbol}
            </p>
          )}
        </Field>

        <Controller
          name="new_quantity"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Nueva cantidad <span className="text-red-500 -ml-1">*</span>
              </FieldLabel>
              <div className="relative">
                <DecimalInput
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  disabled={!isEditable}
                  className="pr-12 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className={UNIT_BADGE_CLASS}>{baseUomSymbol ?? ""}</span>
              </div>
            </Field>
          )}
        />
      </div>

      {delta !== 0 && !Number.isNaN(delta) && (
        <div
          className={`rounded-md px-3 py-2 text-sm ${
            delta > 0
              ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/30"
              : "bg-red-500/10 text-red-600 border border-red-500/30"
          }`}
        >
          {delta > 0 ? "+" : ""}
          {delta.toLocaleString("es-AR")} {baseUomSymbol}{" "}
          {delta > 0 ? "a ingresar" : "a descontar"}
        </div>
      )}

      <Controller
        name="reason"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>
              Motivo <span className="text-red-500 -ml-1">*</span>
            </FieldLabel>
            <Textarea
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              placeholder="Ej. Diferencia detectada en auditoría 26/08 — conteo físico"
              rows={3}
              disabled={!isEditable}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />
    </>
  )
}
