import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

// Componentes shadcn
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { Button } from "@/components/ui/Button";
import { ScrollArea } from "@/components/ui/ScrollArea";

// Iconoa
import { Bell, X } from "lucide-react";
import { notificationService } from "./notificationService";

export default function NotificationsDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
      setError("");
    } catch {
      setError("No se pudieron cargar las notificaciones");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (key) => {
    setNotifications(
      (current) => current.map((n) => (n.key === key ? { ...n, read: true } : n))
    );
    try {
      await notificationService.markRead(key);
    } catch {
      setError("No se pudo marcar la notificación");
    }
  };

  const markAllAsRead = async () => {
    setNotifications((current) => current.map((n) => ({ ...n, read: true })));
    try {
      await notificationService.markAllRead();
    } catch {
      setError("No se pudieron marcar las notificaciones");
    }
  };

  const deleteNotification = async (key) => {
    setNotifications((current) => current.filter((n) => n.key !== key));
    try {
      await notificationService.dismiss(key);
    } catch {
      setError("No se pudo ocultar la notificación");
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "alert":
        return "bg-red-100 text-red-800";
      case "info":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "warning":
        return "Advertencia";
      case "alert":
        return "Alerta";
      case "info":
        return "Info";
      default:
        return "Notificación";
    }
  };

  return (
    <DropdownMenu onOpenChange={(open) => open && loadNotifications()}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative cursor-pointer">
          <Bell
            className={`h-5 w-5 ${
              unreadCount > 0 ? "text-gray-600" : "text-gray-600"
            }`}
          />

          {/* Badge con contador animado */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-red-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-96 p-0">
        {/* Header del dropdown */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-sm">Notificaciones</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700"
              onClick={markAllAsRead}
            >
              Marcar todas como leídas
            </Button>
          )}
        </div>

        {/* Lista de notificaciones */}
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 px-4 text-center">
              <p className="text-sm text-gray-500">Cargando notificaciones...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 px-4 text-center">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No hay notificaciones</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.key}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    !notification.read ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Indicador de no leída */}
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                    )}

                    <div className="flex-1 min-w-0">
                      {/* Título y badge de tipo */}
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${getTypeBadge(
                            notification.type
                          )}`}
                        >
                          {getTypeLabel(notification.type)}
                        </span>
                      </div>

                      {/* Mensaje */}
                      <p className="text-sm text-gray-600 mb-2">
                        {notification.message}
                      </p>

                      {/* Footer con tiempo y acciones */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </span>
                        <div className="flex gap-2">
                          {notification.href && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700"
                              asChild
                            >
                              <Link
                                to={notification.href}
                                onClick={() => markAsRead(notification.key)}
                              >
                                Ver detalle
                              </Link>
                            </Button>
                          )}
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700"
                              onClick={() => markAsRead(notification.key)}
                            >
                              Marcar como leída
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0"
                            onClick={() => deleteNotification(notification.key)}
                          >
                            <X className="h-3 w-3 text-gray-400 hover:text-gray-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer con link a ver todas */}
        {notifications.length > 0 && (
          <div className="p-3 border-t text-center">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-sm text-blue-600 hover:text-blue-700"
              asChild
            >
              <Link to="/notificaciones">Ver todas las notificaciones</Link>
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
