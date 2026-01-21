let INSUMOS = [
{
      id: "malta",
      nombre: "Malta",
      categoria: "Perecedero",
      unidadMedida: "kg",
      stockMinimo:23,
      stockTotal: 120
    },
    {
      id: "lupulo",
      nombre: "Lúpulo",
      categoria:"perecedero",
      unidadMedida: "kg",
      stockMinimo: 10,
      stockTotal:200,
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
    id: "malta",
    nombre: "Malta",
    categoria: "Perecedero",
    unidadMedida: "kg",
    stockTotal: 120,
    stockMinimo: 30,
    insumos: [
      {
        id: "malta-pilsen",
        nombre: "Malta Pilsen",
        marca: "Patagonia",
        stockTotal: 80,
        stockMinimo: 40,
        lotes: [
          {
            id: "L001",
            numeroLote: "MP-2024-089",
            cantidadDisponible: 50,
            fechaVencimiento: "2025-06-15",
            estado: "disponible",
          },
        ],
      },
    ],
  },
  {
        
    id: "lupulo",
    nombre: "Lúpulo",
    categoria: "Perecedero",
    unidadMedida: "kg",
    stockTotal: 234,
    stockMinimo: 30,
    insumos: [
            {
        id: "lupulo-las-sierras",
        nombre: "Lúpulo las sierras",
        marca: "Aguila guerrera",
        stockTotal: 180,
        stockMinimo: 20,
        lotes: [
          {
            id: "L001",
            numeroLote: "MP-2024-089",
            cantidadDisponible: 50,
            fechaVencimiento: "2025-06-15",
            estado: "disponible",
          },
        ],
      },
    ],
  }
];

export function getInsumoById(id) {
  return new Promise((resolve) => {
    
      const insumo = INSUMOS_DETALLE.find((i) => i.id === id);
      resolve(insumo || null);
   
  });
}

