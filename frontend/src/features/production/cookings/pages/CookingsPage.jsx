import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FilterBar } from "@/components/shared/FilterBar";
import { Pagination } from "@/features/Inventario/gestion_insumos/components/Pagination";
import { Plus } from "lucide-react";
import { useNotification } from "@/components/shared/notifications/useNotification";
import { BeerTable } from "../components/BeerTable";
import { NewBeerModal } from "../components/NewBeerModal";
import { beerService } from "../services/beerService";

const initialBeers = [
  {
    id: 1,
    name: "Golden Ale",
    style: "Ale",
    abv: 5.2,
    ibu: 30,
    fermentation_days: 7,
    conditioning_days: 10,
    min_stock_level: 50,
  },
];

export default function CookingsPage() {
  const [beers, setBeers] = useState(initialBeers);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [openModal, setOpenModal] = useState(false);
  const notify = useNotification();

  const filteredBeers = beers.filter((beer) => {
    const normalizedSearch = search.toLowerCase().trim();
    return (
      !normalizedSearch ||
      [beer.name, beer.style].join(" ").toLowerCase().includes(normalizedSearch)
    );
  });

  const sortedBeers = [...filteredBeers].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    const comparison = String(aValue).localeCompare(String(bValue));
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const totalCount = sortedBeers.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleBeers = sortedBeers.slice(startIndex, startIndex + itemsPerPage);

  const handleCreateBeer = async (formData) => {
    try {
      const payload = {
        name: formData.name,
        min_stock_level: Number(formData.min_stock_level ?? 0),
        style: formData.style,
        abv: Number(formData.abv),
        ibu: Number(formData.ibu),
        fermentation_days: Number(formData.fermentation_days),
        conditioning_days: Number(formData.conditioning_days),
      };

      const createdBeer = await beerService.create(payload);

      setBeers((prev) => [
        {
          id: createdBeer.id,
          name: createdBeer.name,
          style: createdBeer.style,
          abv: createdBeer.abv,
          ibu: createdBeer.ibu,
          fermentation_days: createdBeer.fermentation_days,
          conditioning_days: createdBeer.conditioning_days,
          min_stock_level: createdBeer.min_stock_level,
        },
        ...prev,
      ]);
      setOpenModal(false);
      setCurrentPage(1);
      notify.success(`Cerveza "${createdBeer.name}" registrada correctamente`);
    } catch (error) {
      notify.error(
        error?.response?.data?.detail || "No se pudo registrar la cerveza",
      );
    }
  };

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between gap-4">
        <FilterBar
          search={search}
          searchPlaceholder="Buscar por nombre o estilo..."
          onSearchChange={setSearch}
          filters={[]}
          sortFields={[
            { key: "name", label: "Nombre" },
            { key: "style", label: "Estilo" },
            { key: "abv", label: "ABV" },
          ]}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={setSortBy}
          onSortOrderChange={setSortOrder}
          hasActiveFilters={Boolean(search)}
          onClearFilters={() => {
            setSearch("");
          }}
        />

        <Button
          size="sm"
          className="cursor-pointer"
          onClick={() => setOpenModal(true)}
        >
          <Plus />
          Agregar cerveza
        </Button>
      </header>

      <NewBeerModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleCreateBeer}
      />

      <BeerTable beer={visibleBeers} />

      {totalCount > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalCount={totalCount}
          itemsPerPage={itemsPerPage}
        />
      )}
    </div>
  );
}
