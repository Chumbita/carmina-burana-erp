import { ENDPOINTS } from "@/lib/api/endpoints";
import privateClient from "@/lib/api/privateClient";

// inputService.js
export const inputService = {
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
    "id": "lupulo-cascade",
    "nombre": "Lúpulo Cascade",
    "marca": "HopMaster",
    "categoria": "Lúpulo",
    "unidadMedida": "kg",
    "estadoStock": "optimo",
    "stockTotal": 234,
    "stockMinimo": 30
  },
  {
    "id": "malta-pilsen",
    "nombre": "Malta Pilsen",
    "marca": "Cargill",
    "categoria": "Malta",
    "unidadMedida": "kg",
    "estadoStock": "optimo",
    "stockTotal": 1850,
    "stockMinimo": 200
  },
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
  {
    "id": "levadura-ale",
    "nombre": "Levadura Ale Americana",
    "marca": "Fermentis",
    "categoria": "Levadura",
    "unidadMedida": "kg",
    "estadoStock": "bajo",
    "stockTotal": 45,
    "stockMinimo": 40
  },
  {
    "id": "botella-330ml",
    "nombre": "Botella 330ml Ámbar",
    "marca": "Verallia",
    "categoria": "Envases",
    "unidadMedida": "un",
    "estadoStock": "optimo",
    "stockTotal": 15600,
    "stockMinimo": 2000
  },
  {
    "id": "sanitizante-acido",
    "nombre": "Sanitizante Ácido Star San",
    "marca": "Five Star",
    "categoria": "Limpieza",
    "unidadMedida": "litros",
    "estadoStock": "critico",
    "stockTotal": 12,
    "stockMinimo": 20
  },
  {
    "id": "adjunto-lactosa",
    "nombre": "Lactosa Cervecera",
    "marca": "Milkose",
    "categoria": "Adjuntos",
    "unidadMedida": "kg",
    "estadoStock": "bajo",
    "stockTotal": 25,
    "stockMinimo": 30
  },

]

export function getInsumos() {
  return Promise.resolve(
       INSUMOS
  );
}


export async function createInsumo(data) {
  const nuevoInsumo = {
    id: Date.now(),
    ...data,
  }

  INSUMOS = [...INSUMOS, nuevoInsumo]

  return Promise.resolve(nuevoInsumo)
}


//insumosDetail
const INSUMOS_DETALLE = [
  {
    "id": "lupulo-cascade",
    "nombre": "Lúpulo",
    "categoria": "Perecedero",
    "unidadMedida": "kg",
    "stockTotal": 14,
    "stockMinimo": 30,
    "insumos": [
      {
        "id": "lupulo-las-sierras",
        "nombre": "Lúpulo las sierras",
        "marca": "Aguila guerrera",
        "stockTotal": 180,
        "stockMinimo": 20,
        "lotesActivos": 3,
        "lotes": [
          {
            "id": "L001",
            "numeroLote": "MP-2024-089",
            "cantidadInicial": 50,
            "cantidadDisponible": 50,
            "fechaIngreso": "2024-12-01",
            "fechaVencimiento": "2025-06-15",
            "proveedor": "Distribuidora Andina",
            "costoTotal": 15000,
            "descripcion": "Lote de lúpulo aromático para cervezas IPA, cosecha 2024",
            "estado": "disponible"
          },
          {
            "id": "L002",
            "numeroLote": "MP-2024-112",
            "cantidadInicial": 100,
            "cantidadDisponible": 80,
            "fechaIngreso": "2024-12-15",
            "fechaVencimiento": "2025-08-22",
            "proveedor": "Distribuidora Andina",
            "costoTotal": 30000,
            "estado": "disponible"
          },
          {
            "id": "L003",
            "numeroLote": "MP-2024-045",
            "cantidadInicial": 75,
            "cantidadDisponible": 50,
            "fechaIngreso": "2024-10-20",
            "fechaVencimiento": "2025-03-10",
            "proveedor": "Insumos del Valle",
            "costoTotal": 21000,
            "descripcion": "Requiere uso prioritario por vencimiento próximo",
            "estado": "proximo_vencer"
          }
        ]
      },
      {
        "id": "lupulo-cascade",
        "nombre": "Lúpulo Cascade",
        "marca": "HopMaster",
        "stockTotal": 54,
        "stockMinimo": 10,
        "lotesActivos": 2,
        "lotes": [
          {
            "id": "L004",
            "numeroLote": "MP-2024-201",
            "cantidadInicial": 40,
            "cantidadDisponible": 30,
            "fechaIngreso": "2025-01-10",
            "fechaVencimiento": "2025-07-18",
            "proveedor": "HopMaster Arg",
            "costoTotal": 18000,
            "descripcion": "Lúpulo americano para amargor y aroma",
            "estado": "disponible"
          },
          {
            "id": "L005",
            "numeroLote": "MP-2024-178",
            "cantidadInicial": 30,
            "cantidadDisponible": 24,
            "fechaIngreso": "2024-11-28",
            "fechaVencimiento": "2025-05-30",
            "estado": "disponible"
          }
        ]
      }
    ]
  },
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
  {
    "id": "levadura",
    "nombre": "Levadura",
    "categoria": "Perecedero",
    "unidadMedida": "kg",
    "stockTotal": 45,
    "stockMinimo": 10,
    "insumos": [
      {
        "id": "levadura-ale",
        "nombre": "Levadura Ale Americana",
        "marca": "Fermentis",
        "stockTotal": 28,
        "stockMinimo": 5,
        "lotesActivos": 3,
        "lotes": [
          {
            "id": "L014",
            "numeroLote": "MP-2024-156",
            "cantidadInicial": 20,
            "cantidadDisponible": 15,
            "fechaIngreso": "2024-10-20",
            "fechaVencimiento": "2025-04-20",
            "proveedor": "Fermentis Sudamérica",
            "costoTotal": 24000,
            "descripcion": "Levadura seca activa US-05, fermentación limpia",
            "estado": "disponible"
          },
          {
            "id": "L015",
            "numeroLote": "MP-2024-134",
            "cantidadInicial": 10,
            "cantidadDisponible": 8,
            "fechaIngreso": "2024-08-28",
            "fechaVencimiento": "2025-02-28",
            "proveedor": "Fermentis Sudamérica",
            "costoTotal": 11500,
            "descripcion": "Vencimiento próximo - usar en próximas producciones",
            "estado": "proximo_vencer"
          },
          {
            "id": "L016",
            "numeroLote": "MP-2024-089",
            "cantidadInicial": 8,
            "cantidadDisponible": 5,
            "fechaIngreso": "2024-07-30",
            "fechaVencimiento": "2025-01-30",
            "proveedor": "Fermentis Sudamérica",
            "costoTotal": 9200,
            "descripcion": "USO URGENTE - Vence en pocos días",
            "estado": "proximo_vencer"
          }
        ]
      },
      {
        "id": "levadura-lager",
        "nombre": "Levadura Lager",
        "marca": "Lallemand",
        "stockTotal": 17,
        "stockMinimo": 5,
        "lotesActivos": 2,
        "lotes": [
          {
            "id": "L017",
            "numeroLote": "MP-2024-167",
            "cantidadInicial": 12,
            "cantidadDisponible": 10,
            "fechaIngreso": "2024-11-15",
            "fechaVencimiento": "2025-05-15",
            "proveedor": "Lallemand Argentina",
            "costoTotal": 15600,
            "descripcion": "Levadura W-34/70 para lagers alemanas",
            "estado": "disponible"
          },
          {
            "id": "L018",
            "numeroLote": "MP-2024-145",
            "cantidadInicial": 10,
            "cantidadDisponible": 7,
            "fechaIngreso": "2024-09-25",
            "fechaVencimiento": "2025-03-25",
            "proveedor": "Lallemand Argentina",
            "costoTotal": 12800,
            "estado": "disponible"
          }
        ]
      }
    ]
  },
  {
    "id": "botellas",
    "nombre": "Botellas",
    "categoria": "Envases",
    "unidadMedida": "unidades",
    "stockTotal": 15600,
    "stockMinimo": 2000,
    "insumos": [
      {
        "id": "botella-330ml-ambar",
        "nombre": "Botella 330ml Ámbar",
        "marca": "Verallia",
        "stockTotal": 9800,
        "stockMinimo": 1200,
        "lotesActivos": 3,
        "lotes": [
          {
            "id": "L019",
            "numeroLote": "ENV-2024-501",
            "cantidadInicial": 4500,
            "cantidadDisponible": 4500,
            "fechaIngreso": "2025-01-10",
            "fechaVencimiento": null,
            "proveedor": "Verallia Argentina",
            "costoTotal": 180000,
            "descripcion": "Botellas ámbar retornable, protección UV",
            "estado": "disponible"
          },
          {
            "id": "L020",
            "numeroLote": "ENV-2024-489",
            "cantidadInicial": 4000,
            "cantidadDisponible": 3200,
            "fechaIngreso": "2024-12-20",
            "fechaVencimiento": null,
            "proveedor": "Verallia Argentina",
            "costoTotal": 156000,
            "estado": "disponible"
          },
          {
            "id": "L021",
            "numeroLote": "ENV-2024-467",
            "cantidadInicial": 3000,
            "cantidadDisponible": 2100,
            "fechaIngreso": "2024-11-05",
            "fechaVencimiento": null,
            "proveedor": "Verallia Argentina",
            "costoTotal": 114000,
            "estado": "disponible"
          }
        ]
      },
      {
        "id": "botella-500ml-ambar",
        "nombre": "Botella 500ml Ámbar",
        "marca": "Owens Illinois",
        "stockTotal": 4200,
        "stockMinimo": 600,
        "lotesActivos": 2,
        "lotes": [
          {
            "id": "L022",
            "numeroLote": "ENV-2024-523",
            "cantidadInicial": 2400,
            "cantidadDisponible": 2400,
            "fechaIngreso": "2025-01-15",
            "fechaVencimiento": null,
            "proveedor": "Owens Illinois SA",
            "costoTotal": 132000,
            "descripcion": "Formato premium para línea especial",
            "estado": "disponible"
          },
          {
            "id": "L023",
            "numeroLote": "ENV-2024-512",
            "cantidadInicial": 2500,
            "cantidadDisponible": 1800,
            "fechaIngreso": "2024-12-28",
            "fechaVencimiento": null,
            "proveedor": "Owens Illinois SA",
            "costoTotal": 132500,
            "estado": "disponible"
          }
        ]
      }
    ]
  },
  {
    "id": "chapas",
    "nombre": "Chapas",
    "categoria": "Envases",
    "unidadMedida": "unidades",
    "stockTotal": 22450,
    "stockMinimo": 3000,
    "insumos": [
      {
        "id": "chapa-26mm-dorada",
        "nombre": "Chapa 26mm Dorada",
        "marca": "Crown Holdings",
        "stockTotal": 18000,
        "stockMinimo": 2000,
        "lotesActivos": 3,
        "lotes": [
          {
            "id": "L026",
            "numeroLote": "ENV-2024-601",
            "cantidadInicial": 10000,
            "cantidadDisponible": 10000,
            "fechaIngreso": "2025-01-12",
            "fechaVencimiento": null,
            "proveedor": "Crown Holdings Latam",
            "costoTotal": 80000,
            "descripcion": "Chapas con logo impreso de la marca",
            "estado": "disponible"
          },
          {
            "id": "L027",
            "numeroLote": "ENV-2024-589",
            "cantidadInicial": 6000,
            "cantidadDisponible": 5500,
            "fechaIngreso": "2024-12-18",
            "fechaVencimiento": null,
            "proveedor": "Crown Holdings Latam",
            "costoTotal": 47000,
            "estado": "disponible"
          },
          {
            "id": "L028",
            "numeroLote": "ENV-2024-567",
            "cantidadInicial": 4000,
            "cantidadDisponible": 2500,
            "fechaIngreso": "2024-11-22",
            "fechaVencimiento": null,
            "proveedor": "Crown Holdings Latam",
            "costoTotal": 30000,
            "estado": "disponible"
          }
        ]
      }
    ]
  }
]

export function getInsumoById(id) {
  return new Promise((resolve) => {
    
      const insumo = INSUMOS_DETALLE.find((i) => i.id === id);
      resolve(insumo || null);
   
  });
}

