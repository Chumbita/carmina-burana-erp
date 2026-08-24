import { useEffect } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Field, FieldLabel } from "@/components/ui/Field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/InputGroup";
import { AlertTriangle, Package } from "lucide-react";
import { useNotification } from "@/components/shared/notifications/useNotification";
import { completeProductionSchema } from "../schemas/production.schema";

function formatDateDMY(value) {
  if (!value) return "";
  const [datePart] = String(value).split("T");
  const [y, m, d] = datePart.split("-");
  return y && m && d ? `${d}/${m}/${y}` : datePart;
}

/**
 * Modal para ejecutar una orden de producción en estado PLANNED.
 * Incluye el formulario de completado y el aviso de insumos faltantes.
 *
 * props:
 *  - open: bool
 *  - order: orden a ejecutar (id, item_name, planned_quantity, schedule_date,
 *    base_uom_symbol y unit_cost | estimated_unit_cost para precostear)
 *  - onExecute: async (order, payload) => void
 *  - onClose: () => void
 */
export function ExecuteProductionModal({ open, order, onExecute, onClose }) {
  const notify = useNotification();

  const schemaComplete = completeProductionSchema();
  const {
    handleSubmit: handleCompleteSubmitForm,
    control: completeControl,
    setValue: setCompleteValue,
    reset: resetCompleteForm,
    formState: { errors: completeErrors, isSubmitting: isCompleting }
  } = useForm({
    resolver: zodResolver(schemaComplete),
    defaultValues: {
      produced_quantity: 1,
      lot_code: "",
      production_date: "",
      expiration_date: "",
      unit_cost: "",
    },
    mode: "onChange"
  });

  // Sincroniza los datos de la orden con el formulario de Zod
  useEffect(() => {
    if (open && order) {
      setCompleteValue("produced_quantity", Number(order.planned_quantity || 1));

      const productionDate = order.schedule_date
        ? order.schedule_date.split('T')[0]
        : "";

      setCompleteValue("production_date", productionDate);
      setCompleteValue("lot_code", "");
      setCompleteValue("expiration_date", "");
      setCompleteValue(
        "unit_cost",
        Number(order.unit_cost ?? order.estimated_unit_cost ?? 0)
      );
    }
  }, [open, order, setCompleteValue]);

  // En latas el código de lote es la fecha de producción (autogenerado)
  const isLata = (order?.item_name || "").toLowerCase().includes("lata");
  const watchedProductionDate = useWatch({ control: completeControl, name: "production_date" });
  const watchedExpirationDate = useWatch({ control: completeControl, name: "expiration_date" });
  const completedDateOnly = watchedProductionDate?.split("T")[0] || "";

  useEffect(() => {
    if (isLata && watchedProductionDate) {
      setCompleteValue("lot_code", formatDateDMY(watchedProductionDate));
    }
  }, [isLata, watchedProductionDate, setCompleteValue]);

  if (!order) return null;

  const orderNumber = order.row_number ?? order.id;

  // Manejador del envío del formulario de completar
  const onCompleteSubmit = async (data) => {
    const payload = {
      produced_quantity: Number(data.produced_quantity || 0),
      lot_code: data.lot_code,
      production_date: data.production_date ? data.production_date.split("T")[0] : undefined,
      expiration_date: data.expiration_date,
      unit_cost: data.unit_cost ?? Number(order.unit_cost ?? order.estimated_unit_cost ?? 0),
    };
    try {
      await onExecute(order, payload);
      notify.success(`¡Orden Nro ${orderNumber} completada con éxito!`);
      onClose();
      resetCompleteForm();
    } catch (err) {
      notify.error(err.response?.data?.detail?.message || "Error al completar la orden.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && onClose()}>
      <DialogContent className="sm:!max-w-md">
        <DialogHeader className="space-y-1">
          <DialogTitle>Ejecutar Producción</DialogTitle>
          <DialogDescription>
            Orden Nro {orderNumber}: <span className="font-semibold">{order.item_name}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCompleteSubmitForm(onCompleteSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Controller
                name="produced_quantity"
                control={completeControl}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className="text-sm">
                      Cant. Producida
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        type="number"
                        step="any"
                        className="text-sm"
                      />
                      <InputGroupAddon align="inline-end" className="pl-3 pr-3 text-sm text-neutral-500 font-normal border-l border-neutral-200">
                        {order.base_uom_symbol || "U"}
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                )}
              />
              {completeErrors.produced_quantity && <span className="text-[10px] text-red-500">{completeErrors.produced_quantity.message}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <Controller
                name="lot_code"
                control={completeControl}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className="text-sm">
                      Código de Lote
                    </FieldLabel>
                    <Input {...field} id={field.name} type="text" placeholder={isLata ? "Autogenerado (fecha)" : "Ej: IPA-2026-001"} className="h-9 text-sm" />
                  </Field>
                )}
              />
              {completeErrors.lot_code && <span className="text-[10px] text-red-500">{completeErrors.lot_code.message}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <Field>
                <FieldLabel className="text-sm">
                  Fecha programada
                </FieldLabel>
                <Input
                  type="date"
                  value={order.schedule_date ? order.schedule_date.split("T")[0] : ""}
                  disabled
                  className="h-9 text-sm bg-muted cursor-not-allowed"
                />
              </Field>
            </div>

            <div className="flex flex-col gap-1">
              <Controller
                name="production_date"
                control={completeControl}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className="text-sm">
                      Fecha completada
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="datetime-local"
                      className="h-9 text-sm"
                    />
                  </Field>
                )}
              />
              {completeErrors.production_date && <span className="text-[10px] text-red-500">{completeErrors.production_date.message}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <Controller
                name="expiration_date"
                control={completeControl}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className="text-sm">
                      Fecha de Vencimiento
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="date"
                      min={completedDateOnly || undefined}
                      className={`h-9 text-sm ${
                        completedDateOnly &&
                        watchedExpirationDate === completedDateOnly
                          ? "bg-red-50"
                          : ""
                      }`}
                    />
                  </Field>
                )}
              />
              {completeErrors.expiration_date && <span className="text-[10px] text-red-500">{completeErrors.expiration_date.message}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <Controller
                name="unit_cost"
                control={completeControl}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className="text-sm">
                      Costo Unitario
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupAddon align="inline-start" className="pl-2.5 pr-1 text-sm text-neutral-500 font-normal">
                        $
                      </InputGroupAddon>
                      <InputGroupInput
                        {...field}
                        id={field.name}
                        type="number"
                        step="any"
                        disabled
                        className="text-sm"
                      />
                      <InputGroupAddon align="inline-end" className="pl-3 pr-3 text-sm text-neutral-500 font-normal border-l border-neutral-200">
                        $/{order.base_uom_symbol || "U"}
                      </InputGroupAddon>
                    </InputGroup>
                  </Field>
                )}
              />
              {completeErrors.unit_cost && <span className="text-[10px] text-red-500">{completeErrors.unit_cost.message}</span>}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isCompleting}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isCompleting}>
              {isCompleting ? "Ejecutando..." : "Ejecutar Producción"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ExecuteProductionModal;
