import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useNavigate } from "react-router-dom";
import { Play, CheckCircle, ArrowUpCircle, AlertTriangle, Package, X } from "lucide-react";
import { useNotification } from "@/components/shared/notifications/useNotification";
import { completeProductionSchema } from "../schemas/production.schema";

export function ProductionTable({ productions, onRelease, onStart, onComplete }) {
  const navigate = useNavigate();
  const notify = useNotification();
  
  // Estado para controlar las confirmaciones de un solo clic (RELEASE y START)
  const [confirmTarget, setConfirmTarget] = useState(null); 
  
  // Estado para el modal de insumos faltantes
  const [missingIngredientsTarget, setMissingIngredientsTarget] = useState(null);

  // Estados para controlar el modal de formulario (COMPLETE)
  const [completeTarget, setCompleteTarget] = useState(null); 

  const schemaComplete = completeProductionSchema();
  const { 
    handleSubmit: handleCompleteSubmitForm, 
    control: completeControl, 
    setValue: setCompleteValue,
    reset: resetCompleteForm,
    formState: { errors: completeErrors, isSubmitting: isCompleting } 
  } = useForm({
    resolver: zodResolver(schemaComplete),
    defaultValues: {
      produced_quantity: 0,
      lot_code: "",
      production_date: "",
      expiration_date: "",
      unit_cost: 0,
    },
    mode: "onChange"
  });

  // Sincroniza los datos de la orden seleccionada con el formulario de Zod
  useEffect(() => {
    if (completeTarget) {
      setCompleteValue("produced_quantity", Number(completeTarget.planned_quantity || 0));
      
      const productionDate = completeTarget.schedule_date 
        ? completeTarget.schedule_date.split('T')[0] 
        : "";
        
      setCompleteValue("production_date", productionDate);
      setCompleteValue("lot_code", "");
      setCompleteValue("expiration_date", "");
      setCompleteValue("unit_cost", 0);
    }
  }, [completeTarget, setCompleteValue]);

  // Manejador definitivo del envío (Envía la data limpia de Zod)
  const onCompleteSubmit = async (data) => {
    try {
      await onComplete(completeTarget.id, data); 
      notify.success(`¡Orden Nro ${completeTarget.row_number} completada con éxito!`);
      setCompleteTarget(null);
      resetCompleteForm();
    } catch (err) {
      const errorDetail = err.response?.data?.detail;
      notify.error(errorDetail?.message || "Error al completar la orden.");
    }
  };

  const handleRowClick = (row) => {
    navigate(`/produccion/cocciones/${row.id}`);
  };

  // Centralizador para acciones de confirmación simple (Liberar e Iniciar)
  const executeSimpleAction = async () => {
    if (!confirmTarget) return;
    const { type, row } = confirmTarget;

    try {
      if (type === "RELEASE") {
        await onRelease(row.id);
        notify.success(`Orden Nro ${row.row_number} liberada con éxito.`);
        setConfirmTarget(null);
      } else if (type === "START") {
        await onStart(row.id);
        notify.success(`¡Producción Nro ${row.row_number} iniciada!`);
        setConfirmTarget(null);
      }
    } catch (err) {
      const errorData = err.response?.data?.detail || err.response?.data;

      if (errorData?.missing && Array.isArray(errorData.missing) && errorData.missing.length > 0) {
        setMissingIngredientsTarget({
          row,
          missing: errorData.missing,
          message: errorData.message || "Stock insuficiente para iniciar la producción",
        });
        setConfirmTarget(null);
      } else {
        notify.error(errorData?.message || "Ocurrió un error al procesar la acción.");
        setConfirmTarget(null);
      }
    }
  };

  const renderContextualButton = (row) => {
    switch (row.status) {
      case "PLANNED":
        return (
          <Button 
            size="xs" 
            variant="outline"
            className="flex items-center gap-1 border-sky-500 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40"
            onClick={(e) => { 
              e.stopPropagation(); 
              setConfirmTarget({ type: "RELEASE", row }); 
            }}
          >
            <ArrowUpCircle size={14} /> Liberar
          </Button>
        );
      case "RELEASED":
        return (
          <Button 
            size="xs" 
            className="flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-sm"
            onClick={(e) => { 
              e.stopPropagation(); 
              setConfirmTarget({ type: "START", row }); 
            }}
          >
            <Play size={14} fill="currentColor" /> Iniciar
          </Button>
        );
      case "IN_PROGRESS":
        return (
          <Button 
            size="xs" 
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
            onClick={(e) => { 
              e.stopPropagation(); 
              setCompleteTarget(row);
            }}
          >
            <CheckCircle size={14} /> Completar
          </Button>
        );
      default:
        return null;
    }
  };

  const columns = [
    { header: "Nro", accessor: "row_number" },
    { header: "Producto", accessor: "item_name" },
    { header: "Receta", accessor: "bom_version", render: (value) => `v${value}` },
    { 
      header: "Cantidad", 
      accessor: "planned_quantity",
      render: (value, row) => `${value} ${row.base_uom_symbol || ""}`
    },
    { header: "Fecha planeada", accessor: "schedule_date", render: (value) => value ? value : "Sin fecha" },
    {
      header: "Estado",
      accessor: "status",
      render: (value) => {
        const statusConfig = {
          PLANNED: { className: "bg-slate-100 text-slate-800 border-slate-200", label: "Planeada" },
          RELEASED: { className: "bg-sky-100 text-sky-900 border-sky-200", label: "Liberada" },
          IN_PROGRESS: { className: "bg-amber-100 text-amber-950 border-amber-200", label: "En Proceso" },
        };
        const config = statusConfig[value] || { className: "bg-gray-100 text-gray-800", label: value };
        return <Badge className={`font-medium shadow-none ${config.className}`}>{config.label}</Badge>;
      },
    },
    {
      header: "Siguiente Acción",
      accessor: "actions",
      render: (_, row) => renderContextualButton(row)
    }
  ];
  
  const formattedProductions = productions?.map((production, index) => ({
    ...production,
    row_number: index + 1,
  })) || [];

  return (
    <>
      <DataTable
        columns={columns}
        data={formattedProductions}
        onRowClick={handleRowClick}
        emptyMessage="No hay órdenes de producción."
      />

      {/* CONFIRMACIÓN SIMPLE (LIBERAR/INICIAR) */}
      {confirmTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in" onClick={() => setConfirmTarget(null)}>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg max-w-sm w-full space-y-4 shadow-xl border border-slate-200 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {confirmTarget.type === "RELEASE" ? "¿Liberar Orden?" : "¿Iniciar Producción?"}
            </h3>
            <p className="text-sm text-slate-500">
              {confirmTarget.type === "RELEASE" 
                ? `Se validará el stock de insumos para la orden Nro ${confirmTarget.row.row_number} (${confirmTarget.row.item_name}).`
                : `Se registrarán los consumos de inventario e iniciará la cocción Nro ${confirmTarget.row.row_number} (${confirmTarget.row.item_name}).`
              }
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setConfirmTarget(null)}>Cancelar</Button>
              <Button 
                size="sm" 
                className={confirmTarget.type === "RELEASE" ? "bg-sky-600 hover:bg-sky-700" : "bg-amber-600 hover:bg-amber-700"}
                onClick={executeSimpleAction} 
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}

      {completeTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in" onClick={() => setCompleteTarget(null)}>
          <form 
            onSubmit={handleCompleteSubmitForm(onCompleteSubmit)} 
            className="bg-white dark:bg-slate-900 p-6 rounded-lg max-w-md w-full space-y-4 shadow-xl border border-slate-200 dark:border-slate-800" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Finalizar Producción</h3>
              <p className="text-xs text-slate-500">
                Orden Nro {completeTarget.row_number}: <span className="font-semibold">{completeTarget.item_name}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Cant. Producida ({completeTarget.base_uom_symbol || "U"})
                </label>
                <Controller
                  name="produced_quantity"
                  control={completeControl}
                  render={({ field }) => (
                    <Input {...field} type="number" step="any" className="h-9 text-xs px-3" />
                  )}
                />
                {completeErrors.produced_quantity && <span className="text-[10px] text-red-500">{completeErrors.produced_quantity.message}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Código de Lote</label>
                <Controller
                  name="lot_code"
                  control={completeControl}
                  render={({ field }) => (
                    <Input {...field} type="text" placeholder="Ej: IPA-2026-001" className="h-9 text-xs px-3" />
                  )}
                />
                {completeErrors.lot_code && <span className="text-[10px] text-red-500">{completeErrors.lot_code.message}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Fecha de Producción</label>
                <Controller
                  name="production_date"
                  control={completeControl}
                  render={({ field }) => (
                    <Input {...field} type="date" className="h-9 text-xs px-3" />
                  )}
                />
                {completeErrors.production_date && <span className="text-[10px] text-red-500">{completeErrors.production_date.message}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Fecha de Vencimiento</label>
                <Controller
                  name="expiration_date"
                  control={completeControl}
                  render={({ field }) => (
                    <Input {...field} type="date" className="h-9 text-xs px-3" />
                  )}
                />
                {completeErrors.expiration_date && <span className="text-[10px] text-red-500">{completeErrors.expiration_date.message}</span>}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Costo Unitario ($)</label>
              <Controller
                name="unit_cost"
                control={completeControl}
                render={({ field }) => (
                  <Input {...field} type="number" step="any" placeholder="Ej: 250" className="h-9 text-xs px-3" />
                )}
              />
              {completeErrors.unit_cost && <span className="text-[10px] text-red-500">{completeErrors.unit_cost.message}</span>}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" size="sm" onClick={() => setCompleteTarget(null)} disabled={isCompleting}>
                Cancelar
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isCompleting}>
                {isCompleting ? "Finalizando..." : "Finalizar Orden"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL INSUMOS FALTANTES */}
      {missingIngredientsTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in" onClick={() => { setMissingIngredientsTarget(null); setConfirmTarget(null); }}>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg max-w-lg w-full mx-4 space-y-4 shadow-xl border border-slate-200 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-red-600">
                <AlertTriangle size={20} /> Stock Insuficiente
              </h3>
              <button 
                onClick={() => { setMissingIngredientsTarget(null); setConfirmTarget(null); }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="text-sm text-slate-500">
              No se puede iniciar la orden <strong>Nro {missingIngredientsTarget.row.row_number}</strong> ({missingIngredientsTarget.row.item_name}). 
              Faltan los siguientes insumos:
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left p-2 font-medium text-slate-500">Insumo</th>
                    <th className="text-right p-2 font-medium text-slate-500">Requerido</th>
                    <th className="text-right p-2 font-medium text-slate-500">Disponible</th>
                    <th className="text-right p-2 font-medium text-slate-500 text-red-600">Faltante</th>
                  </tr>
                </thead>
                <tbody>
                  {missingIngredientsTarget.missing.map((insumo, index) => (
                    <tr key={index} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <td className="p-2 flex items-center gap-2">
                        <Package size={14} className="text-slate-400" />
                        <span className="font-medium">{insumo.name}</span>
                      </td>
                      <td className="p-2 text-right text-slate-600 dark:text-slate-400">
                        {insumo.required} {insumo.uom_symbol}
                      </td>
                      <td className="p-2 text-right text-slate-600 dark:text-slate-400">
                        {insumo.available} {insumo.uom_symbol}
                      </td>
                      <td className="p-2 text-right font-semibold text-red-600">
                        {insumo.required - insumo.available} {insumo.uom_symbol}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { setMissingIngredientsTarget(null); setConfirmTarget(null); }}
              >
                Entendido
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductionTable;