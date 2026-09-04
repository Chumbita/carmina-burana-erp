import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Controller, useWatch } from "react-hook-form";
import {
  BoxesIcon,
  Pencil,
  Plus,
  Trash2,
  Save,
  Check,
  ChevronsUpDown,
  AlertCircle,
} from "lucide-react";
import { EntityDetailPage } from "@/components/shared/DetailPage/EntityDetailPage";
import { useBom } from "../hooks/useBom";
import { useBomEdit } from "../hooks/useBomEdit";
import { useNotification } from "@/components/shared/notifications/useNotification";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { DecimalInput } from "@/components/shared/DecimalInput";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/InputGroup";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/Command";
import { formatDecimal } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import { BomAuditLogHistory } from "../components/BomAuditLogHistory";

function ItemCombobox({
  value,
  onChange,
  onSelect,
  items = [],
  placeholder = "Seleccionar…",
  invalid = false,
}) {
  const [open, setOpen] = useState(false);
  const selected = items.find((i) => i.item_id === value);

  function handleSelect(item) {
    onChange(item.item_id);
    if (onSelect) onSelect(item);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          className={cn(
            "flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 text-sm",
            "focus:outline-none focus:ring-1 focus:ring-ring",
            !selected && "text-muted-foreground",
            invalid && "border-destructive",
          )}
        >
          <span className="truncate text-left">
            {selected ? selected.name : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 size-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar insumo…" />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.item_id}
                  value={`${item.name} ${item.brand} ${item.item_type} ${item.uom_symbol}`}
                  onSelect={() => handleSelect(item)}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4 shrink-0",
                      value === item.item_id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex flex-col">
                    <span className="text-sm font-medium leading-none">{item.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {item.brand} · {item.item_type} · {item.uom_symbol}
                    </span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function EditableLineRow({ index, control, items, isNew, onRemove, setValue }) {
  const componentItemId = useWatch({
    control,
    name: `lines.${index}.component_item_id`,
  });
  const quantity = useWatch({ control, name: `lines.${index}.quantity` });
  const selectedItem = items.find((i) => i.item_id === componentItemId);
  const isQtyInvalid = quantity == null || quantity === "" || quantity <= 0;

  return (
    <tr className="border-b last:border-0 hover:bg-muted/40">
      <td className="py-2 pr-3 text-xs tabular-nums text-muted-foreground w-12 text-center">
        {index + 1}
      </td>
      <td className="py-2 pr-3">
        {isNew ? (
          <Controller
            name={`lines.${index}.component_item_id`}
            control={control}
            render={({ field: itemField, fieldState }) => (
              <div className="space-y-1">
                <ItemCombobox
                  value={itemField.value}
                  onChange={(id) => itemField.onChange(id)}
                  onSelect={(item) =>
                    setValue(`lines.${index}.uom`, item.uom_id, {
                      shouldValidate: true,
                    })
                  }
                  items={items}
                  placeholder="Seleccionar insumo…"
                  invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <p className="text-xs text-destructive">{fieldState.error?.message}</p>
                )}
              </div>
            )}
          />
        ) : (
          <span className="text-sm">{selectedItem?.name ?? "Sin seleccionar"}</span>
        )}
      </td>
      <td className="py-2 pr-2 w-36">
        <Controller
          name={`lines.${index}.quantity`}
          control={control}
          render={({ field: qtyField }) => (
            <InputGroup className="h-8">
              <DecimalInput
                {...qtyField}
                data-slot="input-group-control"
                aria-invalid={isQtyInvalid ? "true" : undefined}
                className="flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 h-8 text-sm tabular-nums"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText className="text-xs">{selectedItem?.uom_symbol ?? "—"}</InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          )}
        />
      </td>
      <td className="py-2 w-9">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => onRemove(index)}
          className="text-muted-foreground hover:text-destructive"
          aria-label="Eliminar componente"
        >
          <Trash2 className="size-4" />
        </Button>
      </td>
    </tr>
  );
}

function ReadOnlyLineRow({ line, index }) {
  return (
    <tr className="border-b last:border-0 hover:bg-muted/40">
      <td className="py-2 pr-3 text-xs tabular-nums text-muted-foreground w-12 text-center">
        {index + 1}
      </td>
      <td className="py-2 pr-3 text-sm">{line.component_item_name}</td>
      <td className="py-2 pr-2 w-36 text-sm tabular-nums">
        {formatDecimal(line.quantity)}{" "}
        <span className="text-muted-foreground text-xs">{line.uom_symbol}</span>
      </td>
      <td className="py-2 w-9" />
    </tr>
  );
}

export default function BomDetailPage() {
  const { bomId } = useParams();
  const navigate = useNavigate();
  const { bom, loading, error } = useBom(bomId);
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [auditRefreshKey, setAuditRefreshKey] = useState(0);
  const notify = useNotification();

  const {
    control,
    fields,
    isDirty,
    isValid,
    error: editError,
    items,
    isLineNew,
    handleAddLine,
    handleRemoveLine,
    handleSubmit,
    handleSave,
    setValue,
    reset,
  } = useBomEdit(bom);

  async function handleSaveSubmit(data) {
    setIsSaving(true);
    const result = await handleSave(data);
    setIsSaving(false);
    if (result.success) {
      setEditMode(false);
      setAuditRefreshKey((k) => k + 1);
      notify.success("Fórmula actualizada exitosamente");
      navigate(`/produccion/bom/${result.newId}`, { replace: true });
    }
  }

  function handleCancel() {
    setEditMode(false);
    reset();
  }

  const validFromDate = bom?.valid_from
    ? new Date(bom.valid_from).toLocaleDateString("es-AR")
    : "-";

  // Contenido compartido: misma estructura en lectura y edición para transición imperceptible
  const content = (
    <div className="flex flex-col h-full gap-6">
      {editMode && editError && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{typeof editError === "string" ? editError : (editError?.message ?? "Error desconocido")}</span>
        </div>
      )}

      {/* Rendimiento base — misma jerarquía y espaciado en ambos modos */}
      <div className="pb-5 border-b">
        <p className="text-xs font-medium tracking-wide uppercase text-muted-foreground">
          Rendimiento base
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          {editMode ? (
            <Controller
              name="quantity"
              control={control}
              render={({ field, fieldState }) => (
                <div className="flex flex-col gap-1">
                  <InputGroup className={cn("w-44 h-9", fieldState.invalid && "border-destructive")}>
                    <DecimalInput
                      {...field}
                      id="quantity"
                      data-slot="input-group-control"
                      aria-invalid={fieldState.invalid ? "true" : undefined}
                      className="flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 h-9 text-2xl font-semibold tracking-tight tabular-nums"
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText className="text-sm">{bom?.bom_uom_symbol ?? ""}</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                  {fieldState.invalid && (
                    <p className="text-xs text-destructive">{fieldState.error?.message}</p>
                  )}
                </div>
              )}
            />
          ) : (
            <>
              <span className="text-2xl font-semibold tracking-tight tabular-nums">
                {formatDecimal(bom?.quantity)}
              </span>
              <span className="text-sm text-muted-foreground">{bom?.bom_uom_symbol}</span>
            </>
          )}
        </div>
      </div>

      {/* Componentes — idéntica tabla, solo cambia el contenido de las celdas y el botón de acción */}
      <div className="flex-1 flex flex-col min-h-0 gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <h3 className="text-sm font-semibold">Componentes</h3>
          </div>
          {editMode ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddLine}
              className="h-8 text-sm cursor-pointer"
            >
              <Plus className="size-4" data-icon="inline-start" />
              Agregar
            </Button>
          ) : (
            bom?.is_active === true && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditMode(true)}
                className="h-8 text-sm cursor-pointer"
              >
                <Pencil className="size-4" data-icon="inline-start" />
                Editar
              </Button>
            )
          )}
        </div>

        <div className="flex-1 overflow-auto -mx-1 px-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="pb-2 text-center text-xs font-medium w-12">Nro</th>
                <th className="pb-2 text-left text-xs font-medium">Componente</th>
                <th className="pb-2 text-left text-xs font-medium w-36">Cantidad</th>
                <th className="pb-2 w-9" />
              </tr>
            </thead>
            <tbody>
              {editMode
                ? fields.map((field, index) => (
                    <EditableLineRow
                      key={field.id}
                      index={index}
                      control={control}
                      items={items}
                      isNew={isLineNew(index)}
                      onRemove={handleRemoveLine}
                      setValue={setValue}
                    />
                  ))
                : (bom?.lines || []).map((line, index) => (
                    <ReadOnlyLineRow key={line.id || index} line={line} index={index} />
                  ))}
            </tbody>
          </table>

          {(editMode ? fields.length === 0 : !bom?.lines || bom.lines.length === 0) && (
            <div className="py-10 text-center border border-dashed rounded-md mt-3">
              <p className="text-sm text-muted-foreground">
                {editMode ? "Sin componentes" : "Sin componentes en esta fórmula"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {editMode ? "Agregá insumos para componer la receta" : bom?.is_active === true ? "Editá la receta para agregar insumos" : ""}
              </p>
            </div>
          )}
        </div>

        {/* Footer — solo en edición, con mismas métricas que el header para no romper el ritmo */}
        {editMode && (
          <div className="flex items-center justify-end border-t pt-3 mt-auto">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={handleCancel}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!isDirty || isSaving || !isValid}
                className="h-8 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Guardando…
                  </>
                ) : (
                  <>
                    <Save className="size-4" data-icon="inline-start" />
                    Guardar
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <EntityDetailPage loading={loading} error={error}>
      <EntityDetailPage.Header name={bom?.parent_item_name} />

      <EntityDetailPage.Sidebar
        icon={<BoxesIcon className="h-10 w-10 text-gray-400" />}
      >
        <EntityDetailPage.Sidebar.Row label="Versión" value={bom?.version} />
        <EntityDetailPage.Sidebar.Row
          label="Cantidad"
          value={`${formatDecimal(bom?.quantity)} ${bom?.bom_uom_symbol ?? ""}`}
        />
        <EntityDetailPage.Sidebar.Row label="Vigente desde" value={validFromDate} />
        {bom?.is_active !== true && (
          <EntityDetailPage.Sidebar.Row
            label="Vigente hasta"
            value={bom?.valid_to ? new Date(bom.valid_to).toLocaleDateString("es-AR") : "-"}
          />
        )}
        <EntityDetailPage.Sidebar.Row label="Estado" value={bom?.is_active ? "Vigente" : "Descontinuado"} />
        <EntityDetailPage.Sidebar.Row label="Insumos" value={bom?.components_count} />
      </EntityDetailPage.Sidebar>

      <EntityDetailPage.Content>
        {editMode ? (
          <form
            id="bom-edit-form"
            onSubmit={handleSubmit(handleSaveSubmit)}
            className="flex flex-col h-full"
          >
            {content}
          </form>
        ) : (
          content
        )}
      </EntityDetailPage.Content>

      {bom?.parent_item_id && (
        <section className="lg:col-span-2 p-4">
          <h2 className="text-sm font-semibold mb-3">Historial</h2>
          <BomAuditLogHistory parentItemId={bom.parent_item_id} refreshKey={auditRefreshKey} />
        </section>
      )}
    </EntityDetailPage>
  );
}
