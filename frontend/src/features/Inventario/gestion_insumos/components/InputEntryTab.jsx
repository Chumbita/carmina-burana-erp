import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

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
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/Field'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

// Schema for input entry validation
const inputEntrySchema = z.object({
  inputId: z.string().min(1, 'Seleccione un insumo'),
  quantity: z.number().min(0.01, 'La cantidad debe ser mayor a 0'),
  unitCost: z.number().min(0, 'El costo unitario debe ser mayor o igual a 0'),
  supplier: z.string().min(1, 'El proveedor es requerido'),
  invoiceNumber: z.string().optional(),
  entryDate: z.string().min(1, 'La fecha de ingreso es requerida'),
  expirationDate: z.string().optional(),
  batchNumber: z.string().optional(),
  notes: z.string().optional(),
})

/**
 * InputEntryTab - Componente para el ingreso de insumos al inventario
 * 
 * @param {Object} props - Component props
 * @param {Array} props.availableInputs - Lista de insumos disponibles
 * @param {Function} props.onSubmit - Función llamada al enviar el formulario
 * @param {boolean} props.loading - Estado de carga
 * @param {string} props.error - Mensaje de error
 */
export function InputEntryTab({
  availableInputs = [],
  onSubmit,
  loading = false,
  error = null,
}) {
  const [selectedInput, setSelectedInput] = useState(null)

  const {
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { isDirty, isValid },
  } = useForm({
    resolver: zodResolver(inputEntrySchema),
    defaultValues: {
      inputId: '',
      quantity: 1,
      unitCost: 0,
      supplier: '',
      invoiceNumber: '',
      entryDate: new Date().toISOString().split('T')[0],
      expirationDate: '',
      batchNumber: '',
      notes: '',
    },
    mode: 'onChange',
  })

  const watchedInputId = watch('inputId')
  const watchedQuantity = watch('quantity')
  const watchedUnitCost = watch('unitCost')

  // Calculate total cost automatically
  const totalCost = watchedQuantity * watchedUnitCost

  // Handle input selection
  const handleInputChange = useCallback((inputId) => {
    const selected = availableInputs.find(input => input.id === inputId)
    setSelectedInput(selected)
    
    // Reset quantity and unit cost when input changes
    setValue('quantity', 1)
    setValue('unitCost', 0)
  }, [availableInputs, setValue])

  // Handle form submission
  const handleFormSubmit = useCallback((data) => {
    const submissionData = {
      ...data,
      totalCost,
      inputName: selectedInput?.name,
      inputUnit: selectedInput?.unit,
    }
    
    onSubmit(submissionData)
  }, [onSubmit, totalCost, selectedInput])

  // Reset form
  const handleReset = useCallback(() => {
    reset()
    setSelectedInput(null)
  }, [reset])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">
            Ingreso de Insumos
          </h2>
          <p className="text-sm text-neutral-600 mt-1">
            Registre nuevos insumos en el inventario
          </p>
        </div>
        {selectedInput && (
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {selectedInput.name}
            </Badge>
            <Badge variant="secondary">
              Unidad: {selectedInput.unit}
            </Badge>
          </div>
        )}
      </div>

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
        <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Insumo Selection */}
          <div className="md:col-span-2">
            <Field>
              <FieldLabel htmlFor="inputId">
                Insumo <span className="text-red-500">*</span>
              </FieldLabel>
              <Select
                value={watchedInputId}
                onValueChange={handleInputChange}
              >
                <SelectTrigger id="inputId">
                  <SelectValue placeholder="Seleccione un insumo..." />
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

          {/* Quantity */}
          <Field>
            <FieldLabel htmlFor="quantity">
              Cantidad <span className="text-red-500">*</span>
            </FieldLabel>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              {...control.register('quantity', { valueAsNumber: true })}
            />
          </Field>

          {/* Unit Cost */}
          <Field>
            <FieldLabel htmlFor="unitCost">
              Costo Unitario <span className="text-red-500">*</span>
            </FieldLabel>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...control.register('unitCost', { valueAsNumber: true })}
            />
          </Field>

          {/* Total Cost (Display Only) */}
          <Field>
            <FieldLabel htmlFor="totalCost">Costo Total</FieldLabel>
            <Input
              value={totalCost.toFixed(2)}
              readOnly
              className="bg-neutral-100 border-neutral-300"
            />
          </Field>

          {/* Supplier */}
          <Field>
            <FieldLabel htmlFor="supplier">
              Proveedor <span className="text-red-500">*</span>
            </FieldLabel>
            <Input
              placeholder="Nombre del proveedor"
              {...control.register('supplier')}
            />
          </Field>

          {/* Invoice Number */}
          <Field>
            <FieldLabel htmlFor="invoiceNumber">Número de Factura</FieldLabel>
            <Input
              placeholder="Opcional"
              {...control.register('invoiceNumber')}
            />
          </Field>

          {/* Entry Date */}
          <Field>
            <FieldLabel htmlFor="entryDate">
              Fecha de Ingreso <span className="text-red-500">*</span>
            </FieldLabel>
            <Input
              type="date"
              {...control.register('entryDate')}
            />
          </Field>

          {/* Expiration Date */}
          <Field>
            <FieldLabel htmlFor="expirationDate">Fecha de Vencimiento</FieldLabel>
            <Input
              type="date"
              {...control.register('expirationDate')}
            />
          </Field>

          {/* Batch Number */}
          <Field>
            <FieldLabel htmlFor="batchNumber">Número de Lote</FieldLabel>
            <Input
              placeholder="Opcional"
              {...control.register('batchNumber')}
            />
          </Field>

          {/* Notes */}
          <div className="md:col-span-2">
            <Field>
              <FieldLabel htmlFor="notes">Notas</FieldLabel>
              <textarea
                className="flex h-20 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Notas adicionales sobre el ingreso..."
                {...control.register('notes')}
              />
            </Field>
          </div>
        </FieldGroup>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={loading}
            className="cursor-pointer"
          >
            Limpiar
          </Button>
          
          <Button
            type="submit"
            disabled={!isDirty || !isValid || loading}
            className="cursor-pointer"
          >
            {loading ? 'Registrando...' : 'Registrar Ingreso'}
          </Button>
        </div>
      </form>
    </div>
  )
}

// PropTypes for better development experience
InputEntryTab.propTypes = {
  availableInputs: Array.isRequired,
  onSubmit: Function.isRequired,
  loading: Boolean,
  error: String,
}
