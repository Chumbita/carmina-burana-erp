// EntityDetailPage.jsx
import { Spinner } from "@/components/ui/Spinner";
import { AuditLogHistory } from "@/components/shared/AuditLogHistory";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EntityDetailProvider, useEntityDetail } from "./EntityDetailContext";

function Header({ name }) {
  return (
    <header className="lg:col-span-2 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
      </div>
    </header>
  );
}

function SidebarRow({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Sidebar({ icon, children }) {
  return (
    <aside className="bg-white rounded-lg p-4 flex flex-col gap-4">
      <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center -mt-4">
        {icon}
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </aside>
  );
}


function Content({ children }) {
  return (
    <main className="border rounded-md p-4">
      {children}
    </main>
  );
}

function History({ entityType, entityId }) {
  const { refreshKey } = useEntityDetail();
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Historial de Movimientos</h2>
      <AuditLogHistory entityType={entityType} entityId={entityId} refreshKey={refreshKey} />
    </section>
  );
}

function Actions({ children }) {
  return <div className="flex items-center gap-2">{children}</div>;
}

export function EntityDetailPage({ loading, error, children }) {
  if (loading) return <div className="flex items-center justify-center h-64"><Spinner /></div>;
  if (error) return <p>Ocurrió un error al cargar.</p>;

  return (
    <EntityDetailProvider>
      <div className="grid grid-cols-1 grid-rows-[auto_auto_1fr] lg:grid-cols-[240px_1fr] lg:grid-rows-[auto_1fr] gap-6">
        {children}
      </div>
    </EntityDetailProvider>
  );
}

Sidebar.Row = SidebarRow;
EntityDetailPage.Header = Header;
EntityDetailPage.Sidebar = Sidebar;
EntityDetailPage.Content = Content;
EntityDetailPage.History = History;
EntityDetailPage.Actions = Actions;
