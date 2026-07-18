import { useMemo } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductionSchema } from "../schemas/production.schema";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@/components/ui/Select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

function formatDecimal(value) {
  if (value === null || value === undefined || value === "") return "-";
  return Number(value).toLocaleString("es-AR", {
    maximumFractionDigits: 6,
  });
}

export function ProductionForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Crear",
  cancelLabel = "Cancelar",
  isSubmitting = false,
  beerOptions = [],
  productOptions = [],
  optionsLoading = false,
  selectedBom = null,
  bomLoading = false,
  onItemChange,
}) {
  const schema = createProductionSchema();

  const { handleSubmit, control, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      item_id: defaultValues?.item_id ?? undefined,
      bom_id: defaultValues?.bom_id ?? undefined,
      planned_quantity: defaultValues?.planned_quantity ?? 0,
      schedule_date: defaultValues?.schedule_date ?? "",
      description: defaultValues?.description ?? "",
    },
    mode: "onChange",
  });

  const selectedItemId = useWatch({ control, name: "item_id" });
  const isItemSelected =
    selectedItemId !== undefined && selectedItemId !== null;

  const plannedQuantity = useWatch({ control, name: "planned_quantity" }) || 0;
  const selectedBomLines = useMemo(() => {
    const lines = selectedBom?.lines || [];
    const bomBaseQuantity = Number(selectedBom?.quantity || 1);

    if (bomBaseQuantity <= 0) return lines;
    const scale = Number(plannedQuantity) / bomBaseQuantity;
    return lines.map(line => ({
      ...line,
      quantity: Number(line.quantity || 0) * scale
    }));
  }, [selectedBom, plannedQuantity]);

  const hasValidRecipe =
    isItemSelected &&
    !bomLoading &&
    selectedBom !== null &&
    (selectedBom?.version !== undefined || selectedBom?.lines !== undefined);

  const handleItemChange = (val, onChange) => {
    const itemId = val === "placeholder" ? undefined : Number(val);
    onChange(itemId);

    if (onItemChange) {
      onItemChange(itemId);
    }

    if (!itemId) {
      setValue("bom_id", undefined, { shouldValidate: true });
    }
  };

  useMemo(() => {
    if (selectedBom?.id) {
      setValue("bom_id", Number(selectedBom.id), { shouldValidate: true });
      setValue("planned_quantity", Number(selectedBom.quantity || 0), {
        shouldValidate: true,
      });
    } else {
      setValue("bom_id", undefined, { shouldValidate: true });
      setValue("planned_quantity", 0, { shouldValidate: true });
    }
  }, [selectedBom, setValue]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 text-neutral-800"
    >
      {/* Grid Principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
        {/* COLUMNA IZQUIERDA: Formulario de Entrada */}
        <div className="md:col-span-2 space-y-4 flex flex-col justify-between">
          {/* Bloque 1: Datos principales */}
          <div className="space-y-3 border border-neutral-200 rounded-lg p-3.5 bg-white shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Datos principales
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Controller
                name="item_id"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-neutral-600">
                      ¿Qué se produce?
                    </label>
                    <Select
                      value={
                        field.value !== undefined
                          ? String(field.value)
                          : "placeholder"
                      }
                      onValueChange={(val) =>
                        handleItemChange(val, field.onChange)
                      }
                      disabled={optionsLoading}
                    >
                      <SelectTrigger className="h-9 text-xs px-3">
                        <SelectValue placeholder="Seleccionar producto..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem
                          value="placeholder"
                          className="text-neutral-400 italic"
                        >
                          Seleccionar producto...
                        </SelectItem>
                        <SelectGroup>
                          <SelectLabel>Cervezas</SelectLabel>
                          {beerOptions.map((item) => (
                            <SelectItem key={item.id} value={String(item.id)}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Productos</SelectLabel>
                          {productOptions.map((item) => (
                            <SelectItem key={item.id} value={String(item.id)}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-neutral-600">
                  Receta
                </label>

                {bomLoading ? (
                  <div className="h-9 flex items-center px-3 text-xs bg-neutral-50 border border-neutral-200 rounded-md text-neutral-400 italic animate-pulse">
                    Cargando receta...
                  </div>
                ) : selectedBom ? (
                  <div className="h-9 flex items-center justify-between px-3 text-xs bg-emerald-50/60 border border-emerald-200 rounded-md text-emerald-800 font-medium">
                    <span>Versión {selectedBom.version || 1}</span>
                    <span className="text-neutral-500 font-normal bg-white px-2 py-0.5 rounded border border-neutral-200/60 shadow-sm text-[11px]">
                      Base: {formatDecimal(selectedBom.quantity)}{" "}
                      {selectedBom.uom || ""}
                    </span>
                  </div>
                ) : isItemSelected ? (
                  <div className="h-9 flex items-center px-3 text-xs bg-red-50 border border-red-200 rounded-md text-red-600 font-medium">
                    ⚠️ Este producto no tiene receta activa
                  </div>
                ) : (
                  <div className="h-9 flex items-center px-3 text-xs bg-neutral-50 border border-neutral-200/80 rounded-md text-neutral-400 italic">
                    Automática por producto
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bloque 2: Planificación */}
          <div className="space-y-3 border border-neutral-200 rounded-lg p-3.5 bg-white shadow-sm flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Planificación
              </h3>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <Controller
                  name="planned_quantity"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-neutral-600">
                        Cant. a producir
                      </label>
                      <Input
                        {...field}
                        type="number"
                        className="h-9 text-xs px-3"
                        disabled={!hasValidRecipe} // Bloqueado si no hay receta válida
                      />
                    </div>
                  )}
                />
               <Controller
                  name="schedule_date"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-neutral-600">
                        Fecha programada
                      </label>
                      <Input
                        {...field}
                        type="date"
                        // Agrega borde rojo si falla la validación
                        className={`h-9 text-xs px-3 ${
                          errors.schedule_date ? "border-red-500 focus-visible:ring-red-500" : ""
                        }`}
                        disabled={!hasValidRecipe}
                      />
                      
                      {errors.schedule_date && (
                        <p className="text-[10px] text-red-500 font-medium mt-0.5 animate-fadeIn">
                          {errors.schedule_date.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>

            <div className="mt-2">
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-neutral-600">
                      Notas de producción
                    </label>
                    <Textarea
                      {...field}
                      className="min-h-[50px] text-xs py-1.5 px-3 leading-normal resize-none" 
                      disabled={!hasValidRecipe} // Bloqueado si no hay receta válida
                    />
                  </div>
                )}
              />
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: Lista de Insumos */}
        <div className="border border-neutral-200 rounded-lg p-3.5 bg-white shadow-sm flex flex-col h-full overflow-hidden">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
            Lista de insumos
          </h3>
          <div className="flex-1 overflow-y-auto pr-0.5">
            {bomLoading ? (
              <div className="h-full min-h-[160px] flex items-center justify-center text-xs text-neutral-400 border border-dashed border-neutral-200 rounded-md bg-neutral-50/50">
                Buscando insumos de la receta...
              </div>
            ) : !isItemSelected ? (
              <div className="h-full min-h-[160px] flex items-center justify-center text-xs text-neutral-400 border border-dashed border-neutral-200 rounded-md bg-neutral-50/50">
                Esperando producto...
              </div>
            ) : !selectedBom ? (
              <div className="h-full min-h-[160px] flex items-center justify-center text-xs text-red-500 font-medium border border-dashed border-red-200 rounded-md bg-red-50/30 p-4 text-center">
                No se pueden cargar insumos porque el producto no cuenta con una
                receta registrada.
              </div>
            ) : selectedBomLines.length === 0 ? (
              <div className="p-4 text-xs text-center text-neutral-400">
                Esta receta no contiene insumos.
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-neutral-50 sticky top-0 z-10">
                  <TableRow className="hover:bg-transparent border-b border-neutral-200">
                    <TableHead className="h-6 text-[10px] uppercase font-bold p-1 text-neutral-500">
                      Insumo
                    </TableHead>
                    <TableHead className="h-6 text-[10px] uppercase font-bold text-right p-1 text-neutral-500">
                      Cant.
                    </TableHead>
                    <TableHead className="h-6 text-[10px] uppercase font-bold text-right p-1 text-neutral-500">
                      Unidad
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedBomLines.map((line, index) => (
                    // Usamos el index o line.id como key segura
                    <TableRow
                      key={line.id || index}
                      className="border-b border-neutral-100 hover:bg-neutral-50/80"
                    >
                      {/* Mostramos el 'name' que viene del backend, o el ID si no existiera */}
                      <TableCell className="p-1 py-1.5 text-xs truncate max-w-[120px] font-medium">
                        {line.name || `#${line.component_item_id}`}
                      </TableCell>
                      <TableCell className="p-1 py-1.5 text-xs text-right font-medium">
                        {formatDecimal(line.quantity)}
                      </TableCell>
                      <TableCell className="p-1 py-1.5 text-xs text-right text-neutral-400">
                        {line.uom ?? "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {/* Footer del Formulario */}
      <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
        {onCancel && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-8 text-xs px-3.5"
          >
            {cancelLabel}
          </Button>
        )}
        {/* El botón de crear se bloquea por completo si no hay una receta válida cargada */}
        <Button
          size="sm"
          type="submit"
          disabled={isSubmitting || !hasValidRecipe}
          className="h-8 text-xs px-3.5"
        >
          {isSubmitting ? "Creando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default ProductionForm;
