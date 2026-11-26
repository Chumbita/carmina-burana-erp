import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { createPackagingSupplySchema } from "../schemas/supply.schema"
import { useBrands } from "../hooks/useBrands"
import { useUoms } from "../hooks/useUoms"

import { Button } from "@/components/ui/Button"
import { Save } from "lucide-react"

import { PackagingSupplyFormFields } from "./PackagingSupplyFormFields"
import { BrandQuickCreateDialog } from "./BrandQuickCreateDialog"

/**
 * Contenedor del formulario de envase.
 * Dueño del estado de react-hook-form; la presentación vive en PackagingSupplyFormFields.
 */
export function PackagingSupplyForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Guardar",
  cancelLabel = "Cancelar",
  isSubmitting = false,
  showDeleteButton = false,
  onDelete,
  layout = "modal",
  formRef,
  existingSupplies = [],
  excludeId = null,
}) {
  const { brands, loading: brandsLoading, addBrand } = useBrands()
  const { uoms, loading: uomsLoading } = useUoms()
  const [brandDialogOpen, setBrandDialogOpen] = useState(false)

  const schema = createPackagingSupplySchema(existingSupplies, excludeId)

  const {
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { isDirty, isValid },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      brand_id: defaultValues?.brand_id ?? undefined,
      base_uom_id: defaultValues?.base_uom_id ?? undefined,
      min_stock_level:
        defaultValues?.min_stock_level != null ? Number(defaultValues.min_stock_level) : 1,
      packaging_type: defaultValues?.packaging_type ?? "",
      material: defaultValues?.material ?? "",
      capacity_ml:
        defaultValues?.capacity_ml != null ? Number(defaultValues.capacity_ml) : undefined,
    },
    mode: "onChange",
  })

  useEffect(() => {
    if (!formRef) return

    formRef.current = {
      submit: () => handleSubmit(onSubmit)(),
      reset,
      isDirty,
    }
  }, [formRef, handleSubmit, isDirty, onSubmit, reset])

  const isModal = layout === "modal"

  function handleBrandCreated(brand) {
    addBrand(brand)
    setValue("brand_id", brand.id, { shouldDirty: true, shouldValidate: true })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={isModal ? "space-y-4" : "grid grid-cols-1 md:grid-cols-4 gap-4"}
    >
      <PackagingSupplyFormFields
        control={control}
        isModal={isModal}
        brands={brands}
        brandsLoading={brandsLoading}
        uoms={uoms}
        uomsLoading={uomsLoading}
        onRequestCreateBrand={() => setBrandDialogOpen(true)}
      />

      <div
        className={isModal ? "flex justify-end gap-2" : "md:col-span-4 flex justify-end mt-4 gap-2"}
      >
        {showDeleteButton && (
          <Button
            type="button"
            size="sm"
            onClick={onDelete}
            className="bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer"
          >
            Eliminar
          </Button>
        )}

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
          disabled={isModal ? isSubmitting || !isValid : !isDirty || !isValid || isSubmitting}
          className="cursor-pointer"
        >
          {isSubmitting ? (
            "Guardando..."
          ) : (
            <>
              <Save data-icon="inline-start" />
              {submitLabel}
            </>
          )}
        </Button>
      </div>

      <BrandQuickCreateDialog
        open={brandDialogOpen}
        onOpenChange={setBrandDialogOpen}
        onCreated={handleBrandCreated}
      />
    </form>
  )
}
