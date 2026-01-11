import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Share } from 'react-native';
import { ShoppingCart, Plus, Check, Trash2, X, Share2 } from 'lucide-react-native';
import Animated, { FadeInDown, FadeOut, Layout } from 'react-native-reanimated';
import { useFamilyStore, ShoppingItem } from '@/lib/store';
import * as Haptics from 'expo-haptics';

type Category = 'all' | 'grocery' | 'household' | 'other';

const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'grocery', label: 'Mercado' },
  { key: 'household', label: 'Casa' },
  { key: 'other', label: 'Outros' },
];

export default function ShoppingScreen() {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [newItemName, setNewItemName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const shoppingItems = useFamilyStore((s) => s.shoppingItems);
  const addShoppingItem = useFamilyStore((s) => s.addShoppingItem);
  const toggleShoppingItem = useFamilyStore((s) => s.toggleShoppingItem);
  const removeShoppingItem = useFamilyStore((s) => s.removeShoppingItem);
  const clearCompletedShopping = useFamilyStore((s) => s.clearCompletedShopping);
  const members = useFamilyStore((s) => s.members);

  const filteredItems = useMemo(() => {
    if (selectedCategory === 'all') return shoppingItems;
    return shoppingItems.filter((item) => item.category === selectedCategory);
  }, [shoppingItems, selectedCategory]);

  const pendingItems = filteredItems.filter((item) => !item.completed);
  const completedItems = filteredItems.filter((item) => item.completed);

  const handleToggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleShoppingItem(id);
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addShoppingItem({
      name: newItemName.trim(),
      completed: false,
      addedBy: members[0]?.id || '1',
      category: selectedCategory === 'all' ? 'grocery' : selectedCategory,
    });
    setNewItemName('');
    setIsAdding(false);
  };

  const getMemberById = (id: string) => members.find((m) => m.id === id);

  const getCategoryLabel = (category: string) => {
    const cat = CATEGORIES.find((c) => c.key === category);
    return cat?.label || category;
  };

  const handleShareList = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const itemsToShare = selectedCategory === 'all'
      ? shoppingItems
      : shoppingItems.filter((item) => item.category === selectedCategory);

    const pendingToShare = itemsToShare.filter((item) => !item.completed);
    const completedToShare = itemsToShare.filter((item) => item.completed);

    if (itemsToShare.length === 0) {
      return;
    }

    let message = '🛒 Lista de Compras\n';
    message += selectedCategory !== 'all' ? `(${getCategoryLabel(selectedCategory)})\n` : '';
    message += '\n';

    if (pendingToShare.length > 0) {
      message += '📋 Para comprar:\n';
      pendingToShare.forEach((item) => {
        message += `○ ${item.name}${item.quantity && item.quantity > 1 ? ` x${item.quantity}` : ''}\n`;
      });
    }

    if (completedToShare.length > 0) {
      if (pendingToShare.length > 0) message += '\n';
      message += '✅ Comprados:\n';
      completedToShare.forEach((item) => {
        message += `● ${item.name}${item.quantity && item.quantity > 1 ? ` x${item.quantity}` : ''}\n`;
      });
    }

    message += '\n— Enviado pelo Agenda Familia';

    try {
      await Share.share({ message });
    } catch (err) {
      console.error(err);
    }
  };

  const ShoppingItemRow = ({ item, index }: { item: ShoppingItem; index: number }) => {
    const member = getMemberById(item.addedBy);

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 50).springify()}
        exiting={FadeOut}
        layout={Layout.springify()}
      >
        <Pressable
          onPress={() => handleToggle(item.id)}
          className="flex-row items-center bg-white rounded-xl p-4 mb-2"
        >
          <View
            className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
              item.completed ? 'bg-sage border-sage' : 'border-gray-300'
            }`}
          >
            {item.completed && <Check size={14} color="white" />}
          </View>
          <View className="flex-1 ml-3">
            <Text
              className={`text-base ${
                item.completed ? 'text-gray-400 line-through' : 'text-darkNavy'
              }`}
            >
              {item.name}
              {item.quantity && item.quantity > 1 && (
                <Text className="text-gray-400"> x{item.quantity}</Text>
              )}
            </Text>
          </View>
          {member && (
            <View
              className="w-6 h-6 rounded-full items-center justify-center mr-2"
              style={{ backgroundColor: member.color }}
            >
              <Text className="text-white text-xs font-bold">{member.avatar}</Text>
            </View>
          )}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              removeShoppingItem(item.id);
            }}
            className="p-1"
          >
            <Trash2 size={18} color="#9CA3AF" />
          </Pressable>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View className="flex-1 bg-cream">
      {/* Category Tabs */}
      <View className="px-5 pt-4 flex-row items-center justify-between">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, flex: 1 }}>
          <View className="flex-row space-x-2">
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.key}
                onPress={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === cat.key ? 'bg-teal' : 'bg-white'
                }`}
              >
                <Text
                  className={`font-medium ${
                    selectedCategory === cat.key ? 'text-white' : 'text-darkNavy'
                  }`}
                >
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
        {shoppingItems.length > 0 && (
          <Pressable
            onPress={handleShareList}
            className="bg-teal p-2.5 rounded-full ml-3"
          >
            <Share2 size={18} color="white" />
          </Pressable>
        )}
      </View>

      <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false}>
        {/* Add Item Section */}
        {isAdding ? (
          <Animated.View
            entering={FadeInDown.springify()}
            className="bg-white rounded-xl p-4 mb-4 flex-row items-center"
          >
            <TextInput
              value={newItemName}
              onChangeText={setNewItemName}
              placeholder="Nome do item..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-darkNavy text-base"
              autoFocus
              onSubmitEditing={handleAddItem}
            />
            <Pressable onPress={handleAddItem} className="bg-sage p-2 rounded-full ml-2">
              <Check size={20} color="white" />
            </Pressable>
            <Pressable
              onPress={() => {
                setIsAdding(false);
                setNewItemName('');
              }}
              className="p-2 ml-1"
            >
              <X size={20} color="#9CA3AF" />
            </Pressable>
          </Animated.View>
        ) : (
          <Pressable
            onPress={() => setIsAdding(true)}
            className="bg-teal/10 border-2 border-dashed border-teal/30 rounded-xl p-4 mb-4 flex-row items-center justify-center"
          >
            <Plus size={20} color="#1B7C7C" />
            <Text className="text-teal font-medium ml-2">Adicionar Item</Text>
          </Pressable>
        )}

        {/* Pending Items */}
        {pendingItems.length > 0 && (
          <View className="mb-4">
            <Text className="text-darkNavy font-bold text-lg mb-3">
              Para Comprar ({pendingItems.length})
            </Text>
            {pendingItems.map((item, index) => (
              <ShoppingItemRow key={item.id} item={item} index={index} />
            ))}
          </View>
        )}

        {/* Completed Items */}
        {completedItems.length > 0 && (
          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-gray-400 font-semibold">
                Comprados ({completedItems.length})
              </Text>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  clearCompletedShopping();
                }}
                className="px-3 py-1 bg-gray-100 rounded-full"
              >
                <Text className="text-gray-500 text-sm">Limpar</Text>
              </Pressable>
            </View>
            {completedItems.map((item, index) => (
              <ShoppingItemRow key={item.id} item={item} index={index} />
            ))}
          </View>
        )}

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <View className="items-center py-12">
            <ShoppingCart size={48} color="#9CA3AF" />
            <Text className="text-gray-400 mt-4 text-center">
              Lista de compras vazia
            </Text>
            <Text className="text-gray-300 text-sm mt-1">
              Toque em "Adicionar Item" para comecar
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
