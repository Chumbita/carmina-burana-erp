import { AlertTriangle, Package } from "lucide-react"

export function StockInsufficientBanner({ message, missing, onDismiss }) {
  if (!missing || missing.length === 0) return null

  return (
    <div className="border border-red-200 rounded-lg bg-red-50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold text-red-700 flex items-center gap-2">
          <AlertTriangle size={16} /> Stock Insuficiente
        </h4>
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 text-xs"
        >
          Cerrar
        </button>
      </div>
      {message && (
        <p className="text-xs text-red-600">{message}</p>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-red-200">
              <th className="text-left p-1.5 font-medium text-red-600">Insumo</th>
              <th className="text-right p-1.5 font-medium text-red-600">Requerido</th>
              <th className="text-right p-1.5 font-medium text-red-600">Disponible</th>
              <th className="text-right p-1.5 font-medium text-red-600">Faltante</th>
            </tr>
          </thead>
          <tbody>
            {missing.map((insumo, index) => (
              <tr key={index} className="border-b border-red-100 last:border-0">
                <td className="p-1.5 flex items-center gap-1.5">
                  <Package size={12} className="text-red-400" />
                  <span className="font-medium text-red-800">{insumo.name}</span>
                </td>
                <td className="p-1.5 text-right text-red-700">
                  {insumo.required} {insumo.uom_symbol}
                </td>
                <td className="p-1.5 text-right text-red-700">
                  {insumo.available} {insumo.uom_symbol}
                </td>
                <td className="p-1.5 text-right font-semibold text-red-800">
                  {insumo.required - insumo.available} {insumo.uom_symbol}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
