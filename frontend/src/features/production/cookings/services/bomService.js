// Simple BOM service: backend endpoint not available, return single BOM with id=2
export const bomService = {
  getAll: async () => {
    return [
      { id: 2, name: "Receta #2" },
    ]
  },
}

export default bomService
