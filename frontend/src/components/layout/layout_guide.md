# Guía de Implementación del Layout

## Descripción General

Este layout proporciona la estructura base para todas las vistas del ERP de Carmina . 
Incluye:

- **Sidebar** 
- **Header** 
- **Área de contenido** 
- **Responsive design** 
- **Integración con React Router** 

---

## Componentes del Layout

### **1. AppLayout.jsx**
Componente principal que envuelve toda la aplicación con el layout base.


### **2. app-sidebar.jsx**
Sidebar (componente shadcn) con:
- Logo adaptativo (expandido/contraído)
- Navegación por secciones
- Usuario en el footer
- Estado colapsable con botón toggle

### **3. Header.jsx**
Header con:
- Botón para toggle del sidebar
- Breadcrumb dinámico basado en la ruta actual
- Sistema de notificaciones

### **4. NotificationsDropdown.jsx**
Componente independiente que maneja:
- Badge con contador de notificaciones no leídas
- Dropdown con lista de notificaciones
- Acciones: marcar como leída, eliminar

---

## Sistema de Notificaciones

### **Estado actual (temporal)**

Las notificaciones están hardcodeadas en `NotificationsDropdown.jsx` para testing:

```jsx
const [notifications, setNotifications] = useState([
  {
    id: 1,
    type: 'warning',
    title: 'Stock bajo de Malta',
    message: 'El stock de malta está por debajo del mínimo',
    time: 'Hace 5 minutos',
    read: false,
  },
  // ...
])
```

### **Próximos pasos (integración real)**

Cuando se implemente el backend, se deberá:

1. **Crear un hook personalizado:**
```jsx
// src/hooks/useNotifications.js
export function useNotifications() {
  // Fetch notificaciones desde el backend
  // Manejar estado global (Context )
  return {
    notifications,
    unreadCount,
    markAsRead,
    deleteNotification,
  }
}
```

2. **Usar el hook en el componente:**
```jsx
// NotificationsDropdown.jsx
import { useNotifications } from '@/hooks/useNotifications'

export default function NotificationsDropdown() {
  const { notifications, unreadCount, markAsRead } = useNotifications()
  // ...
}
```



### **¿Cómo agrego una nueva sección al sidebar?**

Edita el array `navMain` en `app-sidebar.jsx`:

```jsx
{
  title: "Mi Nueva Sección",
  url: "#",
  icon: MiIcono,
  items: [
    {
      title: "Subsección 1",
      url: "/mi-seccion/sub1",
    },
  ],
},
```
