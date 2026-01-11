import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  Share,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Users,
  Copy,
  Share2,
  LogOut,
  UserPlus,
  Mail,
  X,
  RefreshCw,
  ChevronRight,
  Crown,
  Check,
  Trash2,
  Send,
  Palette,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeOut, Layout } from 'react-native-reanimated';
import { useAuthStore } from '@/lib/auth-store';
import { useFamilyStore, FamilyMember } from '@/lib/store';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';

const MEMBER_COLORS = [
  '#1B7C7C', // teal
  '#E57373', // red
  '#81C784', // green
  '#64B5F6', // blue
  '#FFB74D', // orange
  '#BA68C8', // purple
  '#4DB6AC', // cyan
  '#F06292', // pink
  '#A1887F', // brown
  '#78909C', // gray-blue
];

const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export default function ProfileScreen() {
  const router = useRouter();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [newMemberName, setNewMemberName] = useState('');
  const [selectedColor, setSelectedColor] = useState(MEMBER_COLORS[0]);
  const [copied, setCopied] = useState(false);
  const [invitingMemberId, setInvitingMemberId] = useState<string | null>(null);
  const [memberInviteEmail, setMemberInviteEmail] = useState('');

  const user = useAuthStore((s) => s.user);
  const familyGroup = useAuthStore((s) => s.familyGroup);
  const logout = useAuthStore((s) => s.logout);
  const generateInviteCode = useAuthStore((s) => s.generateInviteCode);
  const sendInvite = useAuthStore((s) => s.sendInvite);
  const leaveFamilyGroup = useAuthStore((s) => s.leaveFamilyGroup);

  const members = useFamilyStore((s) => s.members);
  const addMember = useFamilyStore((s) => s.addMember);
  const removeMember = useFamilyStore((s) => s.removeMember);

  const handleCopyCode = async () => {
    if (familyGroup?.inviteCode) {
      await Clipboard.setStringAsync(familyGroup.inviteCode);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareCode = async () => {
    if (familyGroup?.inviteCode) {
      try {
        await Share.share({
          message: `Junte-se a familia "${familyGroup.name}" no app Agenda Familia!\n\nCodigo de convite: ${familyGroup.inviteCode}`,
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRegenerateCode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    generateInviteCode();
  };

  const handleSendInvite = () => {
    if (inviteEmail.trim()) {
      sendInvite(inviteEmail);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setInviteEmail('');
      setShowInviteModal(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const handleLeaveFamily = () => {
    leaveFamilyGroup();
    router.replace('/family-setup');
  };

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addMember({
      name: newMemberName.trim(),
      color: selectedColor,
      avatar: getInitials(newMemberName),
    });
    setNewMemberName('');
    setSelectedColor(MEMBER_COLORS[Math.floor(Math.random() * MEMBER_COLORS.length)]);
    setShowAddMemberModal(false);
  };

  const handleRemoveMember = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removeMember(id);
  };

  const handleSendMemberInvite = () => {
    if (memberInviteEmail.trim() && invitingMemberId) {
      const member = members.find((m) => m.id === invitingMemberId);
      if (member && familyGroup) {
        // Simular envio de convite
        console.log(`Enviando convite para ${memberInviteEmail} para ${member.name}`);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      setMemberInviteEmail('');
      setInvitingMemberId(null);
    }
  };

  const handleShareMemberInvite = async (member: FamilyMember) => {
    if (familyGroup) {
      try {
        await Share.share({
          message: `Oi ${member.name}! Junte-se a familia "${familyGroup.name}" no app Agenda Familia!\n\nCodigo de convite: ${familyGroup.inviteCode}`,
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (!user) {
    return (
      <View className="flex-1 bg-cream items-center justify-center">
        <Text className="text-darkNavy">Carregando...</Text>
      </View>
    );
  }

  const MemberCard = ({ member, index }: { member: FamilyMember; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      exiting={FadeOut}
      layout={Layout.springify()}
      className="bg-white rounded-xl p-4 mb-2 flex-row items-center"
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: member.color }}
      >
        <Text className="text-white font-bold">{member.avatar}</Text>
      </View>
      <Text className="flex-1 ml-3 text-darkNavy font-medium">{member.name}</Text>

      {/* Invite Options */}
      <Pressable
        onPress={() => handleShareMemberInvite(member)}
        className="p-2 mr-1"
        hitSlop={8}
      >
        <Share2 size={18} color="#1B7C7C" />
      </Pressable>
      <Pressable
        onPress={() => {
          setInvitingMemberId(member.id);
          setMemberInviteEmail('');
        }}
        className="p-2 mr-1"
        hitSlop={8}
      >
        <Mail size={18} color="#8FB096" />
      </Pressable>
      <Pressable
        onPress={() => handleRemoveMember(member.id)}
        className="p-2"
        hitSlop={8}
      >
        <Trash2 size={18} color="#9CA3AF" />
      </Pressable>
    </Animated.View>
  );

  return (
    <View className="flex-1 bg-cream">
      <SafeAreaView className="flex-1" edges={['top']}>
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="px-5 pt-4 pb-6">
            <Text className="text-darkNavy font-bold text-2xl">Perfil</Text>
          </View>

          {/* User Card */}
          <Animated.View
            entering={FadeInDown.delay(100).springify()}
            className="px-5 mb-6"
          >
            <View className="bg-white rounded-2xl p-5 shadow-sm">
              <View className="flex-row items-center">
                <View
                  className="w-16 h-16 rounded-full items-center justify-center"
                  style={{ backgroundColor: user.color }}
                >
                  <Text className="text-white font-bold text-2xl">
                    {user.avatar}
                  </Text>
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-darkNavy font-bold text-xl">{user.name}</Text>
                  <Text className="text-darkNavy/60">{user.email}</Text>
                </View>
              </View>
            </View>
          </Animated.View>

          {/* Family Members Section */}
          <Animated.View
            entering={FadeInDown.delay(150).springify()}
            className="px-5 mb-6"
          >
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-darkNavy font-bold text-lg">
                Membros da Familia ({members.length})
              </Text>
              <Pressable
                onPress={() => setShowAddMemberModal(true)}
                className="bg-teal px-3 py-2 rounded-full flex-row items-center"
              >
                <UserPlus size={16} color="white" />
                <Text className="text-white font-medium ml-1 text-sm">Adicionar</Text>
              </Pressable>
            </View>

            {members.length > 0 ? (
              <View>
                {members.map((member, index) => (
                  <MemberCard key={member.id} member={member} index={index} />
                ))}
                <Text className="text-gray-400 text-xs text-center mt-2">
                  Toque em <Mail size={12} color="#9CA3AF" /> para enviar convite por email ou <Share2 size={12} color="#9CA3AF" /> para compartilhar
                </Text>
              </View>
            ) : (
              <View className="bg-white rounded-2xl p-6 items-center">
                <Users size={40} color="#9CA3AF" />
                <Text className="text-gray-400 mt-3 text-center">
                  Nenhum membro adicionado
                </Text>
                <Text className="text-gray-300 text-sm mt-1 text-center">
                  Adicione membros da familia e envie convites depois
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Family Group Card */}
          {familyGroup && (
            <Animated.View
              entering={FadeInDown.delay(200).springify()}
              className="px-5 mb-6"
            >
              <Text className="text-darkNavy font-bold text-lg mb-3">
                Grupo Familiar
              </Text>
              <View className="bg-white rounded-2xl p-5 shadow-sm">
                <View className="flex-row items-center mb-4">
                  <View className="bg-teal/10 p-3 rounded-full">
                    <Users size={24} color="#1B7C7C" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-darkNavy font-bold text-lg">
                      {familyGroup.name}
                    </Text>
                    <Text className="text-darkNavy/60">
                      {familyGroup.members.length} membro(s) conectado(s)
                    </Text>
                  </View>
                  {familyGroup.createdBy === user.id && (
                    <View className="bg-amber-100 px-2 py-1 rounded-full flex-row items-center">
                      <Crown size={12} color="#F59E0B" />
                      <Text className="text-amber-600 text-xs ml-1 font-medium">
                        Admin
                      </Text>
                    </View>
                  )}
                </View>

                {/* Invite Code Section */}
                <View className="bg-gray-50 rounded-xl p-4 mb-4">
                  <Text className="text-darkNavy/60 text-sm mb-2">
                    Codigo de Convite
                  </Text>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-darkNavy font-bold text-2xl tracking-widest">
                      {familyGroup.inviteCode}
                    </Text>
                    <Pressable
                      onPress={handleRegenerateCode}
                      className="p-2"
                    >
                      <RefreshCw size={18} color="#1B7C7C" />
                    </Pressable>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row space-x-3">
                  <Pressable
                    onPress={handleCopyCode}
                    className="flex-1 bg-gray-100 py-3 rounded-xl flex-row items-center justify-center"
                  >
                    <Copy size={16} color="#0D3B5C" />
                    <Text className="text-darkNavy font-medium ml-2">
                      {copied ? 'Copiado!' : 'Copiar'}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={handleShareCode}
                    className="flex-1 bg-teal py-3 rounded-xl flex-row items-center justify-center"
                  >
                    <Share2 size={16} color="white" />
                    <Text className="text-white font-medium ml-2">
                      Compartilhar
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Invite by Email */}
          <Animated.View
            entering={FadeInDown.delay(300).springify()}
            className="px-5 mb-6"
          >
            <Text className="text-darkNavy font-bold text-lg mb-3">
              Convidar Familiares
            </Text>
            <Pressable
              onPress={() => setShowInviteModal(true)}
              className="bg-white rounded-2xl p-4 shadow-sm flex-row items-center"
            >
              <View className="bg-sage/10 p-3 rounded-full">
                <UserPlus size={22} color="#8FB096" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-darkNavy font-semibold">
                  Enviar Convite por Email
                </Text>
                <Text className="text-darkNavy/60 text-sm">
                  Convide familiares diretamente
                </Text>
              </View>
              <ChevronRight size={20} color="#9CA3AF" />
            </Pressable>
          </Animated.View>

          {/* Account Actions */}
          <Animated.View
            entering={FadeInDown.delay(400).springify()}
            className="px-5 mb-8"
          >
            <Text className="text-darkNavy font-bold text-lg mb-3">Conta</Text>
            <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {familyGroup && (
                <Pressable
                  onPress={handleLeaveFamily}
                  className="p-4 flex-row items-center border-b border-gray-100"
                >
                  <View className="bg-amber-100 p-3 rounded-full">
                    <Users size={20} color="#F59E0B" />
                  </View>
                  <Text className="text-darkNavy ml-3 flex-1">Sair do Grupo Familiar</Text>
                  <ChevronRight size={20} color="#9CA3AF" />
                </Pressable>
              )}
              <Pressable
                onPress={handleLogout}
                className="p-4 flex-row items-center"
              >
                <View className="bg-red-100 p-3 rounded-full">
                  <LogOut size={20} color="#EF4444" />
                </View>
                <Text className="text-red-500 ml-3 flex-1">Sair da Conta</Text>
                <ChevronRight size={20} color="#9CA3AF" />
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* Add Member Modal */}
      <Modal
        visible={showAddMemberModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowAddMemberModal(false)}
      >
        <View className="flex-1 bg-cream">
          <SafeAreaView className="flex-1" edges={['top']}>
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
              <Pressable onPress={() => setShowAddMemberModal(false)} className="p-2">
                <X size={24} color="#0D3B5C" />
              </Pressable>
              <Text className="text-darkNavy font-bold text-lg">
                Adicionar Familiar
              </Text>
              <Pressable
                onPress={handleAddMember}
                className={`p-2 rounded-full ${newMemberName.trim() ? 'bg-teal' : 'bg-gray-200'}`}
              >
                <Check size={20} color={newMemberName.trim() ? 'white' : '#9CA3AF'} />
              </Pressable>
            </View>

            <ScrollView className="flex-1 px-5 pt-6">
              {/* Name Input */}
              <Text className="text-darkNavy font-semibold mb-2">Nome</Text>
              <TextInput
                value={newMemberName}
                onChangeText={setNewMemberName}
                placeholder="Ex: Maria, Joao, Filho..."
                placeholderTextColor="#9CA3AF"
                className="bg-white rounded-xl p-4 text-darkNavy text-base mb-6"
                autoFocus
              />

              {/* Color Selection */}
              <Text className="text-darkNavy font-semibold mb-3">Cor</Text>
              <View className="flex-row flex-wrap gap-3 mb-6">
                {MEMBER_COLORS.map((color) => {
                  const isSelected = selectedColor === color;
                  return (
                    <Pressable
                      key={color}
                      onPress={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-full items-center justify-center ${
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
              <Text className="text-darkNavy font-semibold mb-3">Previa</Text>
              <View className="bg-white rounded-xl p-4 flex-row items-center">
                <View
                  className="w-12 h-12 rounded-full items-center justify-center"
                  style={{ backgroundColor: selectedColor }}
                >
                  <Text className="text-white font-bold text-lg">
                    {newMemberName ? getInitials(newMemberName) : '??'}
                  </Text>
                </View>
                <Text className="flex-1 ml-4 text-darkNavy font-medium text-lg">
                  {newMemberName || 'Nome do familiar'}
                </Text>
              </View>

              {/* Info */}
              <View className="mt-6 bg-teal/10 rounded-xl p-4">
                <Text className="text-darkNavy/70 text-center text-sm">
                  Voce pode adicionar membros da familia agora e enviar convites para eles depois. Use os botoes de compartilhar ou email na lista de membros.
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>

      {/* Invite Modal */}
      <Modal
        visible={showInviteModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View className="flex-1 bg-cream">
          <SafeAreaView className="flex-1" edges={['top']}>
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
              <Text className="text-darkNavy font-bold text-lg">
                Convidar por Email
              </Text>
              <Pressable
                onPress={() => setShowInviteModal(false)}
                className="p-2"
              >
                <X size={24} color="#0D3B5C" />
              </Pressable>
            </View>

            <View className="flex-1 px-5 pt-6">
              <View className="bg-white rounded-2xl p-5 shadow-sm">
                <Text className="text-darkNavy/60 text-sm font-medium mb-2">
                  Email do Familiar
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 mb-6">
                  <Mail size={20} color="#9CA3AF" />
                  <TextInput
                    value={inviteEmail}
                    onChangeText={setInviteEmail}
                    placeholder="email@exemplo.com"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="flex-1 ml-3 text-darkNavy text-base"
                  />
                </View>

                <Pressable
                  onPress={handleSendInvite}
                  className="bg-teal py-4 rounded-xl"
                >
                  <Text className="text-white font-bold text-center">
                    Enviar Convite
                  </Text>
                </Pressable>

                <View className="mt-6 bg-sage/10 rounded-xl p-4">
                  <Text className="text-darkNavy/70 text-center text-sm">
                    O familiar recebera um email com o codigo de convite{' '}
                    <Text className="font-bold">{familyGroup?.inviteCode}</Text>{' '}
                    para entrar no grupo.
                  </Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>

      {/* Member Invite Email Modal */}
      <Modal
        visible={invitingMemberId !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setInvitingMemberId(null)}
      >
        <View className="flex-1 bg-cream">
          <SafeAreaView className="flex-1" edges={['top']}>
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-5 py-4 border-b border-gray-100">
              <Text className="text-darkNavy font-bold text-lg">
                Enviar Convite
              </Text>
              <Pressable
                onPress={() => setInvitingMemberId(null)}
                className="p-2"
              >
                <X size={24} color="#0D3B5C" />
              </Pressable>
            </View>

            <View className="flex-1 px-5 pt-6">
              {(() => {
                const member = members.find((m) => m.id === invitingMemberId);
                if (!member) return null;
                return (
                  <View className="bg-white rounded-2xl p-5 shadow-sm">
                    <View className="flex-row items-center mb-6">
                      <View
                        className="w-12 h-12 rounded-full items-center justify-center"
                        style={{ backgroundColor: member.color }}
                      >
                        <Text className="text-white font-bold">{member.avatar}</Text>
                      </View>
                      <View className="ml-3">
                        <Text className="text-darkNavy font-bold text-lg">
                          {member.name}
                        </Text>
                        <Text className="text-darkNavy/60 text-sm">
                          Enviar convite para este membro
                        </Text>
                      </View>
                    </View>

                    <Text className="text-darkNavy/60 text-sm font-medium mb-2">
                      Email
                    </Text>
                    <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 mb-6">
                      <Mail size={20} color="#9CA3AF" />
                      <TextInput
                        value={memberInviteEmail}
                        onChangeText={setMemberInviteEmail}
                        placeholder="email@exemplo.com"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoFocus
                        className="flex-1 ml-3 text-darkNavy text-base"
                      />
                    </View>

                    <Pressable
                      onPress={handleSendMemberInvite}
                      className={`py-4 rounded-xl flex-row items-center justify-center ${
                        memberInviteEmail.trim() ? 'bg-teal' : 'bg-gray-200'
                      }`}
                    >
                      <Send size={18} color={memberInviteEmail.trim() ? 'white' : '#9CA3AF'} />
                      <Text
                        className={`font-bold ml-2 ${
                          memberInviteEmail.trim() ? 'text-white' : 'text-gray-400'
                        }`}
                      >
                        Enviar Convite
                      </Text>
                    </Pressable>

                    <View className="mt-6 bg-sage/10 rounded-xl p-4">
                      <Text className="text-darkNavy/70 text-center text-sm">
                        {member.name} recebera um email com o codigo{' '}
                        <Text className="font-bold">{familyGroup?.inviteCode}</Text>{' '}
                        para baixar o app e entrar na familia.
                      </Text>
                    </View>
                  </View>
                );
              })()}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}
