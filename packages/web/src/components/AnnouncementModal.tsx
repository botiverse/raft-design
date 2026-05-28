import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Modal from "./Modal";
import StatusDot from "./ui/StatusDot";
import { useAnnouncementStore } from "../store/announcementStore";
import { shouldAutoDismissSlockdevAnnouncement } from "../utils/devMode";

/**
 * ============================================================================
 * Account-level announcement modal — contract
 * ============================================================================
 *
 * 1. WHEN THE MODAL APPEARS
 *    - On every page load and after login the client calls
 *      `GET /api/announcements/active`. The server returns at most ONE row:
 *      the most recently published announcement, but only if the current
 *      user has not dismissed it.
 *    - The store puts that row at `pending[0]`. The modal renders iff
 *      `pending[0]` exists AND `pending[0].pages.length > 0`.
 *    - An announcement with `pages: []` is the "clear" signal — server still
 *      returns it as the latest, but the modal renders nothing for it.
 *    - Older rows (anything other than the latest) are never resurfaced,
 *      even if they remain undismissed. There is no retracted/active flag.
 *
 * 2. HOW THE MODAL DISMISSES
 *    All of the following count as an explicit dismissal and POST
 *    `/api/announcements/:id/dismiss` for the current row:
 *      - Click the OK button (only available on the last page).
 *      - Click the ✕ close button (any page).
 *      - Click the background overlay (any page).
 *      - Press Enter while the focused page is the last page.
 *    Pressing Enter on a non-last page advances to Next instead. IME
 *    composition (`isComposing`) suppresses Enter so CJK input methods
 *    don't accidentally fire it. There is no auto-dismiss timer; closing
 *    the tab without an explicit close leaves the dismissal record alone,
 *    so the modal re-surfaces next session.
 *
 * 3. WHAT HAPPENS AFTER DISMISSAL
 *    - The dismissal is persisted as a `(userId, announcementId)` row.
 *    - The same user will not see this announcement again on any future
 *      page load, login, or device — the dismissal is account-level.
 *    - When a NEW row is published, it becomes the new latest and is shown
 *      to the user (regardless of whether they dismissed older rows).
 *    - Dismissals are scoped per-user: one user dismissing does not affect
 *      any other user.
 *
 * 4. NAVIGATION INSIDE THE MODAL
 *    - Multi-page content lives in `current.pages: { title?, body }[]`.
 *    - Back / Next buttons walk between pages without dismissing.
 *    - The Next button becomes the OK button on the last page (the same
 *      button does both jobs, just relabeled).
 *    - Page index resets to 0 whenever `current.id` changes (new
 *      announcement supersedes the old one).
 * ============================================================================
 */
export default function AnnouncementModal() {
  const pending = useAnnouncementStore((s) => s.pending);
  const dismiss = useAnnouncementStore((s) => s.dismiss);
  const current = pending[0];
  const [pageIndex, setPageIndex] = useState(0);
  const autoDismissSlockdevAnnouncement = shouldAutoDismissSlockdevAnnouncement(
    import.meta.env.VITE_DEPLOYMENT_ENV,
  );

  useEffect(() => {
    setPageIndex(0);
  }, [current?.id]);

  // Slockdev should still show the account-level popup briefly, then perform
  // the same dismissal a user would create by clicking OK. Scheduling the
  // dismiss one animation frame later lets reviewers see the popup appear,
  // while keeping the dev flow unblocked.
  useEffect(() => {
    if (!autoDismissSlockdevAnnouncement || !current || current.pages.length === 0) return;
    const frame = window.requestAnimationFrame(() => {
      void dismiss(current.id);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [autoDismissSlockdevAnnouncement, current?.id, current?.pages.length, dismiss]);

  // Enter advances Next / confirms OK while the modal is open.
  useEffect(() => {
    if (!current || current.pages.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.defaultPrevented) return;
      if (e.isComposing) return;
      e.preventDefault();
      if (pageIndex === current.pages.length - 1) {
        void dismiss(current.id);
      } else {
        setPageIndex((i) => Math.min(i + 1, current.pages.length - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current?.id, current?.pages.length, pageIndex, dismiss]);

  // An announcement with no pages is the "clear" signal — it's still the
  // latest row, but it carries no content to render.
  if (!current || current.pages.length === 0) return null;

  const totalPages = current.pages.length;
  const page = current.pages[pageIndex];
  const isLast = pageIndex === totalPages - 1;

  const handleNext = () => {
    if (isLast) {
      void dismiss(current.id);
    } else {
      setPageIndex((i) => Math.min(i + 1, totalPages - 1));
    }
  };

  const handleBack = () => setPageIndex((i) => Math.max(i - 1, 0));

  return (
    <Modal onClose={() => void dismiss(current.id)} layer={1}>
      <div className="card-brutal w-full max-w-xl flex flex-col" data-testid="announcement-modal">
        <div className="flex items-center justify-between border-b-2 border-black px-5 py-3 bg-brutal-yellow">
          <h2 className="text-lg font-bold uppercase truncate" data-testid="announcement-title">
            {current.title}
          </h2>
          <button
            type="button"
            onClick={() => void dismiss(current.id)}
            className="btn-brutal-sm bg-white p-1"
            aria-label="Dismiss"
          >
            <X size={20} />
          </button>
        </div>

        <div
          className="max-h-[60vh] overflow-y-auto px-6 py-5 text-sm leading-relaxed"
          data-testid="announcement-page-body"
        >
          {page.title && <h3 className="mt-0 mb-3 text-base font-bold uppercase">{page.title}</h3>}
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              ul: ({ children }) => <ul className="mb-2 pl-5 list-disc">{children}</ul>,
              ol: ({ children }) => <ol className="mb-2 pl-5 list-decimal">{children}</ol>,
              li: ({ children }) => <li className="mb-0.5">{children}</li>,
              a: ({ children, href }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" className="underline font-medium">
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className="px-1 border border-black bg-white text-[0.85em] font-mono rounded-sm">
                  {children}
                </code>
              ),
              h1: ({ children }) => <h1 className="text-base font-bold uppercase mt-3 mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-bold uppercase mt-3 mb-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-bold uppercase mt-3 mb-2">{children}</h3>,
            }}
          >
            {page.body}
          </ReactMarkdown>
        </div>

        <div className="flex items-center justify-between gap-3 border-t-2 border-black px-5 py-3 bg-white">
          <div className="flex items-center gap-1">
            {totalPages > 1 &&
              Array.from({ length: totalPages }).map((_, i) => (
                <StatusDot
                  key={i}
                  size="sm"
                  tone={i === pageIndex ? "bg-black" : "bg-white"}
                  aria-hidden="true"
                />
              ))}
            {totalPages > 1 && (
              <span className="ml-2 font-mono text-xs text-black/60" data-testid="announcement-page-indicator">
                {pageIndex + 1} / {totalPages}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {totalPages > 1 && pageIndex > 0 && (
              <button
                type="button"
                onClick={handleBack}
                className="btn-brutal bg-white px-4 py-2 text-sm inline-flex items-center gap-1"
                data-testid="announcement-back"
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              className="btn-brutal bg-brutal-pink px-4 py-2 text-sm font-bold inline-flex items-center gap-1"
              data-testid={isLast ? "announcement-ok" : "announcement-next"}
            >
              {isLast ? "OK" : (<>Next <ChevronRight size={14} /></>)}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
