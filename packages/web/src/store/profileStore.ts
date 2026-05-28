import { create } from "zustand";

interface ProfileState {
  /** Type of profile currently open */
  profileType: "agent" | "human" | null;
  /** ID of the entity whose profile is open */
  profileId: string | null;
  /** Timestamp when the profile was last opened, used to decide view-stack ordering */
  openedAt: number;

  /** Open a profile panel */
  openProfile: (type: "agent" | "human", id: string) => void;
  /** Close the profile panel */
  closeProfile: () => void;
}

export const useProfileStore = create<ProfileState>((set) => ({
  profileType: null,
  profileId: null,
  openedAt: 0,

  openProfile: (type, id) => {
    set({ profileType: type, profileId: id, openedAt: Date.now() });
  },

  closeProfile: () => {
    set({ profileType: null, profileId: null });
  },
}));
