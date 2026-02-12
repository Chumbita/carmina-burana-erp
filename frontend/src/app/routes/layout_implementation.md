
## Cómo Usar el Layout en Nuevas Vistas

### **Paso 1: Crear la página**

Crea el componente de página en la carpeta correspondiente, ejemplo:

```jsx
// src/features/inventario/pages/InputsPage.jsx
export default function InputsPage() {
  return (
    <div>
      <h1>Gestión de Insumos</h1>
      <p>Contenido de la página de insumos...</p>
    </div>
  )
}
```
**Importante:** NO incluyas el layout en la página. El layout se aplica automáticamente.



### **Paso 2: Registrar la ruta**

Agrega tu ruta en `src/routes/index.jsx`:

```jsx
// Importa las páginas con lazy loading
const InputsPage = lazy(() => import("@/features/inventario/pages/InputsPage"))

export const router = createBrowserRouter([
  {
    element: <AppLayout />, // Layout envuelve todas estas rutas
    children: [
      {
        path: "/dashboard",
        element: <DashboardPage />,
      },
      {
        path: "/inventario/insumos",
        element: <InputsPage />, // 👈 nueva página
      },
      
    ],
  },
  {
    path: "/",
    element: <Navigate to="/dashboard" />,
  },
])
```

### **Paso 3**

La página ahora se renderiza automáticamente dentro del layout.

---


## Configuración de Rutas

### **Rutas protegidas (con layout)**

Todas las rutas dentro del `children` de `AppLayout` tendrán el layout aplicado:

```jsx
{
  element: <AppLayout />,
  children: [
    { path: "/dashboard", element: <DashboardPage /> },
    { path: "/produccion/cocciones", element: <CoccionesPage /> },
    { path: "/inventario/insumos", element: <InputsPage /> },
    // ... todas las rutas..
  ],
}
```

### **Rutas sin layout (públicas)**

Para rutas que NO deben tener el layout (como login):

```jsx
{
  path: "/auth/login",
  element: <LoginPage />, // 👈 Sin layout
},
```

### **Redirecciones**

```jsx
{
  path: "/",
  element: <Navigate to="/dashboard" />,
},
{
  path: "*",
  element: <NotFoundPage />,
},
```


---