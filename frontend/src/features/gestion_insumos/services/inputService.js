import { ENDPOINTS } from "@/lib/api/endpoints";
import privateClient from "@/lib/api/privateClient";

// inputService.js

export const inputService = {
  getAll: async () => {
    const response = await privateClient.get(ENDPOINTS.INPUTS.GET_ALL)
    //mapeado hasta arreglar conflicto de nombres.
    return response.data.map((backendInsumo) => ({
      id: backendInsumo.id,
      nombre: backendInsumo.name,
      marca: backendInsumo.brand,
      categoria: backendInsumo.category,
      unidadMedida: backendInsumo.unit,
      stockMinimo: backendInsumo.minimum_stock,
      stockTotal: backendInsumo.stock_total || 0,
      estadoStock: backendInsumo.stock_status || "optimo",
      imagen: backendInsumo.image
    }))
  },

  create: async (data) => {
    // Mapear frontend -> backend
    const backendData = {
      name: data.nombre,
      brand: data.marca,
      category: data.categoria,
      unit: data.unidadMedida,
      minimum_stock: data.stockMinimo,
      image: data.imagen || null
    }
    
    const response = await privateClient.post(
      ENDPOINTS.INPUTS.CREATE,
      backendData
    )
    
    // ⭐ MAPEAR la respuesta backend -> frontend
    const backendInsumo = response.data
    return {
      id: backendInsumo.id,
      nombre: backendInsumo.name,
      marca: backendInsumo.brand,
      categoria: backendInsumo.category,
      unidadMedida: backendInsumo.unit,
      stockMinimo: backendInsumo.minimum_stock,
      stockTotal: backendInsumo.stock_total || 0,
      estadoStock: backendInsumo.stock_status || "optimo",
      imagen: backendInsumo.image
    }
  },
}


//mocks
let INSUMOS =[
    {
    "id": "malta-caramelo",
    "nombre": "Malta Caramelo",
    "marca": "Microsoft",
    "categoria": "Malta",
    "unidadMedida": "kg",
    "estadoStock": "optimo",
    "stockTotal": 1850,
    "stockMinimo": 200
  },
]


//insumosDetail
const INSUMOS_DETALLE = [
  {
    "id": "malta-caramelo",
    "nombre": "Malta",
    "categoria": "No Perecedero",
    "unidadMedida": "kg",
    "stockTotal": 1850,
     "marca": "Cargill",
    "imagen": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmtXD6-JwrzeJVK69V4XPYeiycJX6DgvBkOw&s",
    "estadoStock": "optimo",    
    "stockMinimo": 200,
    "insumos": [
      {
        "id": "malta-pilsen",
        "nombre": "Malta Pilsen",
        "marca": "Cargill",
        "stockTotal": 1200,
        "stockMinimo": 1300,
        "lotesActivos": 3,
        "lotes": [
          {
            "id": "L006",
            "numeroLote": "MP-2024-320",
            "cantidadInicial": 500,
            "cantidadDisponible": 500,
            "fechaIngreso": "2025-01-15",
            "fechaVencimiento": "2026-02-15",
            "proveedor": "Cargill Argentina",
            "costoTotal": 125000,
            "descripcion": "Malta base de alta calidad, ideal para cervezas rubias",
            "estado": "disponible"
          },
          {
            "id": "L007",
            "numeroLote": "MP-2024-298",
            "cantidadInicial": 500,
            "cantidadDisponible": 450,
            "fechaIngreso": "2024-11-20",
            "fechaVencimiento": "2025-11-20",
            "proveedor": "Cargill Argentina",
            "costoTotal": 122500,
            "estado": "disponible"
          },
          {
            "id": "L008",
            "numeroLote": "MP-2024-275",
            "cantidadInicial": 300,
            "cantidadDisponible": 250,
            "fechaIngreso": "2024-09-05",
            "fechaVencimiento": "2025-09-05",
            "proveedor": "Cargill Argentina",
            "costoTotal": 73500,
            "estado": "disponible"
          }
        ]
      },
      {
        "id": "malta-caramelo",
        "nombre": "Malta Caramelo",
        "marca": "Weyermann",
        "stockTotal": 450,
        "stockMinimo": 50,
        "lotesActivos": 3,
        "lotes": [
          {
            "id": "L009",
            "numeroLote": "MP-2024-401",
            "cantidadInicial": 200,
            "cantidadDisponible": 200,
            "fechaIngreso": "2025-01-12",
            "fechaVencimiento": "2026-03-12",
            "proveedor": "Maltería Pampa",
            "costoTotal": 68000,
            "descripcion": "Malta especial para dar color y dulzor",
            "estado": "disponible"
          },
          {
            "id": "L010",
            "numeroLote": "MP-2024-389",
            "cantidadInicial": 200,
            "cantidadDisponible": 150,
            "fechaIngreso": "2024-12-28",
            "fechaVencimiento": "2025-12-28",
            "proveedor": "Maltería Pampa",
            "costoTotal": 66000,
            "estado": "disponible"
          },
          {
            "id": "L011",
            "numeroLote": "MP-2024-365",
            "cantidadInicial": 150,
            "cantidadDisponible": 100,
            "fechaIngreso": "2024-10-15",
            "fechaVencimiento": "2025-10-15",
            "costoTotal": 48000,
            "estado": "disponible"
          }
        ]
      }
    ]
  },
]

export function getInsumoById(id) {
  return new Promise((resolve) => {
    
      const insumo = INSUMOS_DETALLE.find((i) => i.id === id);
      resolve(insumo || null);
   
  });
}

