import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import {
  Plus,
  X,
  Check,
  ChevronRight,
  Dog,
  Cat,
  Bird,
  Fish,
  Rabbit,
  Syringe,
  Droplets,
  Calendar,
  Trash2,
  PawPrint,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeOut, Layout } from 'react-native-reanimated';
import { useFamilyStore, Pet } from '@/lib/store';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

const PET_TYPES = [
  { id: 'dog', label: 'Cachorro', icon: Dog },
  { id: 'cat', label: 'Gato', icon: Cat },
  { id: 'bird', label: 'Pássaro', icon: Bird },
  { id: 'fish', label: 'Peixe', icon: Fish },
  { id: 'rabbit', label: 'Coelho', icon: Rabbit },
  { id: 'hamster', label: 'Hamster', icon: PawPrint },
  { id: 'other', label: 'Outro', icon: PawPrint },
] as const;

const COLORS = [
  '#E57373', // red
  '#FFB74D', // orange
  '#81C784', // green
  '#64B5F6', // blue
  '#BA68C8', // purple
  '#4DB6AC', // cyan
  '#F06292', // pink
  '#A1887F', // brown
];

const getPetIcon = (type: Pet['type']) => {
  const found = PET_TYPES.find((t) => t.id === type);
  return found?.icon || PawPrint;
};

const getPetTypeLabel = (type: Pet['type']) => {
  const found = PET_TYPES.find((t) => t.id === type);
  return found?.label || 'Pet';
};

export default function PetsScreen() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState<Pet['type']>('dog');
  const [petBreed, setPetBreed] = useState('');
  const [petColor, setPetColor] = useState(COLORS[0]);

  const pets = useFamilyStore((s) => s.pets);
  const addPet = useFamilyStore((s) => s.addPet);
  const removePet = useFamilyStore((s) => s.removePet);

  const handleCreatePet = () => {
    if (!petName.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addPet({
      name: petName.trim(),
      type: petType,
      breed: petBreed.trim() || undefined,
      color: petColor,
    });
    setPetName('');
    setPetType('dog');
    setPetBreed('');
    setPetColor(COLORS[0]);
    setShowCreateModal(false);
  };

  const handleDeletePet = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removePet(id);
  };

  const handleOpenPet = (pet: Pet) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/pet-detail?id=${pet.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const getNextVaccine = (pet: Pet) => {
    const futureVaccines = pet.vaccines
      .filter((v) => v.nextDate && new Date(v.nextDate) > new Date())
      .sort((a, b) => new Date(a.nextDate!).getTime() - new Date(b.nextDate!).getTime());
    return futureVaccines[0];
  };

  const getLastBath = (pet: Pet) => {
    const sortedBaths = [...pet.baths].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return sortedBaths[0];
  };

  const PetCard = ({ pet, index }: { pet: Pet; index: number }) => {
    const PetIcon = getPetIcon(pet.type);
    const nextVaccine = getNextVaccine(pet);
    const lastBath = getLastBath(pet);

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 80).springify()}
        exiting={FadeOut}
        layout={Layout.springify()}
      >
        <Pressable
          onPress={() => handleOpenPet(pet)}
          className="bg-white rounded-2xl p-4 mb-3"
          style={{ borderLeftWidth: 4, borderLeftColor: pet.color }}
        >
          <View className="flex-row items-center">
            <View
              className="w-14 h-14 rounded-full items-center justify-center"
              style={{ backgroundColor: `${pet.color}20` }}
            >
              <PetIcon size={28} color={pet.color} />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-darkNavy font-bold text-lg">{pet.name}</Text>
              <Text className="text-gray-400 text-sm">
                {getPetTypeLabel(pet.type)}
                {pet.breed && ` · ${pet.breed}`}
              </Text>
            </View>
            <Pressable
              onPress={() => handleDeletePet(pet.id)}
              className="p-2 mr-2"
              hitSlop={8}
            >
              <Trash2 size={18} color="#9CA3AF" />
            </Pressable>
            <ChevronRight size={20} color="#9CA3AF" />
          </View>

          {/* Quick Info */}
          <View className="flex-row mt-3 pt-3 border-t border-gray-100">
            <View className="flex-1 flex-row items-center">
              <Syringe size={14} color="#1B7C7C" />
              <Text className="text-xs text-gray-500 ml-1">
                {nextVaccine
                  ? `Próx: ${formatDate(nextVaccine.nextDate!)}`
                  : 'Sem vacinas'}
              </Text>
            </View>
            <View className="flex-1 flex-row items-center">
              <Droplets size={14} color="#64B5F6" />
              <Text className="text-xs text-gray-500 ml-1">
                {lastBath
                  ? `Último: ${formatDate(lastBath.date)}`
                  : 'Sem banhos'}
              </Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1 bg-cream">
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        {/* Add Pet Button */}
        <Pressable
          onPress={() => setShowCreateModal(true)}
          className="bg-teal/10 border-2 border-dashed border-teal/30 rounded-xl p-4 mb-4 flex-row items-center justify-center"
        >
          <Plus size={20} color="#1B7C7C" />
          <Text className="text-teal font-medium ml-2">Adicionar Pet</Text>
        </Pressable>

        {/* Pet List */}
        {pets.length > 0 ? (
          <View className="mb-8">
            <Text className="text-darkNavy font-bold text-lg mb-3">
              Meus Pets ({pets.length})
            </Text>
            {pets.map((pet, index) => (
              <PetCard key={pet.id} pet={pet} index={index} />
            ))}
          </View>
        ) : (
          <View className="items-center py-12">
            <PawPrint size={48} color="#9CA3AF" />
            <Text className="text-gray-400 mt-4 text-center">
              Nenhum pet cadastrado
            </Text>
            <Text className="text-gray-300 text-sm mt-1">
              Adicione seu primeiro pet
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Create Pet Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View className="flex-1 bg-cream">
          <View className="flex-row items-center justify-between px-5 pt-4 pb-4 border-b border-gray-200">
            <Pressable onPress={() => setShowCreateModal(false)} className="p-2">
              <X size={24} color="#0D3B5C" />
            </Pressable>
            <Text className="text-darkNavy font-bold text-lg">Novo Pet</Text>
            <Pressable
              onPress={handleCreatePet}
              className={`p-2 rounded-full ${petName.trim() ? 'bg-teal' : 'bg-gray-200'}`}
            >
              <Check size={20} color={petName.trim() ? 'white' : '#9CA3AF'} />
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
            {/* Name Input */}
            <Text className="text-darkNavy font-semibold mb-2">Nome do Pet</Text>
            <TextInput
              value={petName}
              onChangeText={setPetName}
              placeholder="Ex: Rex, Mia, Thor..."
              placeholderTextColor="#9CA3AF"
              className="bg-white rounded-xl p-4 text-darkNavy text-base mb-6"
              autoFocus
            />

            {/* Pet Type Selection */}
            <Text className="text-darkNavy font-semibold mb-3">Tipo</Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {PET_TYPES.map((type) => {
                const TypeIcon = type.icon;
                const isSelected = petType === type.id;
                return (
                  <Pressable
                    key={type.id}
                    onPress={() => setPetType(type.id)}
                    className={`flex-row items-center px-3 py-2 rounded-xl ${
                      isSelected ? 'bg-teal' : 'bg-white'
                    }`}
                  >
                    <TypeIcon size={18} color={isSelected ? 'white' : '#0D3B5C'} />
                    <Text
                      className={`ml-2 font-medium ${
                        isSelected ? 'text-white' : 'text-darkNavy'
                      }`}
                    >
                      {type.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Breed Input */}
            <Text className="text-darkNavy font-semibold mb-2">Raça (opcional)</Text>
            <TextInput
              value={petBreed}
              onChangeText={setPetBreed}
              placeholder="Ex: Golden Retriever, Siamês..."
              placeholderTextColor="#9CA3AF"
              className="bg-white rounded-xl p-4 text-darkNavy text-base mb-6"
            />

            {/* Color Selection */}
            <Text className="text-darkNavy font-semibold mb-3">Cor do Card</Text>
            <View className="flex-row flex-wrap gap-3 mb-8">
              {COLORS.map((color) => {
                const isSelected = petColor === color;
                return (
                  <Pressable
                    key={color}
                    onPress={() => setPetColor(color)}
                    className={`w-12 h-12 rounded-xl items-center justify-center ${
                      isSelected ? 'border-2 border-darkNavy' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {isSelected && <Check size={20} color="white" />}
                  </Pressable>
                );
              })}
            </View>

            {/* Preview */}
            <Text className="text-darkNavy font-semibold mb-3">Prévia</Text>
            <View
              className="bg-white rounded-2xl p-4 mb-8"
              style={{ borderLeftWidth: 4, borderLeftColor: petColor }}
            >
              <View className="flex-row items-center">
                <View
                  className="w-14 h-14 rounded-full items-center justify-center"
                  style={{ backgroundColor: `${petColor}20` }}
                >
                  {(() => {
                    const PreviewIcon = getPetIcon(petType);
                    return <PreviewIcon size={28} color={petColor} />;
                  })()}
                </View>
                <View className="flex-1 ml-4">
                  <Text className="text-darkNavy font-bold text-lg">
                    {petName || 'Nome do Pet'}
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    {getPetTypeLabel(petType)}
                    {petBreed && ` · ${petBreed}`}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
