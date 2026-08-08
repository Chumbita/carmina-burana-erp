import { useRef, useState } from "react";
import { useProductions } from "./useProductions";
import { useNotification } from "@/components/shared/notifications/useNotification";
import { useLocationNotification } from "@/features/Inventario/gestion_insumos/hooks/useLocationNotification";

export function useProductionsPage() {
  const { productions, loading, error, planProduction, executeProduction } = useProductions();
  const notify = useNotification();

  useLocationNotification(notify);

  const [openModal, setOpenModal] = useState(false);
  const tableRef = useRef(null);

  async function handlePlanProduction(formData) {
    const payload = {
      item_id: formData.item_id,
      bom_id: formData.bom_id,
      planned_quantity: formData.planned_quantity,
      schedule_date: formData.schedule_date || undefined,
      description: formData.description || undefined,
    };

    const newProduction = await planProduction(payload);
    setOpenModal(false);
    notify.success(`Orden de producción planificada (ID: ${newProduction.id})`, {
      onClick: () => handleNotificationClick(newProduction.id),
    });
  }

  async function handleExecuteProduction(order, producedData) {
    return executeProduction(order.id, producedData);
  }

  function handleNotificationClick(id) {
    if (id && tableRef.current) {
      const row = tableRef.current.querySelector(
        `[data-production-id="${id}"]`,
      );
      if (row) {
        row.scrollIntoView({ behavior: "smooth", block: "center" });
        row.classList.add("bg-green-100", "dark:bg-green-900");
        setTimeout(
          () => row.classList.remove("bg-green-100", "dark:bg-green-900"),
          2000,
        );
      }
    }
  }

  return {
    productions,
    loading,
    error,
    openModal,
    setOpenModal,
    handlePlanProduction,
    handleExecuteProduction,
    tableRef,
  };
}

export default useProductionsPage;
