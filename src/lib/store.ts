import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface FamilyMember {
  id: string;
  name: string;
  color: string;
  avatar: string; // initials
  isAdult?: boolean; // true for adults who can edit transport
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO string
  time?: string;
  membersInvolved: string[]; // member IDs
  description?: string;
  type: 'event' | 'appointment' | 'activity';
}

export interface PickupDropoff {
  id: string;
  childName: string;
  responsibleMemberId: string;
  type: 'pickup' | 'dropoff';
  location: string;
  time: string;
  dayOfWeek: number; // 0-6, Sunday-Saturday
  recurring: boolean;
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity?: number;
  completed: boolean;
  addedBy: string; // member ID
  category: 'grocery' | 'household' | 'other';
}

export interface WishlistItem {
  id: string;
  name: string;
  description?: string;
  price?: string;
  link?: string;
  addedBy: string; // member ID
  priority: 'low' | 'medium' | 'high';
}

export interface ImportantDate {
  id: string;
  title: string;
  date: string; // MM-DD format for recurring, or ISO for specific year
  recurring: boolean;
  type: 'birthday' | 'anniversary' | 'holiday' | 'other';
  memberId?: string;
}

export interface CustomListItem {
  id: string;
  text: string;
  completed: boolean;
  addedBy?: string;
  createdAt: string;
}

export interface PetVaccine {
  id: string;
  petId: string;
  name: string;
  type: string;
  date: string;
  nextDate?: string;
  notes?: string;
}

export interface PetBath {
  id: string;
  petId: string;
  date: string;
  location?: string;
  notes?: string;
}

export interface Pet {
  id: string;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'fish' | 'rabbit' | 'hamster' | 'other';
  breed?: string;
  birthDate?: string;
  color: string;
  photo?: string;
  vaccines: PetVaccine[];
  baths: PetBath[];
  createdAt: string;
}

export interface CustomList {
  id: string;
  name: string;
  icon: string;
  color: string;
  items: CustomListItem[];
  createdAt: string;
}

interface FamilyStore {
  // Family members
  members: FamilyMember[];
  addMember: (member: Omit<FamilyMember, 'id'>) => void;
  removeMember: (id: string) => void;

  // Calendar events
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<Omit<CalendarEvent, 'id'>>) => void;
  removeEvent: (id: string) => void;
  toggleEventMember: (eventId: string, memberId: string) => void;

  // Pickup/Dropoff
  pickups: PickupDropoff[];
  addPickup: (pickup: Omit<PickupDropoff, 'id'>) => void;
  updatePickup: (id: string, updates: Partial<Omit<PickupDropoff, 'id'>>) => void;
  removePickup: (id: string) => void;

  // Shopping
  shoppingItems: ShoppingItem[];
  addShoppingItem: (item: Omit<ShoppingItem, 'id'>) => void;
  toggleShoppingItem: (id: string) => void;
  removeShoppingItem: (id: string) => void;
  clearCompletedShopping: () => void;

  // Wishlist
  wishlistItems: WishlistItem[];
  addWishlistItem: (item: Omit<WishlistItem, 'id'>) => void;
  removeWishlistItem: (id: string) => void;

  // Important dates
  importantDates: ImportantDate[];
  addImportantDate: (date: Omit<ImportantDate, 'id'>) => void;
  removeImportantDate: (id: string) => void;

  // Custom lists
  customLists: CustomList[];
  addCustomList: (list: Omit<CustomList, 'id' | 'items' | 'createdAt'>) => void;
  removeCustomList: (id: string) => void;
  updateCustomList: (id: string, updates: Partial<Pick<CustomList, 'name' | 'icon' | 'color'>>) => void;
  addCustomListItem: (listId: string, text: string, addedBy?: string) => void;
  toggleCustomListItem: (listId: string, itemId: string) => void;
  removeCustomListItem: (listId: string, itemId: string) => void;
  clearCompletedCustomListItems: (listId: string) => void;

  // Pets
  pets: Pet[];
  addPet: (pet: Omit<Pet, 'id' | 'vaccines' | 'baths' | 'createdAt'>) => void;
  updatePet: (id: string, updates: Partial<Omit<Pet, 'id' | 'vaccines' | 'baths' | 'createdAt'>>) => void;
  removePet: (id: string) => void;
  addPetVaccine: (petId: string, vaccine: Omit<PetVaccine, 'id' | 'petId'>) => void;
  removePetVaccine: (petId: string, vaccineId: string) => void;
  addPetBath: (petId: string, bath: Omit<PetBath, 'id' | 'petId'>) => void;
  removePetBath: (petId: string, bathId: string) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 15);

// Default family members
const defaultMembers: FamilyMember[] = [];

// Sample data
const sampleEvents: CalendarEvent[] = [];

const samplePickups: PickupDropoff[] = [];

const sampleShopping: ShoppingItem[] = [
  { id: '1', name: 'Arroz', quantity: 2, completed: false, addedBy: '', category: 'grocery' },
  { id: '2', name: 'Feijão', quantity: 2, completed: false, addedBy: '', category: 'grocery' },
  { id: '3', name: 'Leite', quantity: 6, completed: false, addedBy: '', category: 'grocery' },
  { id: '4', name: 'Pão de forma', quantity: 1, completed: false, addedBy: '', category: 'grocery' },
  { id: '5', name: 'Ovos', quantity: 2, completed: false, addedBy: '', category: 'grocery' },
  { id: '6', name: 'Frango', quantity: 1, completed: false, addedBy: '', category: 'grocery' },
  { id: '7', name: 'Carne moída', quantity: 1, completed: false, addedBy: '', category: 'grocery' },
  { id: '8', name: 'Macarrão', quantity: 3, completed: false, addedBy: '', category: 'grocery' },
  { id: '9', name: 'Molho de tomate', quantity: 2, completed: false, addedBy: '', category: 'grocery' },
  { id: '10', name: 'Queijo', quantity: 1, completed: false, addedBy: '', category: 'grocery' },
  { id: '11', name: 'Presunto', quantity: 1, completed: false, addedBy: '', category: 'grocery' },
  { id: '12', name: 'Banana', quantity: 1, completed: false, addedBy: '', category: 'grocery' },
  { id: '13', name: 'Maçã', quantity: 1, completed: false, addedBy: '', category: 'grocery' },
  { id: '14', name: 'Alface', quantity: 1, completed: false, addedBy: '', category: 'grocery' },
  { id: '15', name: 'Tomate', quantity: 1, completed: false, addedBy: '', category: 'grocery' },
  { id: '16', name: 'Cebola', quantity: 1, completed: false, addedBy: '', category: 'grocery' },
  { id: '17', name: 'Alho', quantity: 1, completed: false, addedBy: '', category: 'grocery' },
  { id: '18', name: 'Óleo', quantity: 1, completed: false, addedBy: '', category: 'grocery' },
  { id: '19', name: 'Açúcar', quantity: 1, completed: false, addedBy: '', category: 'grocery' },
  { id: '20', name: 'Café', quantity: 1, completed: false, addedBy: '', category: 'grocery' },
  { id: '21', name: 'Detergente', quantity: 2, completed: false, addedBy: '', category: 'household' },
  { id: '22', name: 'Sabão em pó', quantity: 1, completed: false, addedBy: '', category: 'household' },
  { id: '23', name: 'Papel higiênico', quantity: 1, completed: false, addedBy: '', category: 'household' },
  { id: '24', name: 'Esponja', quantity: 1, completed: false, addedBy: '', category: 'household' },
];

const sampleWishlist: WishlistItem[] = [];

const sampleDates: ImportantDate[] = [];

export const useFamilyStore = create<FamilyStore>()(
  persist(
    (set) => ({
      members: defaultMembers,
      events: sampleEvents,
      pickups: samplePickups,
      shoppingItems: sampleShopping,
      wishlistItems: sampleWishlist,
      importantDates: sampleDates,
      customLists: [],

      addMember: (member) =>
        set((state) => ({
          members: [...state.members, { ...member, id: generateId() }],
        })),

      removeMember: (id) =>
        set((state) => ({
          members: state.members.filter((m) => m.id !== id),
        })),

      addEvent: (event) =>
        set((state) => ({
          events: [...state.events, { ...event, id: generateId() }],
        })),

      updateEvent: (id, updates) =>
        set((state) => ({
          events: state.events.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),

      removeEvent: (id) =>
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        })),

      toggleEventMember: (eventId, memberId) =>
        set((state) => ({
          events: state.events.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  membersInvolved: e.membersInvolved.includes(memberId)
                    ? e.membersInvolved.filter((m) => m !== memberId)
                    : [...e.membersInvolved, memberId],
                }
              : e
          ),
        })),

      addPickup: (pickup) =>
        set((state) => ({
          pickups: [...state.pickups, { ...pickup, id: generateId() }],
        })),

      updatePickup: (id, updates) =>
        set((state) => ({
          pickups: state.pickups.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      removePickup: (id) =>
        set((state) => ({
          pickups: state.pickups.filter((p) => p.id !== id),
        })),

      addShoppingItem: (item) =>
        set((state) => ({
          shoppingItems: [...state.shoppingItems, { ...item, id: generateId() }],
        })),

      toggleShoppingItem: (id) =>
        set((state) => ({
          shoppingItems: state.shoppingItems.map((item) =>
            item.id === id ? { ...item, completed: !item.completed } : item
          ),
        })),

      removeShoppingItem: (id) =>
        set((state) => ({
          shoppingItems: state.shoppingItems.filter((item) => item.id !== id),
        })),

      clearCompletedShopping: () =>
        set((state) => ({
          shoppingItems: state.shoppingItems.filter((item) => !item.completed),
        })),

      addWishlistItem: (item) =>
        set((state) => ({
          wishlistItems: [...state.wishlistItems, { ...item, id: generateId() }],
        })),

      removeWishlistItem: (id) =>
        set((state) => ({
          wishlistItems: state.wishlistItems.filter((item) => item.id !== id),
        })),

      addImportantDate: (date) =>
        set((state) => ({
          importantDates: [...state.importantDates, { ...date, id: generateId() }],
        })),

      removeImportantDate: (id) =>
        set((state) => ({
          importantDates: state.importantDates.filter((d) => d.id !== id),
        })),

      addCustomList: (list) =>
        set((state) => ({
          customLists: [
            ...state.customLists,
            {
              ...list,
              id: generateId(),
              items: [],
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      removeCustomList: (id) =>
        set((state) => ({
          customLists: state.customLists.filter((l) => l.id !== id),
        })),

      updateCustomList: (id, updates) =>
        set((state) => ({
          customLists: state.customLists.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        })),

      addCustomListItem: (listId, text, addedBy) =>
        set((state) => ({
          customLists: state.customLists.map((l) =>
            l.id === listId
              ? {
                  ...l,
                  items: [
                    ...l.items,
                    {
                      id: generateId(),
                      text,
                      completed: false,
                      addedBy,
                      createdAt: new Date().toISOString(),
                    },
                  ],
                }
              : l
          ),
        })),

      toggleCustomListItem: (listId, itemId) =>
        set((state) => ({
          customLists: state.customLists.map((l) =>
            l.id === listId
              ? {
                  ...l,
                  items: l.items.map((item) =>
                    item.id === itemId
                      ? { ...item, completed: !item.completed }
                      : item
                  ),
                }
              : l
          ),
        })),

      removeCustomListItem: (listId, itemId) =>
        set((state) => ({
          customLists: state.customLists.map((l) =>
            l.id === listId
              ? { ...l, items: l.items.filter((item) => item.id !== itemId) }
              : l
          ),
        })),

      clearCompletedCustomListItems: (listId) =>
        set((state) => ({
          customLists: state.customLists.map((l) =>
            l.id === listId
              ? { ...l, items: l.items.filter((item) => !item.completed) }
              : l
          ),
        })),

      // Pets
      pets: [],

      addPet: (pet) =>
        set((state) => ({
          pets: [
            ...state.pets,
            {
              ...pet,
              id: generateId(),
              vaccines: [],
              baths: [],
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      updatePet: (id, updates) =>
        set((state) => ({
          pets: state.pets.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })),

      removePet: (id) =>
        set((state) => ({
          pets: state.pets.filter((p) => p.id !== id),
        })),

      addPetVaccine: (petId, vaccine) =>
        set((state) => ({
          pets: state.pets.map((p) =>
            p.id === petId
              ? {
                  ...p,
                  vaccines: [
                    ...p.vaccines,
                    { ...vaccine, id: generateId(), petId },
                  ],
                }
              : p
          ),
        })),

      removePetVaccine: (petId, vaccineId) =>
        set((state) => ({
          pets: state.pets.map((p) =>
            p.id === petId
              ? { ...p, vaccines: p.vaccines.filter((v) => v.id !== vaccineId) }
              : p
          ),
        })),

      addPetBath: (petId, bath) =>
        set((state) => ({
          pets: state.pets.map((p) =>
            p.id === petId
              ? {
                  ...p,
                  baths: [
                    ...p.baths,
                    { ...bath, id: generateId(), petId },
                  ],
                }
              : p
          ),
        })),

      removePetBath: (petId, bathId) =>
        set((state) => ({
          pets: state.pets.map((p) =>
            p.id === petId
              ? { ...p, baths: p.baths.filter((b) => b.id !== bathId) }
              : p
          ),
        })),
    }),
    {
      name: 'family-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
