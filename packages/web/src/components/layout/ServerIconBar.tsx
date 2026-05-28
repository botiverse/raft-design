import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useServerStore, type Server } from "../../store/serverStore";

/** Generate a deterministic color from server name */
function getServerColor(name: string): string {
  const colors = [
    "bg-brutal-pink",
    "bg-brutal-cyan",
    "bg-brutal-lime",
    "bg-brutal-orange",
    "bg-brutal-lavender",
    "bg-brutal-yellow",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  }
  return colors[Math.abs(hash) % colors.length];
}

/** Get initials from server name (1-2 chars) */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function ServerIcon({ server, isActive, onClick }: { server: Server; isActive: boolean; onClick: () => void }) {
  const color = getServerColor(server.name);
  return (
    <button
      type="button"
      onClick={onClick}
      title={server.name}
      className={`group relative flex size-12 items-center justify-center border-2 border-black font-display text-sm font-bold transition-all duration-100 ${color} ${
        isActive
          ? "shadow-brutal-sm scale-100"
          : "shadow-none opacity-70 hover:opacity-100 hover:shadow-brutal-sm"
      }`}
    >
      {getInitials(server.name)}
      {/* Active indicator */}
      {isActive && (
        <div className="absolute -left-[7px] top-1/2 -translate-y-1/2 h-5 w-[3px] bg-black rounded-r" />
      )}
    </button>
  );
}

export default function ServerIconBar() {
  const servers = useServerStore((s) => s.servers);
  const current = useServerStore((s) => s.current);
  const navigate = useNavigate();

  return (
    <div className="flex h-full w-[60px] shrink-0 flex-col items-center gap-2 border-r-2 border-black bg-brutal-cream pt-3 pb-3 overflow-y-auto">
      {servers.map((s) => (
        <ServerIcon
          key={s.id}
          server={s}
          isActive={s.id === current?.id}
          onClick={() => {
            if (s.id !== current?.id) {
              navigate(`/s/${s.slug}`);
            }
          }}
        />
      ))}

      {/* Add server button */}
      <button
        type="button"
        onClick={() => {
          localStorage.removeItem("slock_last_server_slug");
          navigate("/");
        }}
        title="Add server"
        className="flex size-12 items-center justify-center border-2 border-dashed border-black/40 text-black/40 hover:border-black hover:text-black hover:bg-white transition-colors"
      >
        <Plus size={20} />
      </button>
    </div>
  );
}
