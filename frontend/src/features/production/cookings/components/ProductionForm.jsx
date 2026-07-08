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
}) {
  const schema = createProductionSchema();

  const { handleSubmit, control, setValue } = useForm({
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
  const isItemSelected = selectedItemId !== undefined && selectedItemId !== null;

  const hasValidRecipe = isItemSelected && !bomLoading && selectedBom !== null && selectedBom?.id !== undefined;

  const selectedBomLines = useMemo(() => {
    return selectedBom?.lines || [];
  }, [selectedBom]);

  const handleItemChange = (val, onChange) => {
    const itemId = val === "placeholder" ? undefined : Number(val);
    onChange(itemId);
    
    if (!itemId) {
      setValue("bom_id", undefined, { shouldValidate: true });
    }
  };

  useMemo(() => {
    if (selectedBom?.id) {
      setValue("bom_id", Number(selectedBom.id), { shouldValidate: true });
    } else {
      setValue("bom_id", undefined, { shouldValidate: true });
    }
  }, [selectedBom, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-neutral-800">
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
                    <label className="text-xs font-medium text-neutral-600">¿Qué se produce?</label>
                    <Select
                      value={field.value !== undefined ? String(field.value) : "placeholder"}
                      onValueChange={(val) => handleItemChange(val, field.onChange)}
                      disabled={optionsLoading}
                    >
                      <SelectTrigger className="h-9 text-xs px-3">
                        <SelectValue placeholder="Seleccionar producto..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="placeholder" className="text-neutral-400 italic">
                          Seleccionar producto...
                        </SelectItem>
                        <SelectGroup>
                          <SelectLabel>Cervezas</SelectLabel>
                          {beerOptions.map((item) => (
                            <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Productos</SelectLabel>
                          {productOptions.map((item) => (
                            <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />

              <Controller
                name="bom_id"
                control={control}
                render={({ field }) => (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-neutral-600">Receta / BOM</label>
                    <Select value={field.value !== undefined ? String(field.value) : "placeholder"} disabled={true}>
                      <SelectTrigger className="h-9 text-xs px-3 bg-neutral-50 border-neutral-200 text-neutral-500 cursor-not-allowed">
                        <SelectValue>
                          {bomLoading 
                            ? "Cargando receta..." 
                            : selectedBom 
                              ? `Receta v${selectedBom.version || 1} (#${selectedBom.id})` 
                              : isItemSelected 
                                ? "⚠️ Este producto no tiene receta" 
                                : "Automática por producto"
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="placeholder" className="text-neutral-400 italic">
                          Automática por producto
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              />
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
                      <label className="text-xs font-medium text-neutral-600">Cant. a producir</label>
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
                      <label className="text-xs font-medium text-neutral-600">Fecha programada</label>
                      <Input 
                        {...field} 
                        type="date" 
                        className="h-9 text-xs px-3" 
                        disabled={!hasValidRecipe} // Bloqueado si no hay receta válida
                      />
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
                    <label className="text-xs font-medium text-neutral-600">Notas de planta</label>
                    <Textarea 
                      {...field} 
                      className="min-h-[50px] text-xs py-1.5 px-3 leading-normal resize-none" 
                      placeholder="Instrucciones para los operarios..." 
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
                No se pueden cargar insumos porque el producto no cuenta con una receta registrada.
              </div>
            ) : selectedBomLines.length === 0 ? (
              <div className="p-4 text-xs text-center text-neutral-400">Esta receta no contiene insumos.</div>
            ) : (
              <Table>
                <TableHeader className="bg-neutral-50 sticky top-0 z-10">
                  <TableRow className="hover:bg-transparent border-b border-neutral-200">
                    <TableHead className="h-6 text-[10px] uppercase font-bold p-1 text-neutral-500">Insumo</TableHead>
                    <TableHead className="h-6 text-[10px] uppercase font-bold text-right p-1 text-neutral-500">Cant.</TableHead>
                    <TableHead className="h-6 text-[10px] uppercase font-bold text-right p-1 text-neutral-500">UOM</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedBomLines.map((line) => (
                    <TableRow key={line.id} className="border-b border-neutral-100 hover:bg-neutral-50/80">
                      <TableCell className="p-1 py-1.5 text-xs truncate max-w-[80px]">#{line.component_item_id}</TableCell>
                      <TableCell className="p-1 py-1.5 text-xs text-right font-medium">{formatDecimal(line.quantity)}</TableCell>
                      <TableCell className="p-1 py-1.5 text-xs text-right text-neutral-400">{line.uom ?? "-"}</TableCell>
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
          <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={isSubmitting} className="h-8 text-xs px-3.5">
            {cancelLabel}
          </Button>
        )}
        {/* El botón de crear se bloquea por completo si no hay una receta válida cargada */}
        <Button size="sm" type="submit" disabled={isSubmitting || !hasValidRecipe} className="h-8 text-xs px-3.5">
          {isSubmitting ? "Creando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default ProductionForm;