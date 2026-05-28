import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Link2, Mail, X } from "lucide-react";
import { validateEmailAddress } from "@slock-ai/shared";
import { useServerStore } from "../../store/serverStore";
import { useAppNavigate } from "../../hooks/useAppNavigate";
import api from "../../api/client";
import Modal from "../Modal";
import Banner from "../ui/Banner";

interface JoinLinkRecord {
  id: string;
  token: string;
}

export default function InviteHumanDialog({
  onClose,
}: {
  onClose: () => void;
}) {
  const server = useServerStore((s) => s.current);
  const nav = useAppNavigate();
  const [emails, setEmails] = useState(["", "", ""]);
  const [joinLink, setJoinLink] = useState<JoinLinkRecord | null>(null);
  const [linkLoading, setLinkLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const joinUrl = useMemo(() => {
    if (!joinLink) return "";
    return `${window.location.origin}/join/${joinLink.token}`;
  }, [joinLink]);

  useEffect(() => {
    if (!server) return;
    let cancelled = false;
    setLinkLoading(true);
    setError("");
    void (async () => {
      try {
        const { data: links } = await api.get(`/servers/${server.id}/join-links`);
        const existing = Array.isArray(links) ? links[0] as JoinLinkRecord | undefined : undefined;
        if (existing) {
          if (!cancelled) setJoinLink(existing);
          return;
        }
        const { data } = await api.post(`/servers/${server.id}/join-links`, {
          maxUses: null,
          expiresAt: null,
        });
        if (!cancelled) setJoinLink(data.link);
      } catch (err: unknown) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        if (!cancelled) setError(axiosErr.response?.data?.error || "Failed to prepare join link");
      } finally {
        if (!cancelled) setLinkLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [server]);

  const handleCopy = async () => {
    if (!joinUrl) return;
    await navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!server) return;
    const targets = emails.map((email) => email.trim()).filter(Boolean);
    if (targets.length === 0) {
      setError("Enter at least one email, or copy the join link above.");
      return;
    }
    setError("");
    for (const target of targets) {
      const emailError = validateEmailAddress(target);
      if (emailError) {
        setError(emailError);
        return;
      }
    }
    setSending(true);
    try {
      await Promise.all(targets.map((email) => api.post(`/servers/${server.id}/invites`, { email })));
      onClose();
      nav.toSettings("server");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      setError(axiosErr.response?.data?.error || "Failed to send invites");
      setSending(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="w-full max-w-sm card-brutal p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold uppercase">Invite Human</h2>
          <button onClick={onClose} className="btn-brutal-sm bg-white p-1">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Banner intent="warning" className="font-bold">
              {error}
            </Banner>
          )}

          <div>
            <label className="mb-1 block text-sm font-bold text-black uppercase tracking-wide">
              Join link
            </label>
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1 border-2 border-black bg-white px-2 py-2 font-mono text-xs truncate select-all">
                {linkLoading ? "Preparing join link…" : joinUrl || "Join link unavailable"}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!joinUrl || linkLoading}
                className="btn-brutal-sm shrink-0 bg-white p-2 disabled:opacity-50"
                title="Copy join link"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-black/50">
              <Link2 size={12} />
              Anyone with this link can join this server.
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-bold text-black uppercase tracking-wide">
              Emails
            </label>
            <div className="space-y-2">
              {emails.map((email, index) => (
                <input
                  // Fixed three rows for v0.
                  key={index}
                  type="email"
                  value={email}
                  onChange={(e) => setEmails((prev) => prev.map((value, idx) => idx === index ? e.target.value : value))}
                  className="input-brutal w-full"
                  placeholder={index === 0 ? "teammate@example.com" : "optional"}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-brutal bg-white px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="btn-brutal bg-brutal-pink px-4 py-2 text-sm flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Mail size={14} />
              {sending ? "Sending…" : "Send invites"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
