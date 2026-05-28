import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useServerStore, type CommunityServerSlug, type Server } from "../store/serverStore";
import CommunityAgreementDialog, { type CommunityAgreement } from "../components/server/CommunityAgreementDialog";

type JoinCommunityOutcome =
  | { status: "joined"; server: Server }
  | { status: "agreement_required"; agreement: CommunityAgreement }
  | { status: "error"; error: unknown; message: string };

type JoinCommunityFlowOptions = {
  onJoined?: (server: Server, slug: CommunityServerSlug) => void;
  onError?: (error: unknown, slug: CommunityServerSlug, message: string) => void;
};

function agreementFromJoinError(error: unknown): CommunityAgreement | null {
  const response = (error as { response?: { data?: { error?: string; agreement?: CommunityAgreement } } })?.response?.data;
  if ((response?.error === "agreement_required" || response?.error === "agreement_changed") && response.agreement) {
    return response.agreement;
  }
  return null;
}

export function communityJoinErrorMessage(error: unknown) {
  const typed = error as { response?: { data?: { error?: string } }; message?: string };
  return typed.response?.data?.error || typed.message || "Failed to join community server";
}

export function useJoinCommunityFlow({ onJoined, onError }: JoinCommunityFlowOptions = {}) {
  const navigate = useNavigate();
  const joinCommunityServer = useServerStore((s) => s.joinCommunityServer);
  const [joiningCommunitySlug, setJoiningCommunitySlug] = useState<CommunityServerSlug | null>(null);
  const [pendingAgreement, setPendingAgreement] = useState<CommunityAgreement | null>(null);
  const [pendingCommunitySlug, setPendingCommunitySlug] = useState<CommunityServerSlug | null>(null);

  const completeJoin = useCallback(
    (server: Server, slug: CommunityServerSlug) => {
      onJoined?.(server, slug);
      navigate(`/s/${server.slug}`);
    },
    [navigate, onJoined],
  );

  const joinCommunity = useCallback(
    async (slug: CommunityServerSlug): Promise<JoinCommunityOutcome> => {
      setJoiningCommunitySlug(slug);
      try {
        const joined = await joinCommunityServer({ slug });
        setPendingAgreement(null);
        setPendingCommunitySlug(null);
        completeJoin(joined, slug);
        return { status: "joined", server: joined };
      } catch (error: unknown) {
        const agreement = agreementFromJoinError(error);
        if (agreement) {
          setPendingCommunitySlug(slug);
          setPendingAgreement(agreement);
          return { status: "agreement_required", agreement };
        }
        const message = communityJoinErrorMessage(error);
        onError?.(error, slug, message);
        return { status: "error", error, message };
      } finally {
        setJoiningCommunitySlug(null);
      }
    },
    [completeJoin, joinCommunityServer, onError],
  );

  const agreementDialog = pendingAgreement && pendingCommunitySlug ? (
    <CommunityAgreementDialog
      agreement={pendingAgreement}
      onAgree={async (agreementId) => {
        setJoiningCommunitySlug(pendingCommunitySlug);
        try {
          const joined = await joinCommunityServer({ agreementId, slug: pendingCommunitySlug });
          const joinedSlug = pendingCommunitySlug;
          setPendingAgreement(null);
          setPendingCommunitySlug(null);
          completeJoin(joined, joinedSlug);
        } catch (error: unknown) {
          const message = communityJoinErrorMessage(error);
          onError?.(error, pendingCommunitySlug, message);
          throw error;
        } finally {
          setJoiningCommunitySlug(null);
        }
      }}
      onClose={() => {
        setPendingAgreement(null);
        setPendingCommunitySlug(null);
      }}
    />
  ) : null;

  return {
    agreementDialog,
    joiningCommunitySlug,
    joinCommunity,
  };
}
