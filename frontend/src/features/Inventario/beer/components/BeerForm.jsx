import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError,
} from "@/components/ui/Field";

const initialState = {
  name: "",
  min_stock_level: 0,
  style: "",
  abv: 100,
  ibu: 0,
  fermentation_days: 1,
  conditioning_days: 1,
};

export function BeerForm({ onSubmit, onCancel, isSubmitting = false }) {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const canSubmit = useMemo(() => {
    return (
      formData.name?.trim() &&
      formData.style &&
      Number(formData.abv) >= 0 &&
      Number(formData.ibu) >= 0 &&
      Number(formData.fermentation_days) > 0 &&
      Number(formData.conditioning_days) > 0
    );
  }, [formData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!formData.name?.trim()) nextErrors.name = "El nombre es obligatorio";
    if (!formData.style) nextErrors.style = "El estilo es obligatorio";
    if (Number(formData.abv) < 0 || Number(formData.abv) > 100)
      nextErrors.abv = "El ABV debe estar entre 0 y 100";
    if (Number(formData.ibu) < 0)
      nextErrors.ibu = "El IBU no puede ser negativo";
    if (Number(formData.fermentation_days) <= 0)
      nextErrors.fermentation_days = "Debe ser mayor a 0";
    if (Number(formData.conditioning_days) <= 0)
      nextErrors.conditioning_days = "Debe ser mayor a 0";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldGroup className="-space-y-4">
        <Field data-invalid={Boolean(errors.name)}>
          <FieldLabel htmlFor="name">
            Nombre <span className="text-red-500 -ml-1">*</span>
          </FieldLabel>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <FieldError errors={[{ message: errors.name }]} />}
        </Field>

        <Field>
          <FieldLabel htmlFor="style">
            Estilo <span className="text-red-500 -ml-1">*</span>
          </FieldLabel>
          <Select
            value={formData.style}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, style: value }))
            }
          >
            <SelectTrigger id="style" data-invalid={Boolean(errors.style)}>
              <SelectValue placeholder="Seleccionar estilo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Lager">Lager</SelectItem>
              <SelectItem value="Ales">Ales</SelectItem>
            </SelectContent>
          </Select>
          {errors.style && <FieldError errors={[{ message: errors.style }]} />}
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={Boolean(errors.abv)}>
            <FieldLabel htmlFor="abv">
              ABV <span className="text-red-500 -ml-1">*</span>
            </FieldLabel>
            <Input
              id="abv"
              name="abv"
              type="number"
              min="0"
              max="100"
              value={formData.abv}
              onChange={handleChange}
            />
            {errors.abv && <FieldError errors={[{ message: errors.abv }]} />}
          </Field>

          <Field data-invalid={Boolean(errors.ibu)}>
            <FieldLabel htmlFor="ibu">
              IBU <span className="text-red-500 -ml-1">*</span>
            </FieldLabel>
            <Input
              id="ibu"
              name="ibu"
              type="number"
              min="0"
              value={formData.ibu}
              onChange={handleChange}
            />
            {errors.ibu && <FieldError errors={[{ message: errors.ibu }]} />}
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field data-invalid={Boolean(errors.fermentation_days)}>
            <FieldLabel htmlFor="fermentation_days">
              Dias de fermentación <span className="text-red-500 -ml-1">*</span>
            </FieldLabel>
            <Input
              id="fermentation_days"
              name="fermentation_days"
              type="number"
              min="1"
              value={formData.fermentation_days}
              onChange={handleChange}
            />
            {errors.fermentation_days && (
              <FieldError errors={[{ message: errors.fermentation_days }]} />
            )}
          </Field>

          <Field data-invalid={Boolean(errors.conditioning_days)}>
            <FieldLabel htmlFor="conditioning_days">
              Dias de acondicionamiento{" "}
              <span className="text-red-500 -ml-1">*</span>
            </FieldLabel>
            <Input
              id="conditioning_days"
              name="conditioning_days"
              type="number"
              min="1"
              value={formData.conditioning_days}
              onChange={handleChange}
            />
            {errors.conditioning_days && (
              <FieldError errors={[{ message: errors.conditioning_days }]} />
            )}
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="min_stock_level">Stock mínimo</FieldLabel>
          <Input
            id="min_stock_level"
            name="min_stock_level"
            type="number"
            min="0"
            value={formData.min_stock_level}
            onChange={handleChange}
          />
        </Field>
      </FieldGroup>

      <div className="flex justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          Los campos con * son obligatorios
        </div>
        <div className="flex gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="cursor-pointer"
          >
            {isSubmitting ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>
    </form>
  );
}
