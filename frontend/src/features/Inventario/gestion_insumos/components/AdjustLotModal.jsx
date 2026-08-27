import { useEffect, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/TextArea"
import { Spinner } from "@/components/ui/Spinner"
import { DecimalInput } from "@/components/shared/DecimalInput"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/Field"
import { useAdjustLot } from "../hooks/useAdjustLot"

function createSchema(currentQuantity, reservedQuantity) {
  return z.object({
    new_quantity: z
      .coerce.number({ invalid_type_error: "La cantidad es requerida" })
      .min(0, "La cantidad no puede ser negativa")
      .refine((val) => val !== Number(currentQuantity), {
        message: "La nueva cantidad debe ser distinta a la actual",
      })
      .refine((val) => val >= Number(reservedQuantity), {
        message: `No puede ser menor a lo reservado (${reservedQuantity})`,
      }),
    reason: z
      .string()
      .trim()
      .min(3, "El motivo debe tener al menos 3 caracteres")
      .max(500, "Máximo 500 caracteres"),
  })
}

export function AdjustLotModal({ open, onOpenChange, itemId, lot, baseUomSymbol, onSuccess }) {
  const currentQuantity = lot ? Number(lot.quantity) : 0
  const reservedQuantity = lot ? Number(lot.reserved_quantity ?? 0) : 0
  const schema = useMemo(() => createSchema(currentQuantity, reservedQuantity), [currentQuantity, reservedQuantity])

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      new_quantity: currentQuantity,
      reason: "",
    },
    mode: "onChange",
  })

  const { adjustLot, saving } = useAdjustLot({
    onSuccess: () => {
      if (onSuccess) onSuccess()
    },
  })

  const newQuantityWatch = watch("new_quantity")
  const delta = lot ? Number(newQuantityWatch ?? 0) - currentQuantity : 0
  const isEditable = lot ? lot.status !== "depleted" && lot.status !== "expired" : true

  useEffect(() => {
    if (open && lot) {
      reset({
        new_quantity: currentQuantity,
        reason: "",
      })
    }
  }, [open, lot, currentQuantity, reset])

  async function onSubmit(data) {
    if (!lot) return
    try {
      await adjustLot(itemId, lot.id, {
        new_quantity: data.new_quantity,
        reason: data.reason.trim(),
      })
      onOpenChange(false)
    } catch {
      // error ya notificado por useAdjustLot
    }
  }

  if (!lot) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustar stock de lote</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!isEditable && (
            <div className="rounded-md bg-amber-500/10 text-amber-700 border border-amber-500/30 px-3 py-2 text-sm">
              Este lote no se puede editar porque está {lot.status === "depleted" ? "agotado" : "vencido"}.
            </div>
          )}
          <Field>
            <FieldLabel htmlFor="lotCode">Lote</FieldLabel>
            <Input id="lotCode" value={lot.lot_code} disabled readOnly />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Cantidad actual</FieldLabel>
              <Input
                value={`${currentQuantity.toLocaleString("es-AR")} ${baseUomSymbol ?? ""}`}
                disabled
                readOnly
              />
              {reservedQuantity > 0 && (
                <p className="text-xs text-muted-foreground">Reservado: {reservedQuantity} {baseUomSymbol}</p>
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
                  <DecimalInput {...field} id={field.name} aria-invalid={fieldState.invalid} disabled={!isEditable} />
                </Field>
              )}
            />
          </div>

          {delta !== 0 && !Number.isNaN(delta) && (
            <div className={`rounded-md px-3 py-2 text-sm ${delta > 0 ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/30" : "bg-red-500/10 text-red-600 border border-red-500/30"}`}>
              {delta > 0 ? "+" : ""}{delta.toLocaleString("es-AR")} {baseUomSymbol} {delta > 0 ? "a ingresar" : "a descontar"}
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

          <DialogFooter>
            <Button type="button" variant="outline" size="sm" className="cursor-pointer" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" className="cursor-pointer" disabled={!isEditable || !isDirty || !isValid || saving}>
              {saving ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Guardando…
                </>
              ) : (
                "Ajustar stock"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
