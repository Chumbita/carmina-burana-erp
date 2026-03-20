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

import { Plus, Trash2, Package, User, Search, Filter, X } from 'lucide-react'
import { useState, useMemo, useCallback } from 'react'

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
  // Estado para búsqueda de artículos
  const [searchQueries, setSearchQueries] = useState({})

  // Filtrar artículos para cada item
  const getFilteredInputs = useCallback((index) => {
    const searchQuery = searchQueries[index] || ''

    return availableInputs.filter(input => {
      const matchesSearch = searchQuery === '' || 
        input.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        input.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        input.brand?.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesSearch
    })
  }, [availableInputs, searchQueries])

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
    ? "space-y-8" 
    : "max-w-6xl mx-auto p-8 space-y-8"

  return (
    <div className={containerClass}>
      {/* Header - only show in page layout */}
      {layout === 'page' && (
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">
              Registro de Abastecimiento
            </h1>
            <p className="text-lg text-neutral-600 mt-2">
              Registre múltiples insumos en una sola recepción
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onViewHistory}
              className="cursor-pointer px-4 py-2"
            >
              Ver Historial
            </Button>
            <Badge variant="outline" className="text-sm px-3 py-2">
              <Package className="w-4 h-4 mr-1" />
              Supply Entry
            </Badge>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <div className="p-6">
            <p className="text-base text-red-600">{error}</p>
          </div>
        </Card>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Supply Information */}
        <Card className="shadow-sm border-neutral-200">
          <div className="p-10">
            <h3 className="text-xl font-semibold mb-8 flex items-center">
              <User className="w-6 h-6 mr-3" />
              Información del Abastecimiento
            </h3>
            
            <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Field>
                <FieldLabel htmlFor="supplier" className="text-base font-medium">
                  Proveedor <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  placeholder="Nombre del proveedor"
                  className="h-12 text-base"
                  {...control.register('supplier')}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="entryDate" className="text-base font-medium">
                  Fecha de Ingreso <span className="text-red-500">*</span>
                </FieldLabel>
                <Input
                  type="date"
                  className="h-12 text-base"
                  {...control.register('entryDate')}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="invoiceNumber" className="text-base font-medium">
                  Número de Factura
                </FieldLabel>
                <Input
                  placeholder="Opcional"
                  className="h-12 text-base"
                  {...control.register('invoiceNumber')}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="description" className="text-base font-medium">
                  Descripción
                </FieldLabel>
                <Input
                  placeholder="Descripción general del abastecimiento"
                  className="h-12 text-base"
                  {...control.register('description')}
                />
              </Field>
            </FieldGroup>
          </div>
        </Card>

        {/* Items Section */}
        <Card className="shadow-sm border-neutral-200">
          <div className="p-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-semibold flex items-center">
                <Package className="w-6 h-6 mr-3" />
                Artículos del Abastecimiento
              </h3>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={handleAddItem}
                className="cursor-pointer px-6 py-3"
              >
                <Plus className="w-5 h-5 mr-2" />
                Agregar Artículo
              </Button>
            </div>

            <div className="space-y-8">
              {fields.map((field, index) => (
                <Card key={field.id} className="border-neutral-200 shadow-sm">
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="text-lg font-medium text-neutral-900">
                        Artículo #{index + 1}
                      </h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          size="lg"
                          variant="outline"
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer px-4 py-3"
                        >
                          <Trash2 className="w-5 h-5" />
                        </Button>
                      )}
                    </div>

                    <FieldGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-1">
                        <Field>
                          <FieldLabel htmlFor={`items.${index}.inputId`} className="text-base font-medium">
                            Insumo <span className="text-red-500">*</span>
                          </FieldLabel>
                          
                          {/* Search Section */}
                          <div className="mb-3">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                              <Input
                                placeholder="Buscar insumo..."
                                value={searchQueries[index] || ''}
                                onChange={(e) => setSearchQueries(prev => ({ ...prev, [index]: e.target.value }))}
                                className="pl-10 text-base h-10"
                              />
                            </div>
                            
                            {/* Results List */}
                            {getFilteredInputs(index).length > 0 && (
                              <div className="py-1">
                                <div className="px-3 py-2 text-xs font-medium text-neutral-500">
                                  {getFilteredInputs(index).length} insumos encontrados
                                </div>
                                {getFilteredInputs(index).map((input) => (
                                  <div
                                    key={input.id}
                                    onClick={() => control.setValue(`items.${index}.inputId`, input.id)}
                                    className={`px-3 py-3 cursor-pointer hover:bg-neutral-50 border-b border-neutral-100 last:border-b-0 ${
                                      watchedItems[index]?.inputId === input.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                    }`}
                                  >
                                    <div className="flex flex-col">
                                      <span className="font-medium text-base">{input.name}</span>
                                      <div className="flex gap-1 mt-1">
                                        {input.brand && (
                                          <Badge variant="secondary" className="text-xs px-2 py-1">
                                            {input.brand}
                                          </Badge>
                                        )}
                                        {input.category && (
                                          <Badge variant="outline" className="text-xs px-2 py-1">
                                            {input.category}
                                          </Badge>
                                        )}
                                        <span className="text-xs text-neutral-500">
                                          {input.unit}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </Field>
                      </div>

                      <Field>
                        <FieldLabel htmlFor={`items.${index}.quantity`} className="text-base font-medium">
                          Cantidad <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          type="number"
                          step="0.01"
                          min="0.01"
                          placeholder="0.00"
                          className="h-12 text-base"
                          {...control.register(`items.${index}.quantity`, { valueAsNumber: true })}
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor={`items.${index}.unitCost`} className="text-base font-medium">
                          Costo Unitario <span className="text-red-500">*</span>
                        </FieldLabel>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="h-12 text-base"
                          {...control.register(`items.${index}.unitCost`, { valueAsNumber: true })}
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor={`items.${index}.expirationDate`} className="text-base font-medium">
                          Fecha Vencimiento
                        </FieldLabel>
                        <Input
                          type="date"
                          className="h-12 text-base"
                          {...control.register(`items.${index}.expirationDate`)}
                        />
                      </Field>

                      <Field>
                        <FieldLabel htmlFor={`items.${index}.batchNumber`} className="text-base font-medium">
                          Número de Lote
                        </FieldLabel>
                        <Input
                          placeholder="Opcional"
                          className="h-12 text-base"
                          {...control.register(`items.${index}.batchNumber`)}
                        />
                      </Field>

                      <div className="lg:col-span-1">
                        <Field>
                          <FieldLabel htmlFor={`items.${index}.comment`} className="text-base font-medium">
                            Comentario
                          </FieldLabel>
                          <textarea
                            className="flex h-28 w-full rounded-md border border-neutral-300 bg-white px-4 py-4 text-base ring-offset-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Notas sobre este artículo..."
                            {...control.register(`items.${index}.comment`)}
                          />
                        </Field>
                      </div>

                      <Field>
                        <FieldLabel className="text-base font-medium">Subtotal</FieldLabel>
                        <Input
                          value={(watchedItems[index]?.quantity * watchedItems[index]?.unitCost || 0).toFixed(2)}
                          readOnly
                          className="h-12 text-base bg-neutral-100 border-neutral-300 font-semibold"
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
        <Card className="shadow-sm border-neutral-200">
          <div className="p-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-neutral-900">Resumen del Abastecimiento</h3>
                <p className="text-base text-neutral-600 mt-2">
                  {fields.length} artículo(s) • Total: ${totalCost.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-base text-neutral-600 mb-1">Costo Total</p>
                <p className="text-3xl font-bold text-neutral-900">
                  ${totalCost.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className={`flex gap-6 pt-8 border-t border-neutral-200 ${
          layout === 'modal' ? 'justify-end' : 'flex justify-end'
        }`}>
          {layout === 'modal' && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={currentLoading}
              className="cursor-pointer px-8 py-4 text-base"
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
              className="cursor-pointer px-8 py-4 text-base"
            >
              Limpiar
            </Button>
          )}
          
          <Button
            type="submit"
            disabled={!isDirty || !isValid || currentLoading}
            className="cursor-pointer px-8 py-4 text-base"
          >
            {currentLoading ? (
              <>
                <Spinner className="w-5 h-5 mr-2" />
                Registrando...
              </>
            ) : (
              <>
                <Package className="w-5 h-5 mr-2" />
                Registrar Abastecimiento
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
