# Frontend Carmina Burana ERP

## Estructura de carpetas

```bash
frontend/
├── public/
│   └── assets/                 # Recursos
│       ├── images/             # Imagenes
│       └── icons/              # Iconos
├── src/
│   ├── app/                    # Configuración principal de la aplicación.
│   │   ├── routes/             # Configuración de rutas usando React Router.
│   │   │   └── index.jsx       
│   │   ├── providers/          # Context providers que envuelven toda la aplicación.
│   │   └── App.tsx             # Componente raíz.
│   ├── components/             # Componentes reutilizables que se usan a través de toda la aplicación.
│   │   ├── ui/                 # Compontes de UI.
│   │   ├── forms/              # Componentes de formularios.
│   │   ├── layout/             # Componentes estructurales.
│   │   └── shared/             # Componentes generales.
│   ├── features/               # Organización de las features como módulos funcionales.
│   │   ├── featureX/           # Carpeta de la feature
│   │   │   ├── components/     # Componentes específicos y no reutilizables para esta feature. 
│   │   │   ├── hooks/          # Hooks específicos de esta feature. 
│   │   │   ├── schemas/        # Schemas de validaciones de Zod específicas para los formularios del módulo.
│   │   │   ├── services/       # Llamadas a la API.             
│   │   │   └── pages/          # Páginas específicas del módulo.
│   ├── hooks/                  # Hooks genéricos que son reutilziados en múltiples features.
│   ├── lib/                    # Utilidades y configuraciones de bajo nivel.
│   │   ├── api/                # Cliente HTTP y definición de los endpoints.
│   │   └── utils/              # Funciones auxiliares.
│   ├── styles/                 # Estilos globales de la aplicación. 
│   │   └── globals.css
│   ├── main.tsx 
├── .env                        # Variables de entorno.
├── .env.example                # Plantilla de las variables de entorno.
├── index.html
├── package.json
└── vite.config.ts
```


## 🚀 Cómo correr el proyecto

1. Instalar dependencias: `npm install`

2. Crear archivo `.env` basado en `.env.example`

3. Desplegar Frontend: `npm run dev`


## 🔗 Conexión con backend

Asegurate de que `VITE_API_URL` en `.env` apunte al backend:

Para usar las variables de entorno usar `import.meta.env.VARIABLE`