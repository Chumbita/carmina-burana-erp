// InputDetailSidebar.jsx
import { Badge } from "@/components/ui/Badge"
import { estadoStyles } from "../utils/stockStyles"

export function InputDetailSidebar({ input }) {
  return (
    <aside className="bg-white rounded-lg p-4 flex flex-col gap-4">
      <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center -mt-4">
        {input.image ? (
          <img src={input.image} alt={input.name} className="object-cover w-full h-full rounded-md" />
        ) : (
          <span className="text-6xl font-semibold text-gray-400">
            {input.name ? input.name[0].toUpperCase() : 'I'}
          </span>
        )}
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Stock actual</span>
          <span className="font-medium">{input.stock_actual} {input.unit}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Estado</span>
          <Badge className={estadoStyles[input.estado_stock]}>{input.estado_stock}</Badge>
        </div>
      </div>
    </aside>
  )
}