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
  DbFamilyMember,
} from './supabase';
import { useFamilyStore } from './store';
import type {
  CalendarEvent,
  PickupDropoff,
  ShoppingItem,
  WishlistItem,
  ImportantDate,
  CustomList,
  CustomListItem,
  Pet,
  PetVaccine,
  PetBath,
  FamilyMember,
} from './store';

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
    const [events, pickups, importantDates, customLists, pets, wishlistItems] = await Promise.all([
      syncEvents(familyId),
      syncPickups(familyId),
      syncImportantDates(familyId),
      syncCustomLists(familyId),
      syncPets(familyId),
      syncWishlistItems(familyId),
    ]);

    return {
      success: true,
      data: {
        events,
        pickups,
        importantDates,
        customLists,
        pets,
        wishlistItems,
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

// ==================== MAPEAMENTO DB → STORE ====================

function mapDbEventToStore(dbEvent: DbEvent): CalendarEvent {
  return {
    id: String(dbEvent.id),
    title: dbEvent.title,
    date: dbEvent.start_time.split('T')[0], // Extract date from ISO
    time: dbEvent.start_time.split('T')[1]?.substring(0, 5), // Extract time HH:MM
    membersInvolved: [], // Would need to fetch from event_participants
    description: dbEvent.description,
    type: 'event', // Default, as DB doesn't have this field
  };
}

function mapDbPickupToStore(dbPickup: DbPickup): PickupDropoff {
  return {
    id: String(dbPickup.id),
    childName: dbPickup.child_name,
    responsibleMemberId: String(dbPickup.responsible_member_id),
    type: dbPickup.type,
    location: dbPickup.location,
    time: dbPickup.time,
    dayOfWeek: dbPickup.day_of_week,
    recurring: dbPickup.recurring,
  };
}

function mapDbWishlistItemToStore(dbItem: DbWishlistItem): WishlistItem {
  return {
    id: String(dbItem.id),
    name: dbItem.name,
    description: dbItem.description,
    price: dbItem.price,
    link: dbItem.link,
    addedBy: dbItem.added_by ? String(dbItem.added_by) : '',
    priority: dbItem.priority,
  };
}

function mapDbImportantDateToStore(dbDate: DbImportantDate): ImportantDate {
  return {
    id: String(dbDate.id),
    title: dbDate.title,
    date: dbDate.date,
    recurring: dbDate.recurrence !== 'none',
    type: dbDate.type as 'birthday' | 'anniversary' | 'holiday' | 'other',
    memberId: dbDate.member_id ? String(dbDate.member_id) : undefined,
  };
}

function mapDbCustomListItemToStore(dbItem: DbCustomListItem): CustomListItem {
  return {
    id: String(dbItem.id),
    text: dbItem.text,
    completed: dbItem.completed,
    addedBy: dbItem.added_by ? String(dbItem.added_by) : undefined,
    createdAt: dbItem.created_at,
  };
}

function mapDbCustomListToStore(dbList: DbCustomList, items: DbCustomListItem[]): CustomList {
  return {
    id: String(dbList.id),
    name: dbList.name,
    icon: dbList.icon,
    color: dbList.color,
    items: items.map(mapDbCustomListItemToStore),
    createdAt: dbList.created_at,
  };
}

function mapDbPetVaccineToStore(dbVaccine: DbPetVaccine): PetVaccine {
  return {
    id: String(dbVaccine.id),
    petId: String(dbVaccine.pet_id),
    name: dbVaccine.name,
    type: dbVaccine.type || '',
    date: dbVaccine.date,
    nextDate: dbVaccine.next_date,
    notes: dbVaccine.notes,
  };
}

function mapDbPetBathToStore(dbBath: DbPetBath): PetBath {
  return {
    id: String(dbBath.id),
    petId: String(dbBath.pet_id),
    date: dbBath.date,
    location: dbBath.location,
    notes: dbBath.notes,
  };
}

function mapDbPetToStore(dbPet: DbPet, vaccines: DbPetVaccine[], baths: DbPetBath[]): Pet {
  return {
    id: String(dbPet.id),
    name: dbPet.name,
    type: dbPet.type,
    breed: dbPet.breed,
    birthDate: dbPet.birth_date,
    color: dbPet.color,
    photo: dbPet.photo_url,
    vaccines: vaccines.filter(v => v.pet_id === dbPet.id).map(mapDbPetVaccineToStore),
    baths: baths.filter(b => b.pet_id === dbPet.id).map(mapDbPetBathToStore),
    createdAt: dbPet.created_at,
  };
}

// ==================== SINCRONIZAÇÃO E HIDRATAÇÃO DA STORE ====================

/**
 * Sincroniza dados do Supabase e atualiza a store local
 * Esta função pode ser chamada de qualquer lugar (não depende de hooks)
 */
export async function syncAndHydrateStore(familyId: number): Promise<{ success: boolean; error?: string }> {
  if (!supabase.isConfigured()) {
    console.log('Supabase não configurado, usando dados locais');
    return { success: true }; // Não é erro, apenas não sincroniza
  }

  try {
    // 1. Buscar todos os dados do banco
    const result = await syncAllFamilyData(familyId);

    if (!result.success || !result.data) {
      return { success: false, error: result.error };
    }

    const { events, pickups, importantDates, customLists, pets, wishlistItems } = result.data;

    // 2. Buscar itens de cada lista personalizada
    const customListsWithItems: CustomList[] = [];
    for (const list of customLists) {
      const items = await syncCustomListItems(list.id);
      customListsWithItems.push(mapDbCustomListToStore(list, items));
    }

    // 3. Buscar vacinas e banhos de cada pet
    const allVaccines: DbPetVaccine[] = [];
    const allBaths: DbPetBath[] = [];
    for (const pet of pets) {
      const vaccines = await syncPetVaccines(pet.id);
      const baths = await syncPetBaths(pet.id);
      allVaccines.push(...vaccines);
      allBaths.push(...baths);
    }

    // 4. Mapear e hidratar a store
    const store = useFamilyStore.getState();

    // Eventos
    store.setEvents(events.map(mapDbEventToStore));

    // Transporte
    store.setPickups(pickups.map(mapDbPickupToStore));

    // Lista de desejos
    store.setWishlistItems(wishlistItems.map(mapDbWishlistItemToStore));

    // Datas importantes
    store.setImportantDates(importantDates.map(mapDbImportantDateToStore));

    // Listas personalizadas (já com itens)
    store.setCustomLists(customListsWithItems);

    // Pets (com vacinas e banhos)
    store.setPets(pets.map(pet => mapDbPetToStore(pet, allVaccines, allBaths)));

    console.log('Sincronização concluída com sucesso');
    return { success: true };
  } catch (error) {
    console.error('Erro na sincronização:', error);
    return { success: false, error: 'Erro ao sincronizar dados' };
  }
}
