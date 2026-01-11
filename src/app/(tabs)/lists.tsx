import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Modal,
} from 'react-native';
import {
  Plus,
  List,
  X,
  Check,
  Trash2,
  ChevronRight,
  Briefcase,
  Heart,
  Star,
  Home,
  BookOpen,
  Music,
  Dumbbell,
  Utensils,
  Plane,
  Gift,
} from 'lucide-react-native';
import Animated, { FadeInDown, FadeOut, Layout } from 'react-native-reanimated';
import { useFamilyStore, CustomList } from '@/lib/store';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

const ICONS = [
  { name: 'list', icon: List },
  { name: 'briefcase', icon: Briefcase },
  { name: 'heart', icon: Heart },
  { name: 'star', icon: Star },
  { name: 'home', icon: Home },
  { name: 'book', icon: BookOpen },
  { name: 'music', icon: Music },
  { name: 'dumbbell', icon: Dumbbell },
  { name: 'utensils', icon: Utensils },
  { name: 'plane', icon: Plane },
  { name: 'gift', icon: Gift },
];

const COLORS = [
  '#1B7C7C', // teal
  '#E57373', // red
  '#81C784', // green
  '#64B5F6', // blue
  '#FFB74D', // orange
  '#BA68C8', // purple
  '#4DB6AC', // cyan
  '#F06292', // pink
  '#A1887F', // brown
  '#90A4AE', // gray
];

const getIconComponent = (iconName: string) => {
  const found = ICONS.find((i) => i.name === iconName);
  return found?.icon || List;
};

export default function ListsScreen() {
  const router = useRouter();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('list');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const customLists = useFamilyStore((s) => s.customLists);
  const addCustomList = useFamilyStore((s) => s.addCustomList);
  const removeCustomList = useFamilyStore((s) => s.removeCustomList);

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addCustomList({
      name: newListName.trim(),
      icon: selectedIcon,
      color: selectedColor,
    });
    setNewListName('');
    setSelectedIcon('list');
    setSelectedColor(COLORS[0]);
    setShowCreateModal(false);
  };

  const handleDeleteList = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removeCustomList(id);
  };

  const handleOpenList = (list: CustomList) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/list-detail?id=${list.id}`);
  };

  const ListCard = ({ list, index }: { list: CustomList; index: number }) => {
    const IconComponent = getIconComponent(list.icon);
    const pendingCount = list.items.filter((i) => !i.completed).length;
    const completedCount = list.items.filter((i) => i.completed).length;

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 80).springify()}
        exiting={FadeOut}
        layout={Layout.springify()}
      >
        <Pressable
          onPress={() => handleOpenList(list)}
          className="bg-white rounded-2xl p-4 mb-3 flex-row items-center"
          style={{ borderLeftWidth: 4, borderLeftColor: list.color }}
        >
          <View
            className="w-12 h-12 rounded-xl items-center justify-center"
            style={{ backgroundColor: `${list.color}20` }}
          >
            <IconComponent size={24} color={list.color} />
          </View>
          <View className="flex-1 ml-4">
            <Text className="text-darkNavy font-bold text-base">{list.name}</Text>
            <Text className="text-gray-400 text-sm mt-1">
              {pendingCount} pendente{pendingCount !== 1 && 's'}
              {completedCount > 0 && ` · ${completedCount} concluído${completedCount !== 1 && 's'}`}
            </Text>
          </View>
          <Pressable
            onPress={() => handleDeleteList(list.id)}
            className="p-2 mr-2"
            hitSlop={8}
          >
            <Trash2 size={18} color="#9CA3AF" />
          </Pressable>
          <ChevronRight size={20} color="#9CA3AF" />
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1 bg-cream">
      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        {/* Create List Button */}
        <Pressable
          onPress={() => setShowCreateModal(true)}
          className="bg-teal/10 border-2 border-dashed border-teal/30 rounded-xl p-4 mb-4 flex-row items-center justify-center"
        >
          <Plus size={20} color="#1B7C7C" />
          <Text className="text-teal font-medium ml-2">Criar Nova Lista</Text>
        </Pressable>

        {/* Lists */}
        {customLists.length > 0 ? (
          <View className="mb-8">
            <Text className="text-darkNavy font-bold text-lg mb-3">
              Minhas Listas ({customLists.length})
            </Text>
            {customLists.map((list, index) => (
              <ListCard key={list.id} list={list} index={index} />
            ))}
          </View>
        ) : (
          <View className="items-center py-12">
            <List size={48} color="#9CA3AF" />
            <Text className="text-gray-400 mt-4 text-center">
              Nenhuma lista criada
            </Text>
            <Text className="text-gray-300 text-sm mt-1">
              Crie sua primeira lista personalizada
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Create List Modal */}
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
            <Text className="text-darkNavy font-bold text-lg">Nova Lista</Text>
            <Pressable
              onPress={handleCreateList}
              className={`p-2 rounded-full ${newListName.trim() ? 'bg-teal' : 'bg-gray-200'}`}
            >
              <Check size={20} color={newListName.trim() ? 'white' : '#9CA3AF'} />
            </Pressable>
          </View>

          <ScrollView className="flex-1 px-5 pt-6">
            {/* Name Input */}
            <Text className="text-darkNavy font-semibold mb-2">Nome da Lista</Text>
            <TextInput
              value={newListName}
              onChangeText={setNewListName}
              placeholder="Ex: Tarefas do Trabalho"
              placeholderTextColor="#9CA3AF"
              className="bg-white rounded-xl p-4 text-darkNavy text-base mb-6"
              autoFocus
            />

            {/* Icon Selection */}
            <Text className="text-darkNavy font-semibold mb-3">Ícone</Text>
            <View className="flex-row flex-wrap gap-3 mb-6">
              {ICONS.map((item) => {
                const IconComp = item.icon;
                const isSelected = selectedIcon === item.name;
                return (
                  <Pressable
                    key={item.name}
                    onPress={() => setSelectedIcon(item.name)}
                    className={`w-12 h-12 rounded-xl items-center justify-center ${
                      isSelected ? 'bg-teal' : 'bg-white'
                    }`}
                  >
                    <IconComp size={22} color={isSelected ? 'white' : '#0D3B5C'} />
                  </Pressable>
                );
              })}
            </View>

            {/* Color Selection */}
            <Text className="text-darkNavy font-semibold mb-3">Cor</Text>
            <View className="flex-row flex-wrap gap-3 mb-8">
              {COLORS.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <Pressable
                    key={color}
                    onPress={() => setSelectedColor(color)}
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
              className="bg-white rounded-2xl p-4 flex-row items-center"
              style={{ borderLeftWidth: 4, borderLeftColor: selectedColor }}
            >
              <View
                className="w-12 h-12 rounded-xl items-center justify-center"
                style={{ backgroundColor: `${selectedColor}20` }}
              >
                {(() => {
                  const PreviewIcon = getIconComponent(selectedIcon);
                  return <PreviewIcon size={24} color={selectedColor} />;
                })()}
              </View>
              <View className="flex-1 ml-4">
                <Text className="text-darkNavy font-bold text-base">
                  {newListName || 'Nome da Lista'}
                </Text>
                <Text className="text-gray-400 text-sm mt-1">0 pendentes</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
