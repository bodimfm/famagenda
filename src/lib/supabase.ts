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

// Database types
export interface DbFamilyGroup {
  id: string;
  name: string;
  invite_code: string;
  created_by: string;
  created_at: string;
}

export interface DbFamilyMember {
  id: string;
  family_group_id: string;
  name: string;
  color: string;
  avatar: string;
  user_id?: string;
  created_at: string;
}

export interface DbShoppingItem {
  id: string;
  family_group_id: string;
  name: string;
  quantity?: number;
  completed: boolean;
  added_by?: string;
  category: 'grocery' | 'household' | 'other';
  created_at: string;
}

export interface DbCustomList {
  id: string;
  family_group_id: string;
  name: string;
  icon: string;
  color: string;
  created_at: string;
}

export interface DbCustomListItem {
  id: string;
  list_id: string;
  text: string;
  completed: boolean;
  added_by?: string;
  created_at: string;
}

export interface DbCalendarEvent {
  id: string;
  family_group_id: string;
  title: string;
  date: string;
  time?: string;
  description?: string;
  type: 'event' | 'appointment' | 'activity';
  members_involved: string[];
  created_at: string;
}

export interface DbImportantDate {
  id: string;
  family_group_id: string;
  title: string;
  date: string;
  recurring: boolean;
  type: 'birthday' | 'anniversary' | 'holiday' | 'other';
  member_id?: string;
  created_at: string;
}

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
