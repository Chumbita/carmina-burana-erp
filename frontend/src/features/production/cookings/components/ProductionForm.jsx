import { useMemo } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductionSchema } from "../schemas/production.schema";

import { Badge } from "@/components/ui/Badge";
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
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import {
  FieldError,
  Field,
  FieldLabel,
} from "@/components/ui/Field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

const itemTypeLabel = {
  beer: "Cerveza",
  product: "Producto",
};

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
  layout = "modal",
  // --- NUEVAS PROPS NECESARIAS PARA QUE EL COMPONENTE FUNCIONE ---
  beerOptions = [],
  productOptions = [],
  optionsLoading = false,
  optionsError = false,
}) {
  const schema = createProductionSchema();

  const {
    handleSubmit,
    control,
    setValue,
  } = useForm({
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

  const isModal = layout === "modal";
  
  // Escuchamos los cambios en los selectores usando useWatch
  const selectedItemId = useWatch({ control, name: "item_id" });
  const selectedBomId = useWatch({ control, name: "bom_id" });

  // Buscamos el item seleccionado dentro de las opciones disponibles
  const selectedOption = useMemo(() => {
    if (!selectedItemId) return null;
    return (
      beerOptions.find((b) => String(b.id) === String(selectedItemId)) ||
      productOptions.find((p) => String(p.id) === String(selectedItemId)) ||
      null
    );
  }, [selectedItemId, beerOptions, productOptions]);

  // Las recetas dependen del item que esté seleccionado
  const recipeOptions = useMemo(() => {
    return selectedOption?.boms || []; 
  }, [selectedOption]);

  // Las líneas de insumos dependen de la receta (bom) seleccionada
  const selectedBomLines = useMemo(() => {
    if (!selectedBomId || !recipeOptions.length) return [];
    const currentBom = recipeOptions.find((bom) => String(bom.id) === String(selectedBomId));
    return currentBom?.lines || [];
  }, [selectedBomId, recipeOptions]);

  // Corregida la función que se había cortado en tu código
  const handleItemChange = (val, onChange) => {
    const itemId = val === "0" ? undefined : Number(val);
    onChange(itemId);

    // Buscamos si el nuevo ítem tiene una receta por defecto
    const targetItem =
      beerOptions.find((b) => b.id === itemId) ||
      productOptions.find((p) => p.id === itemId);

    // Si tiene receta, la seteamos de forma automática
    const defaultBomId = targetItem?.bom?.id || targetItem?.boms?.[0]?.id;

    setValue("bom_id", defaultBomId ? Number(defaultBomId) : undefined, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Datos principales (izquierda) */}
        <Card className="md:col-span-2 shadow-sm border-neutral-200">
          <CardHeader>
            <CardTitle>Datos principales</CardTitle>
            <CardDescription>
              Elegí el producto final y su receta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Controller
                name="item_id"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      ¿Qué se produce?
                    </FieldLabel>
                    <Select
                      value={
                        field.value !== undefined ? String(field.value) : "0"
                      }
                      onValueChange={(val) =>
                        handleItemChange(val, field.onChange)
                      }
                      disabled={optionsLoading}
                    >
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue
                          placeholder={
                            optionsLoading
                              ? "Cargando opciones..."
                              : "Selecciona un producto o cerveza..."
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Cervezas</SelectLabel>
                          <SelectItem value="0">-- Seleccionar --</SelectItem>
                          {beerOptions.length === 0 ? (
                            <SelectItem value="no-beers" disabled>
                              Sin cervezas disponibles
                            </SelectItem>
                          ) : (
                            beerOptions.map((item) => (
                              <SelectItem key={item.id} value={String(item.id)}>
                                {item.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel>Productos</SelectLabel>
                          {productOptions.length === 0 ? (
                            <SelectItem value="no-products" disabled>
                              Sin productos disponibles
                            </SelectItem>
                          ) : (
                            productOptions.map((item) => (
                              <SelectItem key={item.id} value={String(item.id)}>
                                {item.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {optionsError && (
                      <p className="text-sm text-destructive">
                        No se pudieron cargar las opciones de producción.
                      </p>
                    )}
                    {selectedOption && (
                      <div className="mt-2">
                        <Badge variant="outline">
                          {itemTypeLabel[selectedOption.type] ?? "Item"}
                        </Badge>
                      </div>
                    )}
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="bom_id"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Receta / Lista de materiales
                    </FieldLabel>
                    <Select
                      value={
                        field.value !== undefined ? String(field.value) : "0"
                      }
                      onValueChange={(val) =>
                        field.onChange(val === "0" ? undefined : Number(val))
                      }
                      disabled={!selectedOption}
                    >
                      <SelectTrigger
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder="Elegí primero un ítem" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Recetas</SelectLabel>
                          {recipeOptions.length === 0 ? (
                            <SelectItem value="0" disabled>
                              Sin receta seleccionada
                            </SelectItem>
                          ) : (
                            recipeOptions.map((bom) => (
                              <SelectItem key={bom.id} value={String(bom.id)}>
                                Receta #{bom.id} - versión {bom.version}
                              </SelectItem>
                            ))
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Insumos (derecha) */}
        <Card className="shadow-sm border-neutral-200">
          <CardHeader>
            <CardTitle>Lista de insumos</CardTitle>
            <CardDescription>
              Líneas de la receta seleccionada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {optionsLoading ? (
              <div className="rounded border-dashed border-2 border-neutral-200 p-6 text-center text-muted-foreground">
                Cargando insumos...
              </div>
            ) : !selectedOption || !selectedBomId ? (
              <div className="rounded border-dashed border-2 border-neutral-200 p-6 text-center text-muted-foreground">
                Sin receta seleccionada.
              </div>
            ) : selectedBomLines.length === 0 ? (
              <div className="rounded border-dashed border-2 border-neutral-200 p-6 text-center text-muted-foreground">
                La receta no tiene insumos cargados.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Línea</TableHead>
                    <TableHead>Insumo</TableHead>
                    <TableHead>Cant.</TableHead>
                    <TableHead>UOM</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedBomLines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>#{line.id}</TableCell>
                      <TableCell>#{line.component_item_id}</TableCell>
                      <TableCell>{formatDecimal(line.quantity)}</TableCell>
                      <TableCell>{line.uom ? `#${line.uom}` : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Planificación */}
      <Card className="shadow-sm border-neutral-200">
        <CardHeader>
          <CardTitle>Planificación</CardTitle>
          <CardDescription>
            Cantidad, fecha y notas para la planta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Controller
                name="planned_quantity"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Cantidad a producir
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="number"
                      aria-invalid={fieldState.invalid}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : Number(e.target.value),
                        )
                      }
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div>
              <Controller
                name="schedule_date"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Fecha programada
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="date"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <div className="md:col-span-2">
              <Controller
                name="description"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Notas / descripción
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id={field.name}
                      placeholder="Instrucciones para los operarios, observaciones, etc."
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
          </div>

          <div className="flex justify-end mt-4 gap-2">
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
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              {isSubmitting ? "Creando..." : submitLabel}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

export default ProductionForm;