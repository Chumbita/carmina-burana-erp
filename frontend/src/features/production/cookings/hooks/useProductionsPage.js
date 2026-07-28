import { useRef, useState } from "react";
import { useProductions } from "./useProductions";
import { useNotification } from "@/components/shared/notifications/useNotification";
import { useLocationNotification } from "@/features/Inventario/gestion_insumos/hooks/useLocationNotification";

export function useProductionsPage() {
  const { productions, loading, error, createProduction, releaseProduction,
    startProduction, completeProduction } = useProductions();
  const notify = useNotification();

  useLocationNotification(notify);

  const [openModal, setOpenModal] = useState(false);
  const tableRef = useRef(null);

  async function handleCreateProduction(formData) {
    try {
      const payload = {
        item_id: formData.item_id,
        bom_id: formData.bom_id,
        planned_quantity: formData.planned_quantity,
        schedule_date: formData.schedule_date || undefined,
        description: formData.description || undefined,
      };

      const newProduction = await createProduction(payload);
      setOpenModal(false);
      notify.success(`Orden de producción creada (ID: ${newProduction.id})`, {
        onClick: () => handleNotificationClick(newProduction.id),
      });
    } catch (error) {
      notify.error(
        `Error al crear la orden de producción: ${error.message ?? "Error al crear la orden"}`,
      );
    }
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
    handleCreateProduction,
    releaseProduction,
    startProduction,
    completeProduction,
    tableRef,
  };
}

export default useProductionsPage;
