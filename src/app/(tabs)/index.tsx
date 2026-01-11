import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, ChevronLeft, ChevronRight, Users, Sparkles, ShoppingCart, Syringe, Droplets, Car } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFamilyStore, CalendarEvent, FamilyMember, Pet, PetVaccine, PetBath, PickupDropoff } from '@/lib/store';
import { useAuthStore } from '@/lib/auth-store';
import { syncAndHydrateStore } from '@/lib/supabase-sync';
import { AIPanoramaModal } from '@/components/AIPanoramaModal';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function MemberAvatar({ member, size = 'sm' }: { member: FamilyMember; size?: 'sm' | 'md' }) {
  const sizeClass = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm';
  return (
    <View
      className={`${sizeClass} rounded-full items-center justify-center`}
      style={{ backgroundColor: member.color }}
    >
      <Text className="text-white font-bold" style={{ fontSize: size === 'sm' ? 10 : 12 }}>
        {member.avatar}
      </Text>
    </View>
  );
}

function EventCard({ event, members, index, onPress }: { event: CalendarEvent; members: FamilyMember[]; index: number; onPress?: () => void }) {
  const eventMembers = members.filter(m => event.membersInvolved.includes(m.id));
  const eventDate = new Date(event.date);

  const typeColors: Record<string, readonly [string, string]> = {
    event: ['#1B7C7C', '#2FA8A8'] as const,
    appointment: ['#0D3B5C', '#1B5A7D'] as const,
    activity: ['#6FA899', '#8FB5A9'] as const,
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
      <Pressable className="mb-3 active:scale-98" onPress={onPress}>
        <LinearGradient
          colors={typeColors[event.type] ?? typeColors.event}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 16, padding: 16 }}
        >
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-white font-bold text-lg">{event.title}</Text>
              <Text className="text-white/80 mt-1">
                {eventDate.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
                {event.time && ` • ${event.time}`}
              </Text>
            </View>
            <View className="flex-row -space-x-2">
              {eventMembers.map((member) => (
                <View
                  key={member.id}
                  className="w-8 h-8 rounded-full border-2 border-white items-center justify-center"
                  style={{ backgroundColor: member.color }}
                >
                  <Text className="text-white font-bold text-xs">{member.avatar}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

// Unified agenda item type
interface AgendaItem {
  id: string;
  title: string;
  subtitle?: string;
  date: Date;
  time?: string;
  type: 'event' | 'vaccine' | 'bath' | 'shopping' | 'transport';
  color: string;
  icon: 'event' | 'vaccine' | 'bath' | 'shopping' | 'transport';
  petName?: string;
}

function AgendaItemCard({ item, index }: { item: AgendaItem; index: number }) {
  const iconMap = {
    event: Users,
    vaccine: Syringe,
    bath: Droplets,
    shopping: ShoppingCart,
    transport: Car,
  };

  const colorMap = {
    event: ['#1B7C7C', '#2FA8A8'],
    vaccine: ['#E57373', '#EF9A9A'],
    bath: ['#64B5F6', '#90CAF9'],
    shopping: ['#81C784', '#A5D6A7'],
    transport: ['#FFB74D', '#FFCC80'],
  };

  const Icon = iconMap[item.icon];
  const colors = colorMap[item.icon];

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
      <Pressable className="mb-3 active:scale-98">
        <LinearGradient
          colors={colors as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 16, padding: 16 }}
        >
          <View className="flex-row items-center">
            <View className="bg-white/20 p-2 rounded-full mr-3">
              <Icon size={20} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base">{item.title}</Text>
              {item.subtitle && (
                <Text className="text-white/80 text-sm">{item.subtitle}</Text>
              )}
              <Text className="text-white/70 text-sm mt-1">
                {item.time || item.date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })}
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

export default function AgendaScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAIPanorama, setShowAIPanorama] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const events = useFamilyStore((s) => s.events);
  const members = useFamilyStore((s) => s.members);
  const pets = useFamilyStore((s) => s.pets);
  const shoppingItems = useFamilyStore((s) => s.shoppingItems);
  const pickups = useFamilyStore((s) => s.pickups);
  const familyGroup = useAuthStore((s) => s.familyGroup);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    if (!familyGroup?.dbId) return;
    setRefreshing(true);
    await syncAndHydrateStore(familyGroup.dbId);
    setRefreshing(false);
  }, [familyGroup?.dbId]);

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  const daysInMonth = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const days: (number | null)[] = [];

    // Add empty days for padding
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(i);
    }

    return days;
  }, [currentMonth, currentYear]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getMonth() === currentMonth &&
        eventDate.getFullYear() === currentYear &&
        eventDate.getDate() === selectedDate.getDate()
      );
    });
  }, [events, currentMonth, currentYear, selectedDate]);

  // Unified agenda items: events + vaccines + baths + shopping + transport
  const allAgendaItems = useMemo(() => {
    const items: AgendaItem[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add regular events
    events.forEach((event) => {
      const eventDate = new Date(event.date);
      if (eventDate >= today) {
        items.push({
          id: `event-${event.id}`,
          title: event.title,
          subtitle: event.description,
          date: eventDate,
          time: event.time,
          type: 'event',
          color: '#1B7C7C',
          icon: 'event',
        });
      }
    });

    // Add pet vaccines (next doses)
    pets.forEach((pet) => {
      pet.vaccines.forEach((vaccine) => {
        if (vaccine.nextDate) {
          const nextDate = new Date(vaccine.nextDate);
          if (nextDate >= today) {
            items.push({
              id: `vaccine-${vaccine.id}`,
              title: `Vacina: ${vaccine.name}`,
              subtitle: `${pet.name} - ${vaccine.type}`,
              date: nextDate,
              type: 'vaccine',
              color: '#E57373',
              icon: 'vaccine',
              petName: pet.name,
            });
          }
        }
      });
    });

    // Add pet baths (show last bath + suggest next in 30 days)
    pets.forEach((pet) => {
      if (pet.baths.length > 0) {
        const sortedBaths = [...pet.baths].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        const lastBath = sortedBaths[0];
        const lastBathDate = new Date(lastBath.date);
        const nextBathDate = new Date(lastBathDate);
        nextBathDate.setDate(nextBathDate.getDate() + 30);

        if (nextBathDate >= today) {
          items.push({
            id: `bath-${pet.id}`,
            title: `Banho: ${pet.name}`,
            subtitle: `Último: ${lastBathDate.toLocaleDateString('pt-BR')}`,
            date: nextBathDate,
            type: 'bath',
            color: '#64B5F6',
            icon: 'bath',
            petName: pet.name,
          });
        }
      }
    });

    // Add shopping reminder if there are pending items
    const pendingShoppingCount = shoppingItems.filter((item) => !item.completed).length;
    if (pendingShoppingCount > 0) {
      items.push({
        id: 'shopping-reminder',
        title: `Compras Pendentes`,
        subtitle: `${pendingShoppingCount} item${pendingShoppingCount > 1 ? 's' : ''} na lista`,
        date: today,
        type: 'shopping',
        color: '#81C784',
        icon: 'shopping',
      });
    }

    // Add today's transport
    const todayDayOfWeek = today.getDay();
    const todayPickups = pickups.filter((p) => p.dayOfWeek === todayDayOfWeek);
    todayPickups.forEach((pickup) => {
      const member = members.find((m) => m.id === pickup.responsibleMemberId);
      items.push({
        id: `transport-${pickup.id}`,
        title: `${pickup.type === 'dropoff' ? 'Levar' : 'Buscar'} ${pickup.childName}`,
        subtitle: `${pickup.location}${member ? ` - ${member.name}` : ''}`,
        date: today,
        time: pickup.time,
        type: 'transport',
        color: '#FFB74D',
        icon: 'transport',
      });
    });

    // Sort by date
    return items.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events, pets, shoppingItems, pickups, members]);

  // Filter upcoming items (next 7 days)
  const upcomingAgendaItems = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    return allAgendaItems
      .filter((item) => item.date >= today && item.date <= nextWeek)
      .slice(0, 8);
  }, [allAgendaItems]);

  const upcomingEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events
      .filter((event) => new Date(event.date) >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [events]);

  // Check if day has any agenda item
  const hasEventOnDay = (day: number) => {
    const checkDate = new Date(currentYear, currentMonth, day);
    checkDate.setHours(0, 0, 0, 0);

    // Check regular events
    const hasEvent = events.some((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === currentMonth &&
        eventDate.getFullYear() === currentYear
      );
    });

    if (hasEvent) return true;

    // Check vaccine next dates
    const hasVaccine = pets.some((pet) =>
      pet.vaccines.some((v) => {
        if (!v.nextDate) return false;
        const vDate = new Date(v.nextDate);
        return (
          vDate.getDate() === day &&
          vDate.getMonth() === currentMonth &&
          vDate.getFullYear() === currentYear
        );
      })
    );

    if (hasVaccine) return true;

    // Check transport (recurring)
    const dayOfWeek = checkDate.getDay();
    const hasTransport = pickups.some((p) => p.dayOfWeek === dayOfWeek);

    return hasTransport;
  };

  const goToPrevMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    return day === selectedDate.getDate();
  };

  return (
    <View className="flex-1 bg-cream">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#1B7C7C"
            colors={['#1B7C7C']}
          />
        }
      >
        {/* Family Members Row */}
        <View className="px-5 pt-4 pb-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-darkNavy font-semibold text-base">Familia</Text>
            <View className="flex-row space-x-2">
              {members.map((member) => (
                <View key={member.id} className="items-center">
                  <MemberAvatar member={member} size="md" />
                  <Text className="text-xs text-darkNavy/60 mt-1">{member.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* AI Panorama Button */}
        <View className="px-5 pb-4">
          <Pressable
            onPress={() => setShowAIPanorama(true)}
            className="bg-gradient-to-r overflow-hidden rounded-2xl active:scale-98"
          >
            <LinearGradient
              colors={['#0D3B5C', '#1B5A7D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingVertical: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' }}
            >
              <View className="bg-white/20 p-2 rounded-full mr-3">
                <Sparkles size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base">Panorama da Familia</Text>
                <Text className="text-white/70 text-sm">Ver resumo das obrigacoes com IA</Text>
              </View>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Calendar Section */}
        <View className="bg-white mx-4 rounded-2xl p-4 shadow-sm">
          {/* Month Navigation */}
          <View className="flex-row justify-between items-center mb-4">
            <Pressable onPress={goToPrevMonth} className="p-2">
              <ChevronLeft size={24} color="#0D3B5C" />
            </Pressable>
            <Text className="text-darkNavy font-bold text-lg">
              {MONTHS[currentMonth]} {currentYear}
            </Text>
            <Pressable onPress={goToNextMonth} className="p-2">
              <ChevronRight size={24} color="#0D3B5C" />
            </Pressable>
          </View>

          {/* Day Headers */}
          <View className="flex-row mb-2">
            {DAYS.map((day) => (
              <View key={day} className="flex-1 items-center">
                <Text className="text-darkNavy/50 text-xs font-medium">{day}</Text>
              </View>
            ))}
          </View>

          {/* Calendar Grid */}
          <View className="flex-row flex-wrap">
            {daysInMonth.map((day, index) => (
              <Pressable
                key={index}
                className="w-[14.28%] aspect-square items-center justify-center"
                onPress={() => day && setSelectedDate(new Date(currentYear, currentMonth, day))}
              >
                {day && (
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      isSelected(day)
                        ? 'bg-teal'
                        : isToday(day)
                        ? 'bg-teal/20'
                        : ''
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        isSelected(day) ? 'text-white' : 'text-darkNavy'
                      }`}
                    >
                      {day}
                    </Text>
                    {hasEventOnDay(day) && !isSelected(day) && (
                      <View className="absolute bottom-1 w-1 h-1 rounded-full bg-teal" />
                    )}
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Events for Selected Day */}
        <View className="px-5 mt-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-darkNavy font-bold text-lg">
              {selectedDate.getDate()} de {MONTHS[currentMonth]}
            </Text>
            <Pressable
              className="bg-teal p-2 rounded-full"
              onPress={() => router.push(`/modal?type=event&date=${selectedDate.toISOString()}`)}
            >
              <Plus size={20} color="white" />
            </Pressable>
          </View>

          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                members={members}
                index={index}
                onPress={() => router.push(`/modal?type=event&editId=${event.id}`)}
              />
            ))
          ) : (
            <View className="bg-white/50 rounded-2xl p-6 items-center">
              <Users size={32} color="#9CA3AF" />
              <Text className="text-gray-400 mt-2">Nenhum evento neste dia</Text>
            </View>
          )}
        </View>

        {/* Upcoming Events - Integrated Agenda */}
        <View className="px-5 mt-6 mb-8">
          <Text className="text-darkNavy font-bold text-lg mb-4">Próximos Compromissos</Text>
          {upcomingAgendaItems.length > 0 ? (
            upcomingAgendaItems.map((item, index) => (
              <AgendaItemCard key={item.id} item={item} index={index} />
            ))
          ) : (
            <View className="bg-white/50 rounded-2xl p-6 items-center">
              <Users size={32} color="#9CA3AF" />
              <Text className="text-gray-400 mt-2">Nenhum compromisso próximo</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* AI Panorama Modal */}
      <AIPanoramaModal
        visible={showAIPanorama}
        onClose={() => setShowAIPanorama(false)}
      />
    </View>
  );
}
