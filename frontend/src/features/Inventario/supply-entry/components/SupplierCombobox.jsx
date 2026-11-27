import { useState } from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/Command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover'
import { cn } from '@/lib/utils'

/**
 * Selector de proveedor con búsqueda. Presentación pura: el valor y el
 * callback de cambio los controla el formulario contenedor.
 */
export function SupplierCombobox({
  value,
  onChange,
  suppliers = [],
  loading = false,
  onCreateClick,
  invalid = false,
}) {
  const [open, setOpen] = useState(false)
  const selected = suppliers.find((supplier) => supplier.id === value)

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-invalid={invalid}
            disabled={loading}
            className={cn(
              'flex h-9 min-w-0 flex-1 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              !selected && 'text-muted-foreground',
              invalid && 'border-destructive focus:ring-destructive/30'
            )}
          >
            <span className="truncate">
              {selected ? selected.name : loading ? 'Cargando proveedores...' : 'Seleccionar proveedor'}
            </span>
            <ChevronsUpDown className="ml-1 size-3.5 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar proveedor..." />
            <CommandList>
              <CommandEmpty>Sin resultados.</CommandEmpty>
              <CommandGroup>
                {suppliers.map((supplier) => (
                  <CommandItem
                    key={supplier.id}
                    value={supplier.name}
                    onSelect={() => {
                      onChange(supplier.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 size-4 shrink-0',
                        value === supplier.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">{supplier.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={onCreateClick}
        disabled={loading}
        aria-label="Crear proveedor"
      >
        <Plus />
      </Button>
    </div>
  )
}
