/**
 * Serviço de sincronização com Supabase
 * Mantém autenticação simples local, mas sincroniza dados com o banco
 */

import { supabase, TABLES } from './supabase';
import type {
  DbEvent,
  DbPickup,
  DbShoppingItem,
  DbWishlistItem,
  DbImportantDate,
  DbCustomList,
  DbCustomListItem,
  DbPet,
  DbPetVaccine,
  DbPetBath,
} from './supabase';

// ==================== EVENTOS ====================

export async function syncEvents(familyId: number) {
  const data = await supabase.select<DbEvent>(TABLES.events, `family_id=eq.${familyId}&order=start_time.asc`);
  return data;
}

export async function createEvent(event: Omit<DbEvent, 'id' | 'created_at' | 'updated_at'>) {
  return await supabase.insert<DbEvent>(TABLES.events, event);
}

export async function updateEvent(id: number, updates: Partial<DbEvent>) {
  return await supabase.update<DbEvent>(TABLES.events, String(id), updates);
}

export async function deleteEvent(id: number) {
  return await supabase.delete(TABLES.events, String(id));
}

// ==================== TRANSPORTE (PICKUPS) ====================

export async function syncPickups(familyId: number) {
  const data = await supabase.select<DbPickup>(TABLES.pickups, `family_id=eq.${familyId}&order=day_of_week.asc,time.asc`);
  return data;
}

export async function createPickup(pickup: Omit<DbPickup, 'id' | 'created_at' | 'updated_at'>) {
  return await supabase.insert<DbPickup>(TABLES.pickups, pickup);
}

export async function updatePickup(id: number, updates: Partial<DbPickup>) {
  return await supabase.update<DbPickup>(TABLES.pickups, String(id), updates);
}

export async function deletePickup(id: number) {
  return await supabase.delete(TABLES.pickups, String(id));
}

// ==================== COMPRAS ====================

export async function syncShoppingItems(listId: number) {
  const data = await supabase.select<DbShoppingItem>(TABLES.shoppingItems, `list_id=eq.${listId}&order=created_at.desc`);
  return data;
}

export async function createShoppingItem(item: Omit<DbShoppingItem, 'id' | 'created_at' | 'updated_at'>) {
  return await supabase.insert<DbShoppingItem>(TABLES.shoppingItems, item);
}

export async function updateShoppingItem(id: number, updates: Partial<DbShoppingItem>) {
  return await supabase.update<DbShoppingItem>(TABLES.shoppingItems, String(id), updates);
}

export async function deleteShoppingItem(id: number) {
  return await supabase.delete(TABLES.shoppingItems, String(id));
}

// ==================== LISTA DE DESEJOS ====================

export async function syncWishlistItems(familyId: number) {
  const data = await supabase.select<DbWishlistItem>(TABLES.wishlistItems, `family_id=eq.${familyId}&order=priority.desc,created_at.desc`);
  return data;
}

export async function createWishlistItem(item: Omit<DbWishlistItem, 'id' | 'created_at' | 'updated_at'>) {
  return await supabase.insert<DbWishlistItem>(TABLES.wishlistItems, item);
}

export async function updateWishlistItem(id: number, updates: Partial<DbWishlistItem>) {
  return await supabase.update<DbWishlistItem>(TABLES.wishlistItems, String(id), updates);
}

export async function deleteWishlistItem(id: number) {
  return await supabase.delete(TABLES.wishlistItems, String(id));
}

// ==================== DATAS IMPORTANTES ====================

export async function syncImportantDates(familyId: number) {
  const data = await supabase.select<DbImportantDate>(TABLES.importantDates, `family_id=eq.${familyId}&order=date.asc`);
  return data;
}

export async function createImportantDate(date: Omit<DbImportantDate, 'id' | 'created_at' | 'updated_at'>) {
  return await supabase.insert<DbImportantDate>(TABLES.importantDates, date);
}

export async function updateImportantDate(id: number, updates: Partial<DbImportantDate>) {
  return await supabase.update<DbImportantDate>(TABLES.importantDates, String(id), updates);
}

export async function deleteImportantDate(id: number) {
  return await supabase.delete(TABLES.importantDates, String(id));
}

// ==================== LISTAS PERSONALIZADAS ====================

export async function syncCustomLists(familyId: number) {
  const data = await supabase.select<DbCustomList>(TABLES.customLists, `family_id=eq.${familyId}&order=created_at.desc`);
  return data;
}

export async function createCustomList(list: Omit<DbCustomList, 'id' | 'created_at' | 'updated_at'>) {
  return await supabase.insert<DbCustomList>(TABLES.customLists, list);
}

export async function updateCustomList(id: number, updates: Partial<DbCustomList>) {
  return await supabase.update<DbCustomList>(TABLES.customLists, String(id), updates);
}

export async function deleteCustomList(id: number) {
  return await supabase.delete(TABLES.customLists, String(id));
}

// Itens de listas personalizadas
export async function syncCustomListItems(listId: number) {
  const data = await supabase.select<DbCustomListItem>(TABLES.customListItems, `list_id=eq.${listId}&order=created_at.asc`);
  return data;
}

export async function createCustomListItem(item: Omit<DbCustomListItem, 'id' | 'created_at' | 'updated_at'>) {
  return await supabase.insert<DbCustomListItem>(TABLES.customListItems, item);
}

export async function updateCustomListItem(id: number, updates: Partial<DbCustomListItem>) {
  return await supabase.update<DbCustomListItem>(TABLES.customListItems, String(id), updates);
}

export async function deleteCustomListItem(id: number) {
  return await supabase.delete(TABLES.customListItems, String(id));
}

// ==================== PETS ====================

export async function syncPets(familyId: number) {
  const data = await supabase.select<DbPet>(TABLES.pets, `family_id=eq.${familyId}&order=name.asc`);
  return data;
}

export async function createPet(pet: Omit<DbPet, 'id' | 'created_at' | 'updated_at'>) {
  return await supabase.insert<DbPet>(TABLES.pets, pet);
}

export async function updatePet(id: number, updates: Partial<DbPet>) {
  return await supabase.update<DbPet>(TABLES.pets, String(id), updates);
}

export async function deletePet(id: number) {
  return await supabase.delete(TABLES.pets, String(id));
}

// Vacinas
export async function syncPetVaccines(petId: number) {
  const data = await supabase.select<DbPetVaccine>(TABLES.petVaccines, `pet_id=eq.${petId}&order=date.desc`);
  return data;
}

export async function createPetVaccine(vaccine: Omit<DbPetVaccine, 'id' | 'created_at'>) {
  return await supabase.insert<DbPetVaccine>(TABLES.petVaccines, vaccine);
}

export async function deletePetVaccine(id: number) {
  return await supabase.delete(TABLES.petVaccines, String(id));
}

// Banhos
export async function syncPetBaths(petId: number) {
  const data = await supabase.select<DbPetBath>(TABLES.petBaths, `pet_id=eq.${petId}&order=date.desc`);
  return data;
}

export async function createPetBath(bath: Omit<DbPetBath, 'id' | 'created_at'>) {
  return await supabase.insert<DbPetBath>(TABLES.petBaths, bath);
}

export async function deletePetBath(id: number) {
  return await supabase.delete(TABLES.petBaths, String(id));
}

// ==================== FAMÍLIA ====================

interface FamilyInfo {
  id: number;
  name: string;
  invite_code: string;
}

// Criar família no banco
export async function createFamilyInDb(name: string): Promise<FamilyInfo | null> {
  const inviteCode = generateInviteCode();
  const result = await supabase.insert<FamilyInfo>(TABLES.families, {
    name,
    invite_code: inviteCode,
  });
  return result;
}

// Buscar família por código de convite
export async function findFamilyByCode(inviteCode: string): Promise<FamilyInfo | null> {
  const data = await supabase.select<FamilyInfo>(TABLES.families, `invite_code=eq.${inviteCode.toUpperCase()}`);
  return data[0] || null;
}

// Gerar código de convite
function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// ==================== SINCRONIZAÇÃO COMPLETA ====================

export interface SyncResult {
  success: boolean;
  error?: string;
}

// Sincronizar todos os dados de uma família
export async function syncAllFamilyData(familyId: number) {
  try {
    const [events, pickups, importantDates, customLists, pets] = await Promise.all([
      syncEvents(familyId),
      syncPickups(familyId),
      syncImportantDates(familyId),
      syncCustomLists(familyId),
      syncPets(familyId),
    ]);

    return {
      success: true,
      data: {
        events,
        pickups,
        importantDates,
        customLists,
        pets,
      },
    };
  } catch (error) {
    console.error('Sync error:', error);
    return {
      success: false,
      error: 'Erro ao sincronizar dados.',
    };
  }
}
