export const emptySupplier = {
  name: '',
  email: '',
  phone: '',
  address: '',
}

export function cleanSupplier(data) {
  return {
    name: data.name.trim(),
    email: data.email.trim() || null,
    phone: data.phone.trim() || null,
    address: data.address.trim() || null,
  }
}
