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
  HOURS_LIMIT: 48
}

export const FORM_DEFAULT_VALUES = {
  supplier: '',
  entryDate: new Date().toISOString().split('T')[0],
  invoiceNumber: '',
  description: '',
  items: [
    {
      inputId: 0,
      quantity: 1,
      unitCost: 0,
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