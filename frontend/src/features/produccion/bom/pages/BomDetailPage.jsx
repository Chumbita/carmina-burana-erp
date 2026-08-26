import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Controller, useWatch } from 'react-hook-form'
import { BoxesIcon, Pencil, Plus, Trash2, Save, X, Check, ChevronsUpDown } from 'lucide-react'
import { EntityDetailPage } from '@/components/shared/DetailPage/EntityDetailPage'
import { useBom } from '../hooks/useBom'
import { useBomEdit } from '../hooks/useBomEdit'
import { useNotification } from '@/components/shared/notifications/useNotification'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { DecimalInput } from '@/components/shared/DecimalInput'
import { InputGroup, InputGroupAddon, InputGroupText } from '@/components/ui/InputGroup'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/Command'
import { formatDecimal } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'

function ItemCombobox({ value, onChange, items = [], placeholder = 'Seleccionar…', invalid = false }) {
  const [open, setOpen] = useState(false)
  const selected = items.find((i) => i.item_id === value)

  function handleSelect(item) {
    onChange(item.item_id)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type='button'
          role='combobox'
          aria-expanded={open}
          aria-invalid={invalid}
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            !selected && 'text-muted-foreground',
            invalid && 'border-destructive focus:ring-destructive/30'
          )}
        >
          <span className='truncate text-left'>
            {selected ? selected.name : placeholder}
          </span>
          <ChevronsUpDown className='ml-1 size-3.5 shrink-0 opacity-50' />
        </button>
      </PopoverTrigger>
      <PopoverContent className='w-96 p-0' align='start'>
        <Command>
          <CommandInput placeholder='Buscar…' />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.item_id}
                  value={item.name + ' ' + item.brand + ' ' + item.item_type + ' ' + item.uom_symbol}
                  onSelect={() => handleSelect(item)}
                >
                  <Check
                    className={cn(
                      'mr-2 size-4 shrink-0',
                      value === item.item_id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className='flex flex-col'>
                    <span className='font-semibold text-base text-foreground'>{item.name}</span>
                    <span className='text-sm text-muted-foreground'>{item.brand} - {item.item_type} - {item.uom_symbol}</span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function EditableLineRow({ index, control, items, isNew, onRemove }) {
  const componentItemId = useWatch({ control, name: 'lines.' + index + '.component_item_id' })
  const quantity = useWatch({ control, name: 'lines.' + index + '.quantity' })
  const selectedItem = items.find((i) => i.item_id === componentItemId)
  const isQtyInvalid = quantity == null || quantity === '' || quantity <= 0

  return (
    <tr className='border-b border-border last:border-0 group'>
      <td className='py-2.5 pr-3 align-top'>
        <span className='hidden sm:inline-flex size-9 items-center justify-center rounded bg-muted text-xs font-medium text-muted-foreground'>
          {index + 1}
        </span>
        <span className='text-xs text-muted-foreground sm:hidden'>{index + 1}.</span>
      </td>
      <td className='py-2.5 pr-3 align-top'>
        {isNew ? (
          <Controller
            name={'lines.' + index + '.component_item_id'}
            control={control}
            render={({ field: itemField, fieldState }) => (
              <>
                <ItemCombobox
                  value={itemField.value}
                  onChange={(id) => itemField.onChange(id)}
                  onSelect={() => {}}
                  items={items}
                  placeholder='Seleccionar insumo…'
                  invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <p className='text-destructive text-xs mt-1'>{fieldState.error?.message}</p>
                )}
              </>
            )}
          />
        ) : (
          <div className='flex h-9 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm text-foreground'>
            <span className='truncate'>{selectedItem?.name ?? 'Sin seleccionar'}</span>
          </div>
        )}
      </td>
      <td className='py-2.5 pr-3 align-top'>
        <Controller
          name={'lines.' + index + '.quantity'}
          control={control}
          render={({ field: qtyField }) => (
            <InputGroup>
              <DecimalInput
                {...qtyField}
                data-slot='input-group-control'
                aria-invalid={isQtyInvalid ? 'true' : undefined}
                className={cn(
                  'flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent h-9 text-sm',
                  isQtyInvalid && 'text-destructive ring-destructive/20 ring-1 border-destructive'
                )}
              />
              <InputGroupAddon align='inline-end'>
                <InputGroupText>
                  {selectedItem?.uom_symbol ?? ''}
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          )}
        />
      </td>
      <td className='py-2.5 align-top'>
        <div className='flex items-center justify-center'>
          <button
            type='button'
            onClick={() => onRemove(index)}
            className='rounded p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer'
            aria-label='Eliminar componente'
          >
            <Trash2 className='size-4' />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function BomDetailPage() {
  const { bomId } = useParams()
  const navigate = useNavigate()
  const { bom, loading, error } = useBom(bomId)
  const [editMode, setEditMode] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const notify = useNotification()

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
    reset,
  } = useBomEdit(bom)

  async function handleSaveSubmit(data) {
    setIsSaving(true)
    const result = await handleSave(data)
    setIsSaving(false)
    if (result.success) {
      setEditMode(false)
      notify.success('Fórmula actualizada exitosamente')
      navigate(`/produccion/bom/${result.newId}`, { replace: true })
    }
  }

  function handleCancel() {
    setEditMode(false)
    reset()
  }

  const validFromDate = bom?.valid_from
    ? new Date(bom.valid_from).toLocaleDateString('es-AR')
    : '-'

  return (
    <EntityDetailPage loading={loading} error={error}>
      <EntityDetailPage.Header name={bom?.parent_item_name} />

      <EntityDetailPage.Sidebar
        icon={<BoxesIcon className='h-10 w-10 text-gray-400' />}
      >
        <EntityDetailPage.Sidebar.Row label='Versión' value={bom?.version} />
        <EntityDetailPage.Sidebar.Row
          label='Cantidad'
          value={formatDecimal(bom?.quantity) + ' ' + bom?.bom_uom_symbol}
        />
        <EntityDetailPage.Sidebar.Row label='Vigente desde' value={validFromDate} />
        {bom?.is_active !== true && (
          <EntityDetailPage.Sidebar.Row
            label='Vigente hasta'
            value={
              bom?.valid_to
                ? new Date(bom.valid_to).toLocaleDateString('es-AR')
                : '-'
            }
          />
        )}
        <EntityDetailPage.Sidebar.Row
          label='Estado'
          value={bom?.is_active ? 'Vigente' : 'Descontinuado'}
        />
        <EntityDetailPage.Sidebar.Row
          label='Insumos'
          value={bom?.components_count}
        />
      </EntityDetailPage.Sidebar>

      <EntityDetailPage.Content>
        {editMode ? (
          <form onSubmit={handleSubmit(handleSaveSubmit)} className='flex flex-col gap-4'>
            {editError && (
              <div className='rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive'>
                {typeof editError === 'string' ? editError : editError?.message ?? 'Error desconocido'}
              </div>
            )}
            <div className='flex items-start justify-between gap-3'>
              <div>
                <h2 className='text-lg font-semibold'>Componentes de la fórmula</h2>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  Edite las cantidades, agregue o elimine componentes. Para cambiar un componente existente, elimínelo y agregue una nueva fila.
                </p>
              </div>
              <Button type='button' variant='outline' size='sm' onClick={handleAddLine} className='cursor-pointer'>
                <Plus data-icon='inline-start' />
                Agregar
              </Button>
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full border-collapse text-sm'>
                <thead>
                  <tr className='border-b border-border'>
                    <th className='pb-2 pt-1 pr-3 text-left text-xs font-medium text-muted-foreground w-10'>Nro</th>
                    <th className='pb-2 pt-1 pr-3 text-left text-xs font-medium text-muted-foreground'>Insumo <span className='text-destructive'>*</span></th>
                    <th className='pb-2 pt-1 pr-3 text-left text-xs font-medium text-muted-foreground w-44'>Cantidad requerida <span className='text-destructive'>*</span></th>
                    <th className='pb-2 pt-1 text-left text-xs font-medium text-muted-foreground w-10'>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <EditableLineRow
                      key={field.id}
                      index={index}
                      control={control}
                      items={items}
                      isNew={isLineNew(index)}
                      onRemove={handleRemoveLine}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {fields.length === 0 && (
              <p className='text-xs text-muted-foreground text-center py-4'>
                No hay componentes agregados. Hacé clic en «Agregar» para comenzar.
              </p>
            )}

            <div className='flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-1'>
              <div className='flex items-baseline gap-2'>
                <span className='text-xs text-muted-foreground'>
                  {fields.length} componente{fields.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className='flex gap-2 justify-end'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='cursor-pointer'
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  <X data-icon='inline-start' />
                  Cancelar
                </Button>
                <Button
                  type='submit'
                  size='sm'
                  disabled={!isDirty || isSaving}
                  className='cursor-pointer'
                >
                  {isSaving ? (
                    <>
                      <Spinner data-icon='inline-start' />
                      Guardando…
                    </>
                  ) : (
                    <>
                      <Save data-icon='inline-start' />
                      Guardar cambios
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className='space-y-4'>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <h2 className='text-lg font-semibold'>Componentes de la fórmula</h2>
              </div>
              {bom?.is_active === true && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setEditMode(true)}
                  className='cursor-pointer'
                >
                  <Pencil data-icon='inline-start' />
                  Editar
                </Button>
              )}
            </div>

            <div className='overflow-x-auto'>
              <table className='w-full border-collapse text-sm'>
                <thead>
                  <tr className='border-b border-border'>
                    <th className='pb-2 pt-1 pr-3 text-left text-xs font-medium text-muted-foreground w-10'>Nro</th>
                    <th className='pb-2 pt-1 pr-3 text-left text-xs font-medium text-muted-foreground'>Insumo</th>
                    <th className='pb-2 pt-1 pr-3 text-left text-xs font-medium text-muted-foreground'>Cantidad</th>
                  </tr>
                </thead>
                <tbody>
                  {(bom?.lines || []).map((line, index) => (
                    <tr key={line.id || index} className='border-b border-border last:border-0'>
                      <td className='py-2.5 pr-3 align-top'>
                        <span className='hidden sm:inline-flex size-9 items-center justify-center rounded bg-muted text-xs font-medium text-muted-foreground'>
                          {index + 1}
                        </span>
                        <span className='text-xs text-muted-foreground sm:hidden'>{index + 1}.</span>
                      </td>
                      <td className='py-2.5 pr-3 align-top'>
                        <span className='font-medium'>{line.component_item_name}</span>
                      </td>
                      <td className='py-2.5 pr-3 align-top'>
                        <span className='font-medium'>
                          {formatDecimal(line.quantity)} {line.uom_symbol}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(!bom?.lines || bom.lines.length === 0) && (
              <p className='text-xs text-muted-foreground text-center py-4'>
                No hay componentes en esta fórmula.
              </p>
            )}
          </div>
        )}
      </EntityDetailPage.Content>
    </EntityDetailPage>
  )
}
