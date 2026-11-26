import { Button } from "@/components/ui/Button"
import { Boxes, Package } from "lucide-react"

const SUPPLY_TYPES = [
  {
    value: "SUPPLY",
    label: "Producción",
    hint: "Malta, lúpulo, levadura",
    icon: Boxes,
  },
  {
    value: "PACKAGING_SUPPLY",
    label: "Envase",
    hint: "Botellas, latas, tapas",
    icon: Package,
  },
]

/**
 * Paso previo del alta: elegir qué tipo de insumo se va a crear.
 */
export function NewSupplyTypeSelector({ onSelect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {SUPPLY_TYPES.map((type) => {
        const Icon = type.icon

        return (
          <Button
            key={type.value}
            type="button"
            variant="outline"
            className="h-auto justify-start gap-3 p-4"
            onClick={() => onSelect(type.value)}
          >
            <Icon className="h-5 w-5" />
            <span className="text-left">
              <span className="block font-medium">{type.label}</span>
              <span className="block text-xs text-muted-foreground">{type.hint}</span>
            </span>
          </Button>
        )
      })}
    </div>
  )
}
