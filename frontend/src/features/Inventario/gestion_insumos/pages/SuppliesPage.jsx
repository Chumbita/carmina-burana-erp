import { SuppliesToolbar } from "../components/SuppliesToolbar"
import { SuppliesTableSection } from "../components/SuppliesTableSection"
import { NewSupplyModal } from "../components/NewSupplyModal"
import { useSuppliesPage } from "../hooks/useSuppliesPage"

/**
 * Página de insumos: solo compone toolbar, modal de alta y listado.
 */
export default function SuppliesPage() {
  const {
    data,
    loading,
    page,
    pageSize,
    totalItems,
    totalPages,
    filters,
    hasActiveFilters,
    changePage,
    changeSearch,
    changeCategory,
    changeItemType,
    changeStock,
    changeSortBy,
    changeSortOrder,
    clearFilters,
    openModal,
    setOpenModal,
    handleCreateSupply,
    tableRef,
  } = useSuppliesPage()

  // hasRecords para DataTable: true si hay algún registro en BD o filtros activos
  // (para distinguir empty vs noResults)
  const hasRecords = hasActiveFilters ? true : totalItems > 0 || (data && data.length > 0)

  return (
    <div className="space-y-4">
      <SuppliesToolbar
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onChangeSearch={changeSearch}
        onChangeCategory={changeCategory}
        onChangeItemType={changeItemType}
        onChangeStock={changeStock}
        onChangeSortBy={changeSortBy}
        onChangeSortOrder={changeSortOrder}
        onClearFilters={clearFilters}
        onCreate={() => setOpenModal(true)}
      />

      <NewSupplyModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleCreateSupply}
      />

      <SuppliesTableSection
        tableRef={tableRef}
        data={data}
        loading={loading}
        page={page}
        pageSize={pageSize}
        totalItems={totalItems}
        totalPages={totalPages}
        hasRecords={hasRecords}
        onChangePage={changePage}
      />
    </div>
  )
}
