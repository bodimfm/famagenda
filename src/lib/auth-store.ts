import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
}

export interface FamilyGroup {
  id: string;
  name: string;
  inviteCode: string;
  createdBy: string;
  members: string[]; // user IDs
}

export interface PendingInvite {
  id: string;
  familyGroupId: string;
  familyGroupName: string;
  invitedBy: string;
  invitedByName: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  familyGroup: FamilyGroup | null;
  pendingInvites: PendingInvite[];

  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;

  // Family group actions
  createFamilyGroup: (name: string) => void;
  joinFamilyGroup: (inviteCode: string) => Promise<boolean>;
  generateInviteCode: () => string;
  sendInvite: (email: string) => void;
  acceptInvite: (inviteId: string) => void;
  declineInvite: (inviteId: string) => void;
  removeFamilyMember: (userId: string) => void;
  leaveFamilyGroup: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);
const generateInviteCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

const COLORS = ['#1B7C7C', '#6FA899', '#0D3B5C', '#E8A0BF', '#F59E0B', '#8B5CF6'];

// Simulated user database (in production, this would be a real backend)
const mockUsers: Record<string, { password: string; user: User }> = {};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      familyGroup: null,
      pendingInvites: [],

      login: async (email: string, password: string) => {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        const stored = mockUsers[email.toLowerCase()];
        if (stored && stored.password === password) {
          set({ user: stored.user, isAuthenticated: true });
          return true;
        }

        // Check if user exists in persisted storage (for demo purposes)
        const state = get();
        if (state.user?.email.toLowerCase() === email.toLowerCase()) {
          set({ isAuthenticated: true });
          return true;
        }

        return false;
      },

      register: async (name: string, email: string, password: string) => {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        const normalizedEmail = email.toLowerCase();

        if (mockUsers[normalizedEmail]) {
          return false; // User already exists
        }

        const newUser: User = {
          id: generateId(),
          name,
          email: normalizedEmail,
          avatar: name.charAt(0).toUpperCase(),
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        };

        mockUsers[normalizedEmail] = { password, user: newUser };

        set({ user: newUser, isAuthenticated: true });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      createFamilyGroup: (name: string) => {
        const state = get();
        if (!state.user) return;

        const newGroup: FamilyGroup = {
          id: generateId(),
          name,
          inviteCode: generateInviteCode(),
          createdBy: state.user.id,
          members: [state.user.id],
        };

        set({ familyGroup: newGroup });
      },

      joinFamilyGroup: async (inviteCode: string) => {
        const state = get();
        if (!state.user) return false;

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // In production, this would validate against a real backend
        // For demo, we'll create a mock group if code format is valid
        if (inviteCode.length === 6) {
          const mockGroup: FamilyGroup = {
            id: generateId(),
            name: 'Familia',
            inviteCode: inviteCode.toUpperCase(),
            createdBy: 'other-user',
            members: ['other-user', state.user.id],
          };

          set({ familyGroup: mockGroup });
          return true;
        }

        return false;
      },

      generateInviteCode: () => {
        const state = get();
        if (!state.familyGroup) return '';

        const newCode = generateInviteCode();
        set({
          familyGroup: {
            ...state.familyGroup,
            inviteCode: newCode,
          },
        });
        return newCode;
      },

      sendInvite: (email: string) => {
        const state = get();
        if (!state.user || !state.familyGroup) return;

        // In production, this would send an email
        // For demo, we just log it
        console.log(`Invite sent to ${email} for family ${state.familyGroup.name}`);
      },

      acceptInvite: (inviteId: string) => {
        const state = get();
        const invite = state.pendingInvites.find((i) => i.id === inviteId);

        if (invite) {
          // In production, this would join the actual family group
          set({
            pendingInvites: state.pendingInvites.filter((i) => i.id !== inviteId),
          });
        }
      },

      declineInvite: (inviteId: string) => {
        set((state) => ({
          pendingInvites: state.pendingInvites.filter((i) => i.id !== inviteId),
        }));
      },

      removeFamilyMember: (userId: string) => {
        const state = get();
        if (!state.familyGroup) return;

        set({
          familyGroup: {
            ...state.familyGroup,
            members: state.familyGroup.members.filter((id) => id !== userId),
          },
        });
      },

      leaveFamilyGroup: () => {
        set({ familyGroup: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        familyGroup: state.familyGroup,
        pendingInvites: state.pendingInvites,
      }),
    }
  )
);
