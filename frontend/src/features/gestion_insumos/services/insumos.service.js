let INSUMOS = [
{
      id: 1,
      nombre: "Malta",
      categoria: "Perecedero",
      unidadMedida: "kg",
      stockMinimo:23,
      stockTotal: 120
    },
    {
      id: 2,
      nombre: "Harina",
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

