import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBeerSchema } from "../schemas/beer.schema";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Save } from 'lucide-react';
import { Input } from "@/components/ui/Input";
import { DecimalInput } from "@/components/shared/DecimalInput";
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

export function BeerForm({ onSubmit, onCancel, isSubmitting = false }) {
  const schema = createBeerSchema();

  const {
    handleSubmit,
    control,
    formState: { isValid },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      min_stock_level: 1,
      style: "",
      abv: "",
      ibu: "",
      fermentation_days: 1,
      conditioning_days: 1,
    },
    mode: "onChange",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FieldGroup className="-space-y-4">
        {/* Nombre */}
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Nombre <span className="text-red-500 -ml-1">*</span>
              </FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
              />
            </Field>
          )}
        />

        {/* Estilo */}
        <Controller
          name="style"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Estilo <span className="text-red-500 -ml-1">*</span>
              </FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Seleccionar estilo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lager">Lager</SelectItem>
                  <SelectItem value="Ales">Ales</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* ABV */}
          <Controller
            name="abv"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  ABV <span className="text-red-500 -ml-1">*</span>
                </FieldLabel>
                <DecimalInput
                  id={field.name}
                  placeholder="Ej: 5.5"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
              </Field>
            )}
          />

          {/* IBU */}
          <Controller
            name="ibu"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  IBU <span className="text-red-500 -ml-1">*</span>
                </FieldLabel>
                <DecimalInput
                  id={field.name}
                  placeholder="Ej: 20"
                  aria-invalid={fieldState.invalid}
                  {...field}
                />
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Fermentación */}
          <Controller
            name="fermentation_days"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Dias de fermentación <span className="text-red-500 -ml-1">*</span>
                </FieldLabel>
                <Input
                  id={field.name}
                  type="number"
                  min="1"
                  step="1"
                  aria-invalid={fieldState.invalid}
                  value={Number.isNaN(field.value) ? "" : field.value}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </Field>
            )}
          />

          {/* Acondicionamiento */}
          <Controller
            name="conditioning_days"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Dias de acondicionamiento{" "}
                  <span className="text-red-500 -ml-1">*</span>
                </FieldLabel>
                <Input
                  id={field.name}
                  type="number"
                  min="1"
                  step="1"
                  aria-invalid={fieldState.invalid}
                  value={Number.isNaN(field.value) ? "" : field.value}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </Field>
            )}
          />
        </div>

        {/* Stock mínimo */}
        <Controller
          name="min_stock_level"
          control={control}
          render={({ field }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Stock mínimo</FieldLabel>
              <Input
                id={field.name}
                type="number"
                min="0"
                step="1"
                value={Number.isNaN(field.value) ? "" : field.value}
                onChange={(e) => field.onChange(e.target.valueAsNumber)}
              />
            </Field>
          )}
        />
      </FieldGroup>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          size="sm"
          disabled={isSubmitting || !isValid}
          className="cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Spinner data-icon="inline-start" />
              Guardando…
            </>
          ) : (
            <>
              <Save data-icon="inline-start" />
              Guardar
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
