export const emptyBrand = {
  name: '',
}

export function cleanBrand(data) {
  return {
    name: data.name.trim(),
  }
}
