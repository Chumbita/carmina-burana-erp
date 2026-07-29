// Definición centralizada de las rutas de la API
export const ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: '/auth/login',
        REFRESH: '/auth/refresh',
        LOGOUT: '/auth/logout',
        ME: '/auth/me',
    },
    // User
    USER: {
        CHANGE_PASSWORD: '/user/change-password'
    },
    // Supply Entries
    SUPPLY_ENTRIES: {
        GET_ALL: '/supply-entries',
        GET_BY_ID: (entry_id) => `/supply-entries/${entry_id}`,
        CREATE: '/supply-entries',
        CANCEL: (entry_id) => `/supply-entries/${entry_id}/cancel`,
    },
    // Audit Logs
    AUDIT_LOGS: {
        GET_BY_ENTITY: (entity_type, entity_id) => `/audit-logs/${entity_type}/${entity_id}`,
        GET_BY_USER: (user_id) => `/audit-logs/user/${user_id}`,
    },
    // Items
    ITEMS: {
        GET_TRANSACTIONS: (id) => `/items/${id}/transactions`,
        GET_OPTIONS: '/items/options',
    },
    // Supplies
    SUPPLIES: {
        GET_ALL:   '/supplies',
        GET_BY_ID: (id) => `/supplies/${id}`,
        CREATE:    '/supplies',
        PATCH:     (id) => `/supplies/${id}`,
        DELETE:    (id) => `/supplies/${id}`,
        GET_LOTS:  (item_id) => `/supplies/${item_id}/lots`,
    },
    PACKAGING_SUPPLIES: {
        GET_BY_ID: (id) => `/packaging-supplies/${id}`,
        CREATE:    '/packaging-supplies',
        PATCH:     (id) => `/packaging-supplies/${id}`,
        DELETE:    (id) => `/packaging-supplies/${id}`,
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
    // BOM
    BOM: {
      CREATE: '/bom',
      GET_ALL: '/bom',
      GET_BY_ID: (id) => `/bom/${id}`,
    },

    // ITEMS
    ITEMS: {
      GET_OPTIONS: '/items/options',
    },
    // Beersendpoints.js

    BEERS: {
      CREATE: "/beers",
  },
    // Products
  PRODUCTS: {
    GET_ALL: "/products",
  },
  // Production Orders
  PRODUCTION_ORDERS: {
    CREATE: "/production-orders",
    GET_INCOMPLETE: "/production-orders/incomplete",
    RELEASE: (order_id) => `/production-orders/${order_id}/release`,
    START: (order_id) => `/production-orders/${order_id}/start`,
    COMPLETE: (order_id) => `/production-orders/${order_id}/complete`,
  },
  // Items
  ITEMS: {
    GET_MANUFACTURABLE: "/items/manufacturable-items",
    GET_ITEM_BOM: (item_id) => `/items/${item_id}/bom`,
  },
};
