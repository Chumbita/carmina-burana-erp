// Definición centralizada de las rutas de la API
export const ENDPOINTS = {
    // Auth
    AUTH: {
        LOGIN: '/auth/login'
    },
    // Inputs
    INPUTS: {
        GET_ALL: '/inputs/',
        CREATE: '/inputs/',
        DELETE: (id) => `/inputs/${id}`
    },
}