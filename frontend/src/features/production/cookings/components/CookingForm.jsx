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
  recipe: "",
  batch: "",
  status: "Programada",
  date: new Date().toISOString().slice(0, 10),
};

export function CookingForm({ onSubmit, onCancel, isSubmitting = false }) {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  const canSubmit = useMemo(() => {
    return (
      formData.name.trim() && formData.recipe.trim() && formData.batch.trim()
    );
  }, [formData]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!formData.name.trim()) nextErrors.name = "El nombre es obligatorio";
    if (!formData.recipe.trim()) nextErrors.recipe = "La receta es obligatoria";
    if (!formData.batch.trim()) nextErrors.batch = "El lote es obligatorio";

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldGroup className="space-y-4">
        <Field>
          <FieldLabel htmlFor="name">Nombre de la cocción</FieldLabel>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <FieldError errors={[{ message: errors.name }]} />}
        </Field>

        <Field>
          <FieldLabel htmlFor="recipe">Receta</FieldLabel>
          <Input
            id="recipe"
            name="recipe"
            value={formData.recipe}
            onChange={handleChange}
          />
          {errors.recipe && (
            <FieldError errors={[{ message: errors.recipe }]} />
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor="batch">Lote</FieldLabel>
          <Input
            id="batch"
            name="batch"
            value={formData.batch}
            onChange={handleChange}
          />
          {errors.batch && <FieldError errors={[{ message: errors.batch }]} />}
        </Field>

        <Field>
          <FieldLabel htmlFor="date">Fecha</FieldLabel>
          <Input
            id="date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="status">Estado</FieldLabel>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Seleccione estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Programada">Programada</SelectItem>
              <SelectItem value="En proceso">En proceso</SelectItem>
              <SelectItem value="Finalizada">Finalizada</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </FieldGroup>

      <div className="flex justify-end gap-2">
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
    </form>
  );
}
