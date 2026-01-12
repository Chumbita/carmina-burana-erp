

export default function Header({ onToggleSidebar }) {
  return (
    <header className="h-14 border-b flex items-center px-4">
      <button onClick={onToggleSidebar}>
        ☰
      </button>
    </header>
  );
}
