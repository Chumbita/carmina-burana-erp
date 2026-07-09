// Definición centralizada de las rutas de la API
export const ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: '/auth/login'
    },
    // User
    USER: {
        CHANGE_PASSWORD: '/user/change-password'
    },
    // Inputs
    INPUTS: {
        GET_ALL: '/inputs/',
        GET_BY_ID: (input_id) => `/inputs/${input_id}`,
        CREATE: '/inputs/',
        DELETE: (input_id) => `/inputs/${input_id}`,
        PATCH: (input_id) => `/inputs/${input_id}`,
    },
    // Input Entries (Supply Entry)
    INPUT_ENTRIES: {
        GET_ALL: '/inputs-entries/',
        GET_BY_ID: (entry_id) => `/inputs-entries/${entry_id}`,
        CREATE: '/inputs-entries/',
        CANCEL: (entry_id) => `/inputs-entries/${entry_id}/cancel`,
    },
    // Supply Entries
    SUPPLY_ENTRIES: {
        GET_ALL: '/supply-entries',
        GET_BY_ID: (entry_id) => `/supply-entries/${entry_id}`,
        CREATE: '/supply-entries',
    },
    // Audit Logs
    AUDIT_LOGS: {
        GET_BY_ENTITY: (entity_type, entity_id) => `/audit-logs/${entity_type}/${entity_id}`,
        GET_BY_USER: (user_id) => `/audit-logs/user/${user_id}`,
    },
    // Supplies
    SUPPLIES: {
        GET_ALL:          '/supplies',
        GET_BY_ID:        (id) => `/supplies/${id}`,
        CREATE:           '/supplies',
        PATCH:            (id) => `/supplies/${id}`,
        DELETE:           (id) => `/supplies/${id}`,
        GET_TRANSACTIONS: (id) => `/supplies/${id}/transactions`,
    },
    // Brands
    BRANDS: {
        GET_ALL: '/brands/',
    },
    // Suppliers
    SUPPLIERS: {
        OPTIONS: '/suppliers/options',
        GET_BY_NAME: (name) => `/suppliers?name=${encodeURIComponent(name)}`,
        CREATE: '/suppliers',
    },
    // UOM
    UOMS: {
        GET_OPTIONS: '/uom/options',
    },
}
