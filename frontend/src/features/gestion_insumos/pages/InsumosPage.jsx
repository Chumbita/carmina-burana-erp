import { useEffect, useState } from "react"
import { getInsumos,createInsumo } from "../services/insumos.service"

import { InsumosTable } from "../components/InsumosTable"
import { NewInsumoModal } from "../components/NewInsumoModal"

import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input";
import { Separator } from "@/components/ui/Separator"
import { RefreshCcw, Plus } from "lucide-react";


export default function InsumosPage() {
  
    const [insumos, setInsumos] = useState([])
    const [openNewInsumo, setOpenNewInsumo] = useState(false);
    
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    

    useEffect(() => {
        getInsumos().then(data => {
        setInsumos(data);
        setLoading(false);
        });
    }, []);

    //crear insumo    
    function handleCreateInsumo(data) {
        createInsumo(data).then((nuevoInsumo) => {
            setInsumos(prev => [...prev, nuevoInsumo])
        })
    }

    //filtro search
    const insumosFiltrados = insumos.filter(insumo =>
        insumo.nombre?.toLowerCase().includes(search.toLowerCase())
    );

    //manejar loading y el caso de que no haya insumos, mejorar
    if (loading) {
        return <p>Cargando insumos...</p>;
    }

    if (insumos.length === 0) {
        return <p>No hay insumos registrados</p>;
    }


  return (
    <div className="space-y-4">
              {/* Header */}
      <header className="flex items-center justify-between">
        <Input
        placeholder="Buscar insumo..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="max-w-sm"
      />
        <div>
    
        <Button className="cursor-pointer" onClick={() => setOpenNewInsumo(true)}>
          <Plus/>Agregar insumo 
        </Button>
        
        </div>
      </header>

        <NewInsumoModal
        open={openNewInsumo}
        onClose={() => setOpenNewInsumo(false)}
        onSubmit={handleCreateInsumo}
      />


        <InsumosTable insumos={insumosFiltrados} />
    </div>
  )
}
