// Constants for Supply Entry functionality

export const SUPPLY_ENTRY_VIEWS = {
  FORM: 'form',
  HISTORY: 'history',
  DETAIL: 'detail'
}

export const SUPPLY_ENTRY_STATUS = {
  ACTIVE: 'active',
  ANNULLED: 'annulled'
}

export const ITEMS_PER_PAGE = 15

export const ANNULMENT_RESTRICTIONS = {
  HOURS_LIMIT: null,
}

export const getDefaultEntryDateTime = () => {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
}

export const formatSupplyEntryDateTime = (value) => {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
  if (!match) return value || ''

  const [, year, month, day, hour, minute] = match
  return `${day}/${month}/${year}, ${hour}:${minute}`
}

export const parseSupplyEntryDateTime = (value) => {
  const match = String(value || '').match(/^(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2})$/)
  if (!match) return value

  const [, day, month, year, hour, minute] = match
  return `${year}-${month}-${day}T${hour}:${minute}`
}

export const FORM_DEFAULT_VALUES = {
  supplierId: 0,
  entryDate: getDefaultEntryDateTime(),
  invoiceNumber: '',
  description: '',
  items: [
    {
      supplyId: 0,
      quantity: 1,
      unitCost: "",
      expirationDate: '',
      batchNumber: '',
      comment: '',
    }
  ],
}

export const FILTER_DEFAULTS = {
  dateFrom: '',
  dateTo: '',
  selectedSupplier: 'all',
  searchTerm: ''
}
