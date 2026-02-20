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
}