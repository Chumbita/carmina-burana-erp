export default function Sidebar({ collapsed }) {
  return (
    <aside
      className={`h-full bg-muted transition-all ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-4 font-bold">
        {collapsed ? "CB" : "Carmina Burana"}
      </div>
    </aside>
  );
}
