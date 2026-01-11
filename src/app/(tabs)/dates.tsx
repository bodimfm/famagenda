import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { Heart, Cake, Gift, Calendar, Star, Plus, Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFamilyStore, ImportantDate } from '@/lib/store';
import * as Haptics from 'expo-haptics';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function DatesScreen() {
  const router = useRouter();
  const importantDates = useFamilyStore((s) => s.importantDates);
  const removeImportantDate = useFamilyStore((s) => s.removeImportantDate);
  const members = useFamilyStore((s) => s.members);

  const getMemberById = (id: string) => members.find((m) => m.id === id);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'birthday':
        return Cake;
      case 'anniversary':
        return Heart;
      case 'holiday':
        return Star;
      default:
        return Calendar;
    }
  };

  const getTypeColors = (type: string): readonly [string, string] => {
    switch (type) {
      case 'birthday':
        return ['#E8A0BF', '#1B7C7C'] as const;
      case 'anniversary':
        return ['#1B7C7C', '#E8927C'] as const;
      case 'holiday':
        return ['#F5A623', '#E8927C'] as const;
      default:
        return ['#8FB096', '#B5D4BB'] as const;
    }
  };

  const parseDate = (dateStr: string) => {
    // Format: MM-DD for recurring, or full ISO for specific
    const [month, day] = dateStr.split('-').map(Number);
    return { month: month - 1, day };
  };

  const getDaysUntil = (dateStr: string) => {
    const { month, day } = parseDate(dateStr);
    const now = new Date();
    const thisYear = now.getFullYear();

    let targetDate = new Date(thisYear, month, day);
    if (targetDate < now) {
      targetDate = new Date(thisYear + 1, month, day);
    }

    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const sortedDates = useMemo(() => {
    return [...importantDates].sort((a, b) => getDaysUntil(a.date) - getDaysUntil(b.date));
  }, [importantDates]);

  const upcomingDates = sortedDates.slice(0, 3);
  const allDates = sortedDates;

  const DateCard = ({ date, index, large = false }: { date: ImportantDate; index: number; large?: boolean }) => {
    const { month, day } = parseDate(date.date);
    const daysUntil = getDaysUntil(date.date);
    const Icon = getTypeIcon(date.type);
    const colors = getTypeColors(date.type);
    const member = date.memberId ? getMemberById(date.memberId) : null;

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()}
        className={large ? 'mb-4' : 'mr-3'}
        style={large ? {} : { width: 160 }}
      >
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 16, padding: large ? 20 : 16 }}
        >
          <View className="flex-row justify-between items-start">
            <View className="bg-white/20 w-10 h-10 rounded-full items-center justify-center">
              <Icon size={20} color="white" />
            </View>
            {large && (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  removeImportantDate(date.id);
                }}
                className="p-1"
              >
                <Trash2 size={18} color="rgba(255,255,255,0.6)" />
              </Pressable>
            )}
          </View>
          <Text className="text-white font-bold text-base mt-3" numberOfLines={2}>
            {date.title}
          </Text>
          <Text className="text-white/80 text-sm mt-1">
            {day} de {MONTHS[month]}
          </Text>
          <View className="flex-row items-center mt-2 justify-between">
            <View className="bg-white/20 px-2 py-1 rounded-full">
              <Text className="text-white text-xs font-medium">
                {daysUntil === 0 ? 'Hoje!' : daysUntil === 1 ? 'Amanha' : `${daysUntil} dias`}
              </Text>
            </View>
            {member && (
              <View
                className="w-6 h-6 rounded-full items-center justify-center border border-white/30"
                style={{ backgroundColor: member.color }}
              >
                <Text className="text-white text-xs font-bold">{member.avatar}</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1 bg-cream">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-5 pt-4 flex-row justify-between items-center">
          <View>
            <Text className="text-darkNavy font-bold text-xl">Datas Importantes</Text>
            <Text className="text-darkNavy/60 text-sm">{importantDates.length} datas salvas</Text>
          </View>
          <Pressable
            className="bg-teal p-3 rounded-full"
            onPress={() => router.push('/modal?type=date')}
          >
            <Plus size={20} color="white" />
          </Pressable>
        </View>

        {/* Upcoming Section */}
        {upcomingDates.length > 0 && (
          <View className="mt-6">
            <Text className="text-darkNavy font-bold text-lg mb-3 px-5">Proximas</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              style={{ flexGrow: 0 }}
            >
              {upcomingDates.map((date, index) => (
                <DateCard key={date.id} date={date} index={index} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* All Dates */}
        <View className="px-5 mt-6 mb-8">
          <Text className="text-darkNavy font-bold text-lg mb-3">Todas as Datas</Text>
          {allDates.length > 0 ? (
            allDates.map((date, index) => (
              <DateCard key={date.id} date={date} index={index} large />
            ))
          ) : (
            <View className="bg-white/50 rounded-2xl p-6 items-center">
              <Heart size={48} color="#9CA3AF" />
              <Text className="text-gray-400 mt-4 text-center">Nenhuma data cadastrada</Text>
              <Text className="text-gray-300 text-sm mt-1">
                Adicione aniversarios, datas especiais e mais
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
