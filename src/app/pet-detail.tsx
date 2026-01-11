import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Plus,
  X,
  Check,
  Syringe,
  Droplets,
  Calendar,
  Trash2,
  Dog,
  Cat,
  Bird,
  Fish,
  Rabbit,
  PawPrint,
  MapPin,
  FileText,
  Clock,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeOut, Layout } from 'react-native-reanimated';
import { useFamilyStore, Pet, PetVaccine, PetBath } from '@/lib/store';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

const VACCINE_TYPES = [
  'V8/V10',
  'Antirrábica',
  'Gripe',
  'Giárdia',
  'Leishmaniose',
  'FeLV',
  'Panleucopenia',
  'Outra',
];

const getPetIcon = (type: Pet['type']) => {
  switch (type) {
    case 'dog':
      return Dog;
    case 'cat':
      return Cat;
    case 'bird':
      return Bird;
    case 'fish':
      return Fish;
    case 'rabbit':
      return Rabbit;
    default:
      return PawPrint;
  }
};

export default function PetDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const pet = useFamilyStore((s) => s.pets.find((p) => p.id === id));
  const addPetVaccine = useFamilyStore((s) => s.addPetVaccine);
  const removePetVaccine = useFamilyStore((s) => s.removePetVaccine);
  const addPetBath = useFamilyStore((s) => s.addPetBath);
  const removePetBath = useFamilyStore((s) => s.removePetBath);

  const [activeTab, setActiveTab] = useState<'vaccines' | 'baths'>('vaccines');

  // Vaccine Modal
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [vaccineName, setVaccineName] = useState('');
  const [vaccineType, setVaccineType] = useState(VACCINE_TYPES[0]);
  const [vaccineDate, setVaccineDate] = useState('');
  const [vaccineNextDate, setVaccineNextDate] = useState('');
  const [vaccineNotes, setVaccineNotes] = useState('');

  // Bath Modal
  const [showBathModal, setShowBathModal] = useState(false);
  const [bathDate, setBathDate] = useState('');
  const [bathLocation, setBathLocation] = useState('');
  const [bathNotes, setBathNotes] = useState('');

  if (!pet) {
    return (
      <SafeAreaView className="flex-1 bg-cream items-center justify-center">
        <Text className="text-gray-400">Pet não encontrado</Text>
      </SafeAreaView>
    );
  }

  const PetIcon = getPetIcon(pet.type);

  const formatDateInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
  };

  const parseDate = (dateStr: string): string | null => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    if (day?.length !== 2 || month?.length !== 2 || year?.length !== 4) return null;
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleAddVaccine = () => {
    if (!vaccineName.trim() || !vaccineDate) return;
    const parsedDate = parseDate(vaccineDate);
    if (!parsedDate) return;

    const parsedNextDate = vaccineNextDate ? parseDate(vaccineNextDate) : undefined;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addPetVaccine(pet.id, {
      name: vaccineName.trim(),
      type: vaccineType,
      date: parsedDate,
      nextDate: parsedNextDate || undefined,
      notes: vaccineNotes.trim() || undefined,
    });

    setVaccineName('');
    setVaccineType(VACCINE_TYPES[0]);
    setVaccineDate('');
    setVaccineNextDate('');
    setVaccineNotes('');
    setShowVaccineModal(false);
  };

  const handleAddBath = () => {
    if (!bathDate) return;
    const parsedDate = parseDate(bathDate);
    if (!parsedDate) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addPetBath(pet.id, {
      date: parsedDate,
      location: bathLocation.trim() || undefined,
      notes: bathNotes.trim() || undefined,
    });

    setBathDate('');
    setBathLocation('');
    setBathNotes('');
    setShowBathModal(false);
  };

  const handleDeleteVaccine = (vaccineId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removePetVaccine(pet.id, vaccineId);
  };

  const handleDeleteBath = (bathId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removePetBath(pet.id, bathId);
  };

  const sortedVaccines = [...pet.vaccines].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const sortedBaths = [...pet.baths].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <SafeAreaView className="flex-1 bg-cream" edges={['top']}>
      {/* Header */}
      <View className="flex-row items-center px-5 py-4 border-b border-gray-100">
        <Pressable onPress={() => router.back()} className="p-2 -ml-2">
          <ArrowLeft size={24} color="#0D3B5C" />
        </Pressable>
        <View className="flex-1 ml-3">
          <Text className="text-darkNavy font-bold text-xl">{pet.name}</Text>
        </View>
      </View>

      {/* Pet Info Card */}
      <View className="mx-5 mt-4 mb-4">
        <View
          className="bg-white rounded-2xl p-4 flex-row items-center"
          style={{ borderLeftWidth: 4, borderLeftColor: pet.color }}
        >
          <View
            className="w-16 h-16 rounded-full items-center justify-center"
            style={{ backgroundColor: `${pet.color}20` }}
          >
            <PetIcon size={32} color={pet.color} />
          </View>
          <View className="flex-1 ml-4">
            <Text className="text-darkNavy font-bold text-lg">{pet.name}</Text>
            <Text className="text-gray-400 text-sm">
              {pet.breed || 'Sem raça definida'}
            </Text>
          </View>
          <View className="items-end">
            <View className="flex-row items-center">
              <Syringe size={14} color="#1B7C7C" />
              <Text className="text-teal font-semibold ml-1">{pet.vaccines.length}</Text>
            </View>
            <View className="flex-row items-center mt-1">
              <Droplets size={14} color="#64B5F6" />
              <Text className="text-blue-400 font-semibold ml-1">{pet.baths.length}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tab Switcher */}
      <View className="flex-row mx-5 mb-4 bg-white rounded-xl p-1">
        <Pressable
          onPress={() => setActiveTab('vaccines')}
          className={`flex-1 flex-row items-center justify-center py-3 rounded-lg ${
            activeTab === 'vaccines' ? 'bg-teal' : ''
          }`}
        >
          <Syringe size={18} color={activeTab === 'vaccines' ? 'white' : '#9CA3AF'} />
          <Text
            className={`ml-2 font-semibold ${
              activeTab === 'vaccines' ? 'text-white' : 'text-gray-400'
            }`}
          >
            Vacinas
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('baths')}
          className={`flex-1 flex-row items-center justify-center py-3 rounded-lg ${
            activeTab === 'baths' ? 'bg-teal' : ''
          }`}
        >
          <Droplets size={18} color={activeTab === 'baths' ? 'white' : '#9CA3AF'} />
          <Text
            className={`ml-2 font-semibold ${
              activeTab === 'baths' ? 'text-white' : 'text-gray-400'
            }`}
          >
            Banhos
          </Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {activeTab === 'vaccines' ? (
          <>
            {/* Add Vaccine Button */}
            <Pressable
              onPress={() => setShowVaccineModal(true)}
              className="bg-teal/10 border-2 border-dashed border-teal/30 rounded-xl p-3 mb-4 flex-row items-center justify-center"
            >
              <Plus size={18} color="#1B7C7C" />
              <Text className="text-teal font-medium ml-2">Adicionar Vacina</Text>
            </Pressable>

            {/* Vaccines List */}
            {sortedVaccines.length > 0 ? (
              sortedVaccines.map((vaccine, index) => (
                <Animated.View
                  key={vaccine.id}
                  entering={FadeInDown.delay(index * 60).springify()}
                  exiting={FadeOut}
                  layout={Layout.springify()}
                >
                  <View className="bg-white rounded-xl p-4 mb-3">
                    <View className="flex-row items-start">
                      <View className="w-10 h-10 rounded-full bg-teal/10 items-center justify-center">
                        <Syringe size={18} color="#1B7C7C" />
                      </View>
                      <View className="flex-1 ml-3">
                        <Text className="text-darkNavy font-bold">{vaccine.name}</Text>
                        <Text className="text-gray-400 text-sm">{vaccine.type}</Text>
                      </View>
                      <Pressable
                        onPress={() => handleDeleteVaccine(vaccine.id)}
                        className="p-2"
                        hitSlop={8}
                      >
                        <Trash2 size={16} color="#9CA3AF" />
                      </Pressable>
                    </View>
                    <View className="flex-row mt-3 pt-3 border-t border-gray-100">
                      <View className="flex-1 flex-row items-center">
                        <Calendar size={14} color="#9CA3AF" />
                        <Text className="text-gray-500 text-sm ml-1">
                          {formatDisplayDate(vaccine.date)}
                        </Text>
                      </View>
                      {vaccine.nextDate && (
                        <View className="flex-row items-center">
                          <Clock size={14} color="#E57373" />
                          <Text className="text-red-400 text-sm ml-1">
                            Próx: {formatDisplayDate(vaccine.nextDate)}
                          </Text>
                        </View>
                      )}
                    </View>
                    {vaccine.notes && (
                      <View className="flex-row items-start mt-2">
                        <FileText size={14} color="#9CA3AF" />
                        <Text className="text-gray-400 text-sm ml-1 flex-1">
                          {vaccine.notes}
                        </Text>
                      </View>
                    )}
                  </View>
                </Animated.View>
              ))
            ) : (
              <View className="items-center py-8">
                <Syringe size={40} color="#9CA3AF" />
                <Text className="text-gray-400 mt-3">Nenhuma vacina registrada</Text>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Add Bath Button */}
            <Pressable
              onPress={() => setShowBathModal(true)}
              className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl p-3 mb-4 flex-row items-center justify-center"
            >
              <Plus size={18} color="#64B5F6" />
              <Text className="text-blue-400 font-medium ml-2">Adicionar Banho</Text>
            </Pressable>

            {/* Baths List */}
            {sortedBaths.length > 0 ? (
              sortedBaths.map((bath, index) => (
                <Animated.View
                  key={bath.id}
                  entering={FadeInDown.delay(index * 60).springify()}
                  exiting={FadeOut}
                  layout={Layout.springify()}
                >
                  <View className="bg-white rounded-xl p-4 mb-3">
                    <View className="flex-row items-start">
                      <View className="w-10 h-10 rounded-full bg-blue-50 items-center justify-center">
                        <Droplets size={18} color="#64B5F6" />
                      </View>
                      <View className="flex-1 ml-3">
                        <Text className="text-darkNavy font-bold">Banho</Text>
                        <Text className="text-gray-400 text-sm">
                          {formatDisplayDate(bath.date)}
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => handleDeleteBath(bath.id)}
                        className="p-2"
                        hitSlop={8}
                      >
                        <Trash2 size={16} color="#9CA3AF" />
                      </Pressable>
                    </View>
                    {(bath.location || bath.notes) && (
                      <View className="mt-3 pt-3 border-t border-gray-100">
                        {bath.location && (
                          <View className="flex-row items-center">
                            <MapPin size={14} color="#9CA3AF" />
                            <Text className="text-gray-500 text-sm ml-1">
                              {bath.location}
                            </Text>
                          </View>
                        )}
                        {bath.notes && (
                          <View className="flex-row items-start mt-1">
                            <FileText size={14} color="#9CA3AF" />
                            <Text className="text-gray-400 text-sm ml-1 flex-1">
                              {bath.notes}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </Animated.View>
              ))
            ) : (
              <View className="items-center py-8">
                <Droplets size={40} color="#9CA3AF" />
                <Text className="text-gray-400 mt-3">Nenhum banho registrado</Text>
              </View>
            )}
          </>
        )}
        <View className="h-8" />
      </ScrollView>

      {/* Vaccine Modal */}
      <Modal
        visible={showVaccineModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowVaccineModal(false)}
      >
        <View className="flex-1 bg-cream">
          <View className="flex-row items-center justify-between px-5 pt-4 pb-4 border-b border-gray-200">
            <Pressable onPress={() => setShowVaccineModal(false)} className="p-2">
              <X size={24} color="#0D3B5C" />
            </Pressable>
            <Text className="text-darkNavy font-bold text-lg">Nova Vacina</Text>
            <Pressable
              onPress={handleAddVaccine}
              className={`p-2 rounded-full ${
                vaccineName.trim() && vaccineDate ? 'bg-teal' : 'bg-gray-200'
              }`}
            >
              <Check
                size={20}
                color={vaccineName.trim() && vaccineDate ? 'white' : '#9CA3AF'}
              />
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
            <Text className="text-darkNavy font-semibold mb-2">Nome da Vacina</Text>
            <TextInput
              value={vaccineName}
              onChangeText={setVaccineName}
              placeholder="Ex: V8, Antirrábica..."
              placeholderTextColor="#9CA3AF"
              className="bg-white rounded-xl p-4 text-darkNavy text-base mb-4"
              autoFocus
            />

            <Text className="text-darkNavy font-semibold mb-2">Tipo</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4"
              style={{ flexGrow: 0 }}
            >
              <View className="flex-row gap-2">
                {VACCINE_TYPES.map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => setVaccineType(type)}
                    className={`px-4 py-2 rounded-full ${
                      vaccineType === type ? 'bg-teal' : 'bg-white'
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        vaccineType === type ? 'text-white' : 'text-darkNavy'
                      }`}
                    >
                      {type}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <Text className="text-darkNavy font-semibold mb-2">Data da Aplicação</Text>
            <TextInput
              value={vaccineDate}
              onChangeText={(text) => setVaccineDate(formatDateInput(text))}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#9CA3AF"
              className="bg-white rounded-xl p-4 text-darkNavy text-base mb-4"
              keyboardType="numeric"
              maxLength={10}
            />

            <Text className="text-darkNavy font-semibold mb-2">
              Próxima Dose (opcional)
            </Text>
            <TextInput
              value={vaccineNextDate}
              onChangeText={(text) => setVaccineNextDate(formatDateInput(text))}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#9CA3AF"
              className="bg-white rounded-xl p-4 text-darkNavy text-base mb-4"
              keyboardType="numeric"
              maxLength={10}
            />

            <Text className="text-darkNavy font-semibold mb-2">
              Observações (opcional)
            </Text>
            <TextInput
              value={vaccineNotes}
              onChangeText={setVaccineNotes}
              placeholder="Alguma observação..."
              placeholderTextColor="#9CA3AF"
              className="bg-white rounded-xl p-4 text-darkNavy text-base mb-8"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </ScrollView>
        </View>
      </Modal>

      {/* Bath Modal */}
      <Modal
        visible={showBathModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBathModal(false)}
      >
        <View className="flex-1 bg-cream">
          <View className="flex-row items-center justify-between px-5 pt-4 pb-4 border-b border-gray-200">
            <Pressable onPress={() => setShowBathModal(false)} className="p-2">
              <X size={24} color="#0D3B5C" />
            </Pressable>
            <Text className="text-darkNavy font-bold text-lg">Novo Banho</Text>
            <Pressable
              onPress={handleAddBath}
              className={`p-2 rounded-full ${bathDate ? 'bg-teal' : 'bg-gray-200'}`}
            >
              <Check size={20} color={bathDate ? 'white' : '#9CA3AF'} />
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
            <Text className="text-darkNavy font-semibold mb-2">Data do Banho</Text>
            <TextInput
              value={bathDate}
              onChangeText={(text) => setBathDate(formatDateInput(text))}
              placeholder="DD/MM/AAAA"
              placeholderTextColor="#9CA3AF"
              className="bg-white rounded-xl p-4 text-darkNavy text-base mb-4"
              keyboardType="numeric"
              maxLength={10}
              autoFocus
            />

            <Text className="text-darkNavy font-semibold mb-2">Local (opcional)</Text>
            <TextInput
              value={bathLocation}
              onChangeText={setBathLocation}
              placeholder="Ex: Pet Shop, Em casa..."
              placeholderTextColor="#9CA3AF"
              className="bg-white rounded-xl p-4 text-darkNavy text-base mb-4"
            />

            <Text className="text-darkNavy font-semibold mb-2">
              Observações (opcional)
            </Text>
            <TextInput
              value={bathNotes}
              onChangeText={setBathNotes}
              placeholder="Alguma observação..."
              placeholderTextColor="#9CA3AF"
              className="bg-white rounded-xl p-4 text-darkNavy text-base mb-8"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
