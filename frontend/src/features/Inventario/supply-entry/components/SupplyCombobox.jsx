import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'

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
 * Selector de insumo con búsqueda tipo combobox.
 */
export function SupplyCombobox({ value, onChange, supplies = [], invalid = false }) {
  const [open, setOpen] = useState(false)
  const selected = supplies.find((s) => s.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            !selected && 'text-muted-foreground',
            invalid && 'border-destructive focus:ring-destructive/30'
          )}
        >
          <span className="truncate">{selected ? selected.name : 'Seleccionar…'}</span>
          <ChevronsUpDown className="ml-1 size-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar insumo…" />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup>
              {supplies.map((supply) => (
                <CommandItem
                  key={supply.id}
                  value={supply.name}
                  onSelect={() => {
                    onChange(supply.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 size-4 shrink-0',
                      value === supply.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">{supply.name}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {[supply.brand_name, supply.supply_category, supply.base_uom_symbol]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
