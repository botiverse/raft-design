import { useState, type FormEvent } from "react";
import { useServerStore, type Server } from "../../store/serverStore";
import { useAuthStore } from "../../store/authStore";
import Banner from "../ui/Banner";
import CenteredCardFrame from "./CenteredCardFrame";
import { AuthPageIntro } from "./AuthPageFrame";
import FormField from "../ui/FormField";
import SlugInput from "../ui/SlugInput";

interface ServerSelectorProps {
  onSelect: (server: Server) => void;
}

export default function ServerSelector({ onSelect }: ServerSelectorProps) {
  const servers = useServerStore((s) => s.servers);
  const createServer = useServerStore((s) => s.createServer);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const hasServers = servers.length > 0;

  const [view, setView] = useState<"choose" | "create">(() => hasServers ? "choose" : "create");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState("");

  const toSlug = (value: string) =>
    value.toLowerCase().replace(/[^a-z0-9-]/g, "-");

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const server = await createServer(name, slug);
      onSelect(server);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create server");
    }
  };

  if (view === "create") {
    const isFirstServer = !hasServers;

    return (
      <CenteredCardFrame>
        <div className="w-full">
          <AuthPageIntro
            title={isFirstServer ? "Create your first server" : "Create server"}
            description={isFirstServer ? (
              <>A server is your shared space for people, agents, channels, and computers.</>
            ) : undefined}
          />

          <form onSubmit={handleCreate} className="space-y-3">
            {error && (
              <Banner intent="warning" className="font-bold">
                {error}
              </Banner>
            )}
            <FormField label="Server name" labelStyle="plain">
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slugTouched) setSlug(toSlug(e.target.value));
                }}
                className="input-brutal w-full p-2"
                placeholder="My Team"
                autoFocus
                required
              />
            </FormField>
            <FormField label="URL slug" labelStyle="plain">
              <SlugInput
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(toSlug(e.target.value));
                }}
                placeholder="my-team"
                required
              />
            </FormField>
            <div className="flex gap-2 pt-1">
              {hasServers && (
                <button
                  type="button"
                  onClick={() => {
                    setView("choose");
                    setName("");
                    setSlug("");
                    setSlugTouched(false);
                    setError("");
                  }}
                  className="btn-brutal flex-1 bg-white px-4 py-2 text-sm font-bold"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="btn-brutal flex-1 bg-brutal-pink px-4 py-2 text-sm font-bold"
              >
                Create Server
              </button>
            </div>
          </form>
          {isFirstServer && user && (
            <p className="mt-3 text-center text-xs text-black/55">
              Signed in as <span className="font-bold text-black/70">{user.email}</span>.{" "}
              <button
                type="button"
                onClick={logout}
                className="font-bold underline hover:text-black"
              >
                Not you? Sign out
              </button>
            </p>
          )}
        </div>
      </CenteredCardFrame>
    );
  }

  return (
    <CenteredCardFrame>
      <div className="w-full">
        <AuthPageIntro
          title="Choose server"
          description={user ? (
            <>Signed in as <span className="font-bold">{user.name}</span></>
          ) : undefined}
        />

        {servers.length > 0 && (
          <div
            data-testid="server-selector-list"
            className="mb-6 space-y-2"
          >
            {servers.map((server) => (
              <button
                key={server.id}
                onClick={() => onSelect(server)}
                className="w-full border-2 border-black bg-white p-3 text-left font-bold shadow-brutal-sm transition-all duration-100 hover:-translate-y-[1px] hover:shadow-brutal active:translate-x-[2px] active:translate-y-[2px] active:shadow-brutal-active"
              >
                <div>{server.name}</div>
                <div className="text-sm font-normal text-black/40">/{server.slug}</div>
              </button>
            ))}
          </div>
        )}

        <button
          onClick={() => setView("create")}
          className="btn-brutal w-full bg-brutal-yellow px-3 py-2 text-sm"
        >
          + Create New Server
        </button>
        <div className="mt-3 text-center">
          <button
            onClick={logout}
            className="text-sm font-bold text-black/50 underline hover:text-black"
          >
            Sign Out
          </button>
        </div>
      </div>
    </CenteredCardFrame>
  );
}
