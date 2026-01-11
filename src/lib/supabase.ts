import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY || '';

// Simple Supabase REST client
class SupabaseClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(url: string, key: string) {
    this.baseUrl = url;
    this.apiKey = key;
  }

  private async request<T>(
    table: string,
    method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
    options?: {
      body?: Record<string, unknown>;
      query?: string;
      id?: string;
    }
  ): Promise<T | null> {
    try {
      let url = `${this.baseUrl}/rest/v1/${table}`;
      if (options?.query) {
        url += `?${options.query}`;
      }
      if (options?.id) {
        url += `?id=eq.${options.id}`;
      }

      const headers: Record<string, string> = {
        'apikey': this.apiKey,
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'return=representation' : 'return=minimal',
      };

      const response = await fetch(url, {
        method,
        headers,
        body: options?.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`Supabase error (${table}):`, error);
        return null;
      }

      if (method === 'DELETE' || response.status === 204) {
        return null;
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error(`Supabase request error (${table}):`, error);
      return null;
    }
  }

  // Generic CRUD operations
  async select<T>(table: string, query?: string): Promise<T[]> {
    const result = await this.request<T[]>(table, 'GET', { query });
    return result || [];
  }

  async insert<T>(table: string, data: Record<string, unknown>): Promise<T | null> {
    const result = await this.request<T[]>(table, 'POST', { body: data });
    return result?.[0] || null;
  }

  async update<T>(table: string, id: string, data: Record<string, unknown>): Promise<T | null> {
    const result = await this.request<T[]>(table, 'PATCH', { id, body: data });
    return result?.[0] || null;
  }

  async delete(table: string, id: string): Promise<boolean> {
    await this.request(table, 'DELETE', { id });
    return true;
  }

  // Check if Supabase is configured
  isConfigured(): boolean {
    return Boolean(SUPABASE_URL && SUPABASE_KEY);
  }
}

export const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_KEY);

// Database types - Todas as tabelas usam prefixo fa_

// Usuários
export interface DbUser {
  id: number;
  open_id: string;
  name?: string;
  email?: string;
  login_method?: string;
  role: string;
  created_at: string;
  updated_at: string;
  last_signed_in: string;
}

// Famílias
export interface DbFamily {
  id: number;
  name: string;
  invite_code: string;
  created_at: string;
  updated_at: string;
}

// Membros da família (vínculo entre usuário e família)
export interface DbFamilyMember {
  id: number;
  family_id: number;
  user_id: number;
  role: string; // 'admin' | 'member'
  relation?: string; // 'pai', 'mãe', 'filho', etc.
  avatar_url?: string;
  created_at: string;
}

// Eventos do calendário
export interface DbEvent {
  id: number;
  family_id: number;
  title: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
  is_for_all: number; // 0 ou 1
  created_by: number;
  created_at: string;
  updated_at: string;
}

// Participantes de eventos
export interface DbEventParticipant {
  id: number;
  event_id: number;
  member_id: number;
  created_at: string;
}

// Transporte (levar/buscar)
export interface DbPickup {
  id: number;
  family_id: number;
  child_name: string;
  responsible_member_id: number;
  type: 'pickup' | 'dropoff';
  location: string;
  time: string;
  day_of_week: number; // 0-6
  recurring: boolean;
  created_at: string;
  updated_at: string;
}

// Listas de compras
export interface DbShoppingList {
  id: number;
  family_id: number;
  name: string;
  is_wishlist: number; // 0 ou 1
  created_at: string;
  updated_at: string;
}

// Itens de compras
export interface DbShoppingItem {
  id: number;
  list_id: number;
  name: string;
  quantity?: string;
  category?: string;
  priority: string;
  status: string;
  added_by: number;
  purchased_by?: number;
  created_at: string;
  updated_at: string;
}

// Itens da lista de desejos
export interface DbWishlistItem {
  id: number;
  family_id: number;
  name: string;
  description?: string;
  price?: string;
  link?: string;
  added_by?: number;
  priority: 'low' | 'medium' | 'high';
  purchased: boolean;
  purchased_by?: number;
  purchased_at?: string;
  created_at: string;
  updated_at: string;
}

// Datas importantes
export interface DbImportantDate {
  id: number;
  family_id: number;
  title: string;
  type: string;
  date: string;
  recurrence: string;
  reminder_minutes?: number;
  member_id?: number;
  created_at: string;
  updated_at: string;
}

// Listas personalizadas
export interface DbCustomList {
  id: number;
  family_id: number;
  name: string;
  icon: string;
  color: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

// Itens de listas personalizadas
export interface DbCustomListItem {
  id: number;
  list_id: number;
  text: string;
  completed: boolean;
  added_by?: number;
  completed_by?: number;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

// Pets
export interface DbPet {
  id: number;
  family_id: number;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'fish' | 'rabbit' | 'hamster' | 'other';
  breed?: string;
  birth_date?: string;
  color: string;
  photo_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Vacinas de pets
export interface DbPetVaccine {
  id: number;
  pet_id: number;
  name: string;
  type?: string;
  date: string;
  next_date?: string;
  veterinarian?: string;
  clinic?: string;
  notes?: string;
  created_at: string;
}

// Banhos de pets
export interface DbPetBath {
  id: number;
  pet_id: number;
  date: string;
  location?: string;
  groomer?: string;
  services?: string;
  cost?: number;
  notes?: string;
  created_at: string;
}

// Nomes das tabelas (para referência)
export const TABLES = {
  users: 'fa_users',
  families: 'fa_families',
  familyMembers: 'fa_family_members',
  events: 'fa_events',
  eventParticipants: 'fa_event_participants',
  assignments: 'fa_assignments',
  assignmentDependents: 'fa_assignment_dependents',
  pickups: 'fa_pickups',
  shoppingLists: 'fa_shopping_lists',
  shoppingItems: 'fa_shopping_items',
  wishlistItems: 'fa_wishlist_items',
  importantDates: 'fa_important_dates',
  customLists: 'fa_custom_lists',
  customListItems: 'fa_custom_list_items',
  pets: 'fa_pets',
  petVaccines: 'fa_pet_vaccines',
  petBaths: 'fa_pet_baths',
} as const;

// Helper to get current family group ID from local storage
export async function getCurrentFamilyGroupId(): Promise<string | null> {
  try {
    const authData = await AsyncStorage.getItem('auth-storage');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed?.state?.familyGroup?.id || null;
    }
  } catch (error) {
    console.error('Error getting family group ID:', error);
  }
  return null;
}
