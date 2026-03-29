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
    // Audit Logs
    AUDIT_LOGS: {
        GET_BY_ENTITY: (entity_type, entity_id) => `/audit-logs/${entity_type}/${entity_id}`,
        GET_BY_USER: (user_id) => `/audit-logs/user/${user_id}`,
    },
}