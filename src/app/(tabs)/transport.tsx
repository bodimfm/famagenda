import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Car, MapPin, Clock, ArrowRight, ArrowLeft, Plus, Map, Pencil } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useFamilyStore } from '@/lib/store';
import { TransportMap } from '@/components/TransportMap';
import * as Haptics from 'expo-haptics';

const DAYS_FULL = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado'];
const DAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

export default function TransportScreen() {
  const router = useRouter();
  const [showMap, setShowMap] = useState(false);
  const pickups = useFamilyStore((s) => s.pickups);
  const members = useFamilyStore((s) => s.members);

  const today = new Date().getDay();

  // Get adult members (those who are marked as responsible for any pickup)
  const adultMemberIds = useMemo(() => {
    const ids = new Set<string>();
    pickups.forEach((p) => ids.add(p.responsibleMemberId));
    // Also include members marked as adult
    members.forEach((m) => {
      if (m.isAdult) ids.add(m.id);
    });
    return ids;
  }, [pickups, members]);

  const groupedByDay = useMemo(() => {
    const grouped: Record<number, typeof pickups> = {};
    for (let i = 0; i < 7; i++) {
      grouped[i] = pickups.filter((p) => p.dayOfWeek === i);
    }
    return grouped;
  }, [pickups]);

  const todayPickups = groupedByDay[today] || [];

  const getMemberById = (id: string) => members.find((m) => m.id === id);

  const handleEditPickup = (pickupId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/modal?type=transport&editId=${pickupId}`);
  };

  return (
    <View className="flex-1 bg-cream">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Today's Schedule */}
        <View className="px-5 pt-4">
          <View className="flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-darkNavy font-bold text-xl">Hoje, quem busca?</Text>
              <Text className="text-darkNavy/60 text-sm">{DAYS_FULL[today]}</Text>
            </View>
            <View className="flex-row space-x-2">
              <Pressable
                className="bg-darkNavy p-3 rounded-full"
                onPress={() => setShowMap(true)}
              >
                <Map size={20} color="white" />
              </Pressable>
              <Pressable
                className="bg-teal p-3 rounded-full"
                onPress={() => router.push('/modal?type=transport')}
              >
                <Plus size={20} color="white" />
              </Pressable>
            </View>
          </View>

          {todayPickups.length > 0 ? (
            todayPickups.map((pickup, index) => {
              const responsible = getMemberById(pickup.responsibleMemberId);
              return (
                <Animated.View
                  key={pickup.id}
                  entering={FadeInRight.delay(index * 100).springify()}
                  className="mb-3"
                >
                  <Pressable
                    onPress={() => handleEditPickup(pickup.id)}
                    className="bg-white rounded-2xl p-4 shadow-sm active:opacity-80"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center flex-1">
                        <View
                          className={`w-12 h-12 rounded-full items-center justify-center ${
                            pickup.type === 'dropoff' ? 'bg-sage/20' : 'bg-coral/20'
                          }`}
                        >
                          {pickup.type === 'dropoff' ? (
                            <ArrowRight size={24} color="#8FB096" />
                          ) : (
                            <ArrowLeft size={24} color="#E8927C" />
                          )}
                        </View>
                        <View className="ml-3 flex-1">
                          <Text className="text-darkNavy font-bold text-base">
                            {pickup.type === 'dropoff' ? 'Levar' : 'Buscar'} {pickup.childName}
                          </Text>
                          <View className="flex-row items-center mt-1">
                            <MapPin size={14} color="#9CA3AF" />
                            <Text className="text-gray-400 text-sm ml-1">{pickup.location}</Text>
                          </View>
                        </View>
                      </View>
                      <View className="items-end">
                        <View className="flex-row items-center">
                          <Clock size={14} color="#1B7C7C" />
                          <Text className="text-teal font-semibold ml-1">{pickup.time}</Text>
                        </View>
                        {responsible && (
                          <View
                            className="mt-2 px-2 py-1 rounded-full flex-row items-center"
                            style={{ backgroundColor: responsible.color + '20' }}
                          >
                            <Text style={{ color: responsible.color }} className="text-xs font-medium">
                              {responsible.name}
                            </Text>
                            <Pencil size={10} color={responsible.color} style={{ marginLeft: 4 }} />
                          </View>
                        )}
                      </View>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })
          ) : (
            <View className="bg-white/50 rounded-2xl p-6 items-center">
              <Car size={32} color="#9CA3AF" />
              <Text className="text-gray-400 mt-2">Nenhum transporte hoje</Text>
            </View>
          )}
        </View>

        {/* Weekly Overview */}
        <View className="px-5 mt-6 mb-8">
          <Text className="text-darkNavy font-bold text-lg mb-4">Semana</Text>

          {DAYS_SHORT.map((day, dayIndex) => {
            const dayPickups = groupedByDay[dayIndex] || [];
            const isToday = dayIndex === today;

            if (dayPickups.length === 0) return null;

            return (
              <View
                key={dayIndex}
                className={`mb-4 p-4 rounded-2xl ${isToday ? 'bg-teal/10' : 'bg-white'}`}
              >
                <View className="flex-row items-center mb-3">
                  <Text
                    className={`font-bold ${isToday ? 'text-teal' : 'text-darkNavy'}`}
                  >
                    {day}
                  </Text>
                  {isToday && (
                    <View className="ml-2 bg-teal px-2 py-0.5 rounded-full">
                      <Text className="text-white text-xs font-medium">Hoje</Text>
                    </View>
                  )}
                </View>

                {dayPickups.map((pickup) => {
                  const responsible = getMemberById(pickup.responsibleMemberId);
                  return (
                    <Pressable
                      key={pickup.id}
                      onPress={() => handleEditPickup(pickup.id)}
                      className="flex-row items-center py-2 border-b border-gray-100 last:border-b-0 active:opacity-70"
                    >
                      <View
                        className={`w-8 h-8 rounded-full items-center justify-center ${
                          pickup.type === 'dropoff' ? 'bg-sage/20' : 'bg-coral/20'
                        }`}
                      >
                        {pickup.type === 'dropoff' ? (
                          <ArrowRight size={16} color="#8FB096" />
                        ) : (
                          <ArrowLeft size={16} color="#E8927C" />
                        )}
                      </View>
                      <View className="flex-1 ml-3">
                        <Text className="text-darkNavy text-sm">
                          {pickup.type === 'dropoff' ? 'Levar' : 'Buscar'} {pickup.childName}
                        </Text>
                      </View>
                      <Text className="text-gray-400 text-sm mr-2">{pickup.time}</Text>
                      {responsible && (
                        <View
                          className="w-6 h-6 rounded-full items-center justify-center"
                          style={{ backgroundColor: responsible.color }}
                        >
                          <Text className="text-white text-xs font-bold">{responsible.avatar}</Text>
                        </View>
                      )}
                      <Pencil size={12} color="#9CA3AF" style={{ marginLeft: 8 }} />
                    </Pressable>
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Transport Map */}
      <TransportMap visible={showMap} onClose={() => setShowMap(false)} />
    </View>
  );
}
