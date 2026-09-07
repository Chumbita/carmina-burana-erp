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
    // Notifications
    NOTIFICATIONS: {
        GET_ALL: '/notifications',
        MARK_READ: (key) => `/notifications/${encodeURIComponent(key)}/read`,
        MARK_ALL_READ: '/notifications/read-all',
        DISMISS: (key) => `/notifications/${encodeURIComponent(key)}/dismiss`,
    },
    INVENTORY: {
        DASHBOARD: '/inventory/dashboard',
    },

    // Supplies
    SUPPLIES: {
        GET_ALL:   '/supplies',
        GET_BY_ID: (id) => `/supplies/${id}`,
        CREATE:    '/supplies',
        PATCH:     (id) => `/supplies/${id}`,
        DELETE:    (id) => `/supplies/${id}`,
        GET_LOTS:  (item_id) => `/supplies/${item_id}/lots`,
        ADJUST_LOT: (item_id, lot_id) => `/supplies/${item_id}/lots/${lot_id}/adjust`,
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
        GET_BY_ID: (id) => `/brands/${id}`,
        CREATE: '/brands/',
        UPDATE: (id) => `/brands/${id}`,
        DELETE: (id) => `/brands/${id}`,
    },
    // Suppliers
    SUPPLIERS: {
        GET_ALL: '/suppliers',
        GET_BY_ID: (id) => `/suppliers/${id}`,
        OPTIONS: '/suppliers/options',
        GET_BY_NAME: (name) => `/suppliers?name=${encodeURIComponent(name)}`,
        CREATE: '/suppliers',
        UPDATE: (id) => `/suppliers/${id}`,
        DELETE: (id) => `/suppliers/${id}`,
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

    // Products
  PRODUCTS: {
    GET_ALL: "/products",
  },
  // Production Orders
  PRODUCTION_ORDERS: {
    PLAN: "/production-orders/plan",
    EXECUTE: (order_id) => `/production-orders/${order_id}/execute`,
    GET_INCOMPLETE: "/production-orders/incomplete",
    GET_HISTORY: "/production-orders/history",
    GET_BY_ID: (order_id) => `/production-orders/${order_id}`,
    UPDATE: (order_id) => `/production-orders/${order_id}`,
    CANCEL: (order_id) => `/production-orders/${order_id}/cancel`,
    DISCARD: (order_id) => `/production-orders/${order_id}/discard`,
  },
  ITEMS: {
    GET_OPTIONS: '/items/options',
    GET_TRANSACTIONS: (id) => `/items/${id}/transactions`,
    GET_MANUFACTURABLE: '/items/manufacturable-items',
    GET_ITEM_BOM: (item_id) => `/items/${item_id}/bom`,
  },
};
