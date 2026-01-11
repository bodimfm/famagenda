import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { X, Check, Calendar, Car, Heart, Trash2 } from 'lucide-react-native';
import { useFamilyStore } from '@/lib/store';
import * as Haptics from 'expo-haptics';

type ModalType = 'event' | 'transport' | 'date';

const EVENT_TYPES = [
  { key: 'event', label: 'Evento' },
  { key: 'appointment', label: 'Compromisso' },
  { key: 'activity', label: 'Atividade' },
] as const;

const DATE_TYPES = [
  { key: 'birthday', label: 'Aniversario' },
  { key: 'anniversary', label: 'Data Especial' },
  { key: 'holiday', label: 'Feriado' },
  { key: 'other', label: 'Outro' },
] as const;

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

export default function ModalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const modalType = (params.type as ModalType) || 'event';
  const editId = params.editId as string | undefined;
  const editDate = params.date as string | undefined;

  const members = useFamilyStore((s) => s.members);
  const events = useFamilyStore((s) => s.events);
  const pickups = useFamilyStore((s) => s.pickups);
  const addEvent = useFamilyStore((s) => s.addEvent);
  const updateEvent = useFamilyStore((s) => s.updateEvent);
  const removeEvent = useFamilyStore((s) => s.removeEvent);
  const addPickup = useFamilyStore((s) => s.addPickup);
  const updatePickup = useFamilyStore((s) => s.updatePickup);
  const removePickup = useFamilyStore((s) => s.removePickup);
  const addImportantDate = useFamilyStore((s) => s.addImportantDate);

  // Event state
  const [eventTitle, setEventTitle] = useState('');
  const [eventType, setEventType] = useState<'event' | 'appointment' | 'activity'>('event');
  const [eventTime, setEventTime] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [eventDateStr, setEventDateStr] = useState('');

  // Transport state
  const [childName, setChildName] = useState('');
  const [transportType, setTransportType] = useState<'pickup' | 'dropoff'>('dropoff');
  const [location, setLocation] = useState('');
  const [transportTime, setTransportTime] = useState('');
  const [responsibleMember, setResponsibleMember] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);

  // Date state
  const [dateTitle, setDateTitle] = useState('');
  const [dateType, setDateType] = useState<'birthday' | 'anniversary' | 'holiday' | 'other'>('birthday');
  const [dateMonth, setDateMonth] = useState('');
  const [dateDay, setDateDay] = useState('');
  const [dateMember, setDateMember] = useState('');

  // Error state
  const [errorMessage, setErrorMessage] = useState('');

  const isEditing = !!editId;

  // Load event data if editing
  useEffect(() => {
    if (editId && modalType === 'event') {
      const event = events.find((e) => e.id === editId);
      if (event) {
        setEventTitle(event.title);
        setEventType(event.type);
        setEventTime(event.time || '');
        setEventDescription(event.description || '');
        setSelectedMembers(event.membersInvolved);
        const date = new Date(event.date);
        setEventDateStr(formatDateForInput(date));
      }
    } else if (editId && modalType === 'transport') {
      const pickup = pickups.find((p) => p.id === editId);
      if (pickup) {
        setChildName(pickup.childName);
        setTransportType(pickup.type);
        setLocation(pickup.location);
        setTransportTime(pickup.time);
        setResponsibleMember(pickup.responsibleMemberId);
        setSelectedDay(pickup.dayOfWeek);
      }
    } else if (editDate && !editId) {
      // Pre-fill date when creating new event with selected date
      const date = new Date(editDate);
      setEventDateStr(formatDateForInput(date));
    }
  }, [editId, editDate, events, pickups, modalType]);

  const formatDateForInput = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDateFromInput = (str: string): Date | null => {
    const parts = str.split('/');
    if (parts.length !== 3) return null;
    const [day, month, year] = parts;
    if (!day || !month || !year) return null;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const formatDateInput = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
  };

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleDelete = () => {
    if (editId) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      if (modalType === 'event') {
        removeEvent(editId);
      } else if (modalType === 'transport') {
        removePickup(editId);
      }
      router.back();
    }
  };

  const handleSave = () => {
    setErrorMessage('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (modalType === 'event') {
      if (!eventTitle.trim()) {
        setErrorMessage('Preencha o titulo do evento');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      let eventDate: Date;
      if (eventDateStr) {
        const parsed = parseDateFromInput(eventDateStr);
        if (!parsed) {
          setErrorMessage('Data invalida. Use o formato DD/MM/AAAA');
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return;
        }
        eventDate = parsed;
      } else {
        eventDate = new Date();
      }

      const eventData = {
        title: eventTitle.trim(),
        date: eventDate.toISOString(),
        time: eventTime || undefined,
        description: eventDescription || undefined,
        membersInvolved: selectedMembers.length > 0 ? selectedMembers : [members[0]?.id || '1'],
        type: eventType,
      };

      if (isEditing && editId) {
        updateEvent(editId, eventData);
      } else {
        addEvent(eventData);
      }
    } else if (modalType === 'transport') {
      if (!childName.trim()) {
        setErrorMessage('Preencha o nome da crianca');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      const responsible = responsibleMember || members[0]?.id || '';
      const transportData = {
        childName: childName.trim(),
        responsibleMemberId: responsible,
        type: transportType,
        location: location.trim() || 'Escola',
        time: transportTime || '08:00',
        dayOfWeek: selectedDay,
        recurring: true,
      };

      if (isEditing && editId) {
        updatePickup(editId, transportData);
      } else {
        addPickup(transportData);
      }
    } else if (modalType === 'date') {
      if (!dateTitle.trim()) {
        setErrorMessage('Preencha o titulo da data');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      if (!dateMonth || !dateDay) {
        setErrorMessage('Preencha o dia e o mes');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      const month = dateMonth.padStart(2, '0');
      const day = dateDay.padStart(2, '0');
      addImportantDate({
        title: dateTitle.trim(),
        date: `${month}-${day}`,
        recurring: true,
        type: dateType,
        memberId: dateMember || undefined,
      });
    }

    router.back();
  };

  const getTitle = () => {
    if (isEditing) {
      if (modalType === 'event') return 'Editar Evento';
      if (modalType === 'transport') return 'Editar Transporte';
      return 'Editar';
    }
    switch (modalType) {
      case 'event':
        return 'Novo Evento';
      case 'transport':
        return 'Novo Transporte';
      case 'date':
        return 'Nova Data';
      default:
        return 'Adicionar';
    }
  };

  const getIcon = () => {
    switch (modalType) {
      case 'event':
        return Calendar;
      case 'transport':
        return Car;
      case 'date':
        return Heart;
      default:
        return Calendar;
    }
  };

  const Icon = getIcon();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-cream"
    >
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-4 pb-4 border-b border-gray-100">
        <Pressable onPress={() => router.back()} className="p-2">
          <X size={24} color="#0D3B5C" />
        </Pressable>
        <View className="flex-row items-center">
          <Icon size={20} color="#1B7C7C" />
          <Text className="text-darkNavy font-bold text-lg ml-2">{getTitle()}</Text>
        </View>
        <View className="flex-row items-center">
          {isEditing && (
            <Pressable
              onPress={handleDelete}
              className="bg-coral/20 p-2 rounded-full mr-2"
            >
              <Trash2 size={18} color="#E8927C" />
            </Pressable>
          )}
          <Pressable
            onPress={handleSave}
            className="bg-teal px-4 py-2 rounded-full flex-row items-center"
          >
            <Check size={18} color="white" />
            <Text className="text-white font-medium ml-1">Salvar</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false}>
        {/* Error Message */}
        {errorMessage ? (
          <View className="mb-4 bg-coral/20 rounded-xl p-3">
            <Text className="text-coral font-medium text-center">{errorMessage}</Text>
          </View>
        ) : null}

        {/* Event Form */}
        {modalType === 'event' && (
          <>
            <View className="mb-4">
              <Text className="text-darkNavy font-medium mb-2">Titulo</Text>
              <TextInput
                value={eventTitle}
                onChangeText={setEventTitle}
                placeholder="Ex: Reuniao de Pais"
                placeholderTextColor="#9CA3AF"
                className="bg-white rounded-xl p-4 text-darkNavy"
              />
            </View>

            <View className="mb-4">
              <Text className="text-darkNavy font-medium mb-2">Data</Text>
              <TextInput
                value={eventDateStr}
                onChangeText={(text) => setEventDateStr(formatDateInput(text))}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#9CA3AF"
                className="bg-white rounded-xl p-4 text-darkNavy"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>

            <View className="mb-4">
              <Text className="text-darkNavy font-medium mb-2">Tipo</Text>
              <View className="flex-row space-x-2">
                {EVENT_TYPES.map((type) => (
                  <Pressable
                    key={type.key}
                    onPress={() => setEventType(type.key)}
                    className={`flex-1 py-3 rounded-xl items-center ${
                      eventType === type.key ? 'bg-teal' : 'bg-white'
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        eventType === type.key ? 'text-white' : 'text-darkNavy'
                      }`}
                    >
                      {type.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-darkNavy font-medium mb-2">Horario (opcional)</Text>
              <TextInput
                value={eventTime}
                onChangeText={setEventTime}
                placeholder="Ex: 14:00"
                placeholderTextColor="#9CA3AF"
                className="bg-white rounded-xl p-4 text-darkNavy"
              />
            </View>

            <View className="mb-4">
              <Text className="text-darkNavy font-medium mb-2">Descricao (opcional)</Text>
              <TextInput
                value={eventDescription}
                onChangeText={setEventDescription}
                placeholder="Detalhes do evento..."
                placeholderTextColor="#9CA3AF"
                className="bg-white rounded-xl p-4 text-darkNavy"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View className="mb-4">
              <Text className="text-darkNavy font-medium mb-2">Participantes</Text>
              <View className="flex-row flex-wrap">
                {members.map((member) => (
                  <Pressable
                    key={member.id}
                    onPress={() => toggleMember(member.id)}
                    className={`mr-2 mb-2 px-4 py-2 rounded-full flex-row items-center ${
                      selectedMembers.includes(member.id) ? 'bg-teal' : 'bg-white'
                    }`}
                  >
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center mr-2"
                      style={{ backgroundColor: member.color }}
                    >
                      <Text className="text-white text-xs font-bold">{member.avatar}</Text>
                    </View>
                    <Text
                      className={`font-medium ${
                        selectedMembers.includes(member.id) ? 'text-white' : 'text-darkNavy'
                      }`}
                    >
                      {member.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Transport Form */}
        {modalType === 'transport' && (
          <>
            <View className="mb-4">
              <Text className="text-darkNavy font-medium mb-2">Nome da Crianca</Text>
              <TextInput
                value={childName}
                onChangeText={setChildName}
                placeholder="Ex: Lucas"
                placeholderTextColor="#9CA3AF"
                className="bg-white rounded-xl p-4 text-darkNavy"
              />
            </View>

            <View className="mb-4">
              <Text className="text-darkNavy font-medium mb-2">Tipo</Text>
              <View className="flex-row space-x-2">
                <Pressable
                  onPress={() => setTransportType('dropoff')}
                  className={`flex-1 py-3 rounded-xl items-center ${
                    transportType === 'dropoff' ? 'bg-sage' : 'bg-white'
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      transportType === 'dropoff' ? 'text-white' : 'text-darkNavy'
                    }`}
                  >
                    Levar
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setTransportType('pickup')}
                  className={`flex-1 py-3 rounded-xl items-center ${
                    transportType === 'pickup' ? 'bg-coral' : 'bg-white'
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      transportType === 'pickup' ? 'text-white' : 'text-darkNavy'
                    }`}
                  >
                    Buscar
                  </Text>
                </Pressable>
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-darkNavy font-medium mb-2">Local</Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="Ex: Escola"
                placeholderTextColor="#9CA3AF"
                className="bg-white rounded-xl p-4 text-darkNavy"
              />
            </View>

            <View className="mb-4">
              <Text className="text-darkNavy font-medium mb-2">Horario</Text>
              <TextInput
                value={transportTime}
                onChangeText={setTransportTime}
                placeholder="Ex: 07:30"
                placeholderTextColor="#9CA3AF"
                className="bg-white rounded-xl p-4 text-darkNavy"
              />
            </View>

            <View className="mb-4">
              <Text className="text-darkNavy font-medium mb-2">Dia da Semana</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
                <View className="flex-row space-x-2">
                  {DAYS.map((day, index) => (
                    <Pressable
                      key={index}
                      onPress={() => setSelectedDay(index)}
                      className={`w-12 h-12 rounded-full items-center justify-center ${
                        selectedDay === index ? 'bg-teal' : 'bg-white'
                      }`}
                    >
                      <Text
                        className={`font-medium text-sm ${
                          selectedDay === index ? 'text-white' : 'text-darkNavy'
                        }`}
                      >
                        {day}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>

            <View className="mb-4">
              <Text className="text-darkNavy font-medium mb-2">Responsavel</Text>
              <View className="flex-row flex-wrap">
                {members.map((member) => (
                  <Pressable
                    key={member.id}
                    onPress={() => setResponsibleMember(member.id)}
                    className={`mr-2 mb-2 px-4 py-2 rounded-full flex-row items-center ${
                      responsibleMember === member.id ? 'bg-teal' : 'bg-white'
                    }`}
                  >
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center mr-2"
                      style={{ backgroundColor: member.color }}
                    >
                      <Text className="text-white text-xs font-bold">{member.avatar}</Text>
                    </View>
                    <Text
                      className={`font-medium ${
                        responsibleMember === member.id ? 'text-white' : 'text-darkNavy'
                      }`}
                    >
                      {member.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        )}

        {/* Date Form */}
        {modalType === 'date' && (
          <>
            <View className="mb-4">
              <Text className="text-darkNavy font-medium mb-2">Titulo</Text>
              <TextInput
                value={dateTitle}
                onChangeText={setDateTitle}
                placeholder="Ex: Aniversario do Lucas"
                placeholderTextColor="#9CA3AF"
                className="bg-white rounded-xl p-4 text-darkNavy"
              />
            </View>

            <View className="mb-4">
              <Text className="text-darkNavy font-medium mb-2">Tipo</Text>
              <View className="flex-row flex-wrap">
                {DATE_TYPES.map((type) => (
                  <Pressable
                    key={type.key}
                    onPress={() => setDateType(type.key)}
                    className={`mr-2 mb-2 px-4 py-2 rounded-full ${
                      dateType === type.key ? 'bg-teal' : 'bg-white'
                    }`}
                  >
                    <Text
                      className={`font-medium ${
                        dateType === type.key ? 'text-white' : 'text-darkNavy'
                      }`}
                    >
                      {type.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-darkNavy font-medium mb-2">Data</Text>
              <View className="flex-row space-x-3">
                <View className="flex-1">
                  <TextInput
                    value={dateDay}
                    onChangeText={setDateDay}
                    placeholder="Dia"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    maxLength={2}
                    className="bg-white rounded-xl p-4 text-darkNavy text-center"
                  />
                </View>
                <View className="flex-1">
                  <TextInput
                    value={dateMonth}
                    onChangeText={setDateMonth}
                    placeholder="Mes"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    maxLength={2}
                    className="bg-white rounded-xl p-4 text-darkNavy text-center"
                  />
                </View>
              </View>
              <Text className="text-gray-400 text-xs mt-1 text-center">
                Digite o dia e o mes (ex: 15 e 03 para 15 de Marco)
              </Text>
            </View>

            <View className="mb-4">
              <Text className="text-darkNavy font-medium mb-2">Membro da Familia (opcional)</Text>
              <View className="flex-row flex-wrap">
                {members.map((member) => (
                  <Pressable
                    key={member.id}
                    onPress={() => setDateMember(dateMember === member.id ? '' : member.id)}
                    className={`mr-2 mb-2 px-4 py-2 rounded-full flex-row items-center ${
                      dateMember === member.id ? 'bg-teal' : 'bg-white'
                    }`}
                  >
                    <View
                      className="w-6 h-6 rounded-full items-center justify-center mr-2"
                      style={{ backgroundColor: member.color }}
                    >
                      <Text className="text-white text-xs font-bold">{member.avatar}</Text>
                    </View>
                    <Text
                      className={`font-medium ${
                        dateMember === member.id ? 'text-white' : 'text-darkNavy'
                      }`}
                    >
                      {member.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        )}

        <View className="h-8" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
