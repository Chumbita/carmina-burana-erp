import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import {
  Field,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/Field'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'

import { Plus, Trash2, Package, User } from 'lucide-react'

/**
 * SupplyEntryForm - Component for supply entry registration form
 * @param {Object} props - Component props
 * @param {Object} props.formHook - Form hook from useSupplyEntryForm
 * @param {Array} props.availableInputs - List of available inputs
 * @param {Function} props.onViewHistory - Callback to view history
 * @param {string} props.layout - Layout mode: 'page' or 'modal'
 * @param {Function} props.onCancel - Callback for cancel (modal mode)
 * @param {boolean} props.isSubmitting - Loading state for modal
 */
export function SupplyEntryForm({ 
  formHook, 
  availableInputs, 
  onViewHistory, 
  layout = 'page',
  onCancel,
  isSubmitting = false 
}) {
  const {
    control,
    fields,
    watchedItems,
    totalCost,
    loading,
    error,
    success,
    receptionId,
    isDirty,
    isValid,
    handleAddItem,
    handleRemoveItem,
    handleFormSubmit,
    handleReset,
    handleSubmit,
  } = formHook

  // Use external loading state for modal mode
  const currentLoading = layout === 'modal' ? isSubmitting : loading

  // Success state handling
  if (success && receptionId && layout === 'page') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card className="border-green-200 bg-green-50">
          <div className="p-8 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-green-900 mb-2">
              ¡Abastecimiento Registrado!
            </h2>
            <p className="text-green-700 mb-4">
              ID de Recepción: <span className="font-mono font-semibold">{receptionId}</span>
            </p>
            <p className="text-green-600 text-sm">
              Los lotes se han creado automáticamente y el stock ha sido actualizado.
            </p>
          </div>
        </Card>
      </div>
    )
  }

  const containerClass = layout === 'modal' 
    ? "space-y-6" 
    : "max-w-4xl mx-auto p-6 space-y-6"

  return (
    <div className={containerClass}>
      {/* Header - only show in page layout */}
      {layout === 'page' && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Registro de Abastecimiento
            </h1>
            <p className="text-neutral-600 mt-1">
              Registre múltiples insumos en una sola recepción
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onViewHistory}
              className="cursor-pointer"
            >
              Ver Historial
            </Button>
            <Badge variant="outline" className="text-sm">
              <Package className="w-4 h-4 mr-1" />
              Supply Entry
            </Badge>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <div className="p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </Card>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Supply Information */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Información del Abastecimiento
            </h3>
            
            <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="supplier">
                  Proveedor <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  placeholder="Nombre del proveedor"
                  {...control.register('supplier')}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="entryDate">
                  Fecha de Ingreso <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  type="date"
                  {...control.register('entryDate')}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="invoiceNumber">Número de Factura</FieldLabel>
                <Input
                  placeholder="Opcional"
                  {...control.register('invoiceNumber')}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Descripción</FieldLabel>
                <Input
                  placeholder="Descripción general del abastecimiento"
                  {...control.register('description')}
                />
              </Field>
            </FieldGroup>
          </div>
        </Card>

        {/* Items Section */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Artículos del Abastecimiento
              </h3>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddItem}
                className="cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar Artículo
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <Card key={field.id} className="border-neutral-200">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-neutral-900">
                        Artículo #{index + 1}
                      </h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <FieldGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="lg:col-span-1">
                        <Field>
                          <FieldLabel htmlFor={`items.${index}.inputId`}>
                            Insumo <span className="text-red-500">*</span>
                          </FieldLabel>
                          <Select
                            value={watchedItems[index]?.inputId}
                            onValueChange={(value) => control.setValue(`items.${index}.inputId`, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione insumo..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Insumos Disponibles</SelectLabel>
                                {availableInputs.map((input) => (
                                  <SelectItem key={input.id} value={input.id}>
                                    {input.name} ({input.unit})
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>

                      <Field>
                        <FieldLabel htmlFor={`items.${index}.quantity`}>
                          Cantidad <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          {...control.register(`items.${index}.quantity`, { valueAsNumber: true })}
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor={`items.${index}.unitCost`}>
                          Costo Unitario <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...control.register(`items.${index}.unitCost`, { valueAsNumber: true })}
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor={`items.${index}.expirationDate`}>
                          Fecha Vencimiento
                        </FieldLabel>
                        <Input
                          type="date"
                          {...control.register(`items.${index}.expirationDate`)}
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor={`items.${index}.batchNumber`}>
                          Número de Lote
                        </FieldLabel>
                        <Input
                          placeholder="Opcional"
                          {...control.register(`items.${index}.batchNumber`)}
                        />
                      </Field>

                      <div className="lg:col-span-1">
                        <Field>
                          <FieldLabel htmlFor={`items.${index}.comment`}>
                            Comentario
                          </FieldLabel>
                          <textarea
                            className="flex h-20 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Notas sobre este artículo..."
                            {...control.register(`items.${index}.comment`)}
                          />
                        </Field>
                      </div>

                      <Field>
                        <FieldLabel>Subtotal</FieldLabel>
                        <Input
                          value={(watchedItems[index]?.quantity * watchedItems[index]?.unitCost || 0).toFixed(2)}
                          readOnly
                          className="bg-neutral-100 border-neutral-300"
                        />
                      </Field>
                    </FieldGroup>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>

        {/* Summary */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Resumen del Abastecimiento</h3>
                <p className="text-sm text-neutral-600">
                  {fields.length} artículo(s) • Total: ${totalCost.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-neutral-600">Costo Total</p>
                <p className="text-2xl font-bold text-neutral-900">
                  ${totalCost.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className={`flex gap-3 pt-4 border-t border-neutral-200 ${
          layout === 'modal' ? 'justify-end' : 'flex justify-end'
        }`}>
          {layout === 'modal' && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={currentLoading}
              className="cursor-pointer"
            >
              Cancelar
            </Button>
          )}
          
          {layout === 'page' && (
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={currentLoading}
              className="cursor-pointer"
            >
              Limpiar
            </Button>
          )}
          
          <Button
            type="submit"
            disabled={!isDirty || !isValid || currentLoading}
            className="cursor-pointer"
          >
            {currentLoading ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Registrando...
              </>
            ) : (
              <>
                <Package className="w-4 h-4 mr-2" />
                Registrar Abastecimiento
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
