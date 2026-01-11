import React from 'react';
import { Tabs } from 'expo-router';
import { Calendar, Car, ShoppingCart, Film, User, List, PawPrint } from 'lucide-react-native';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1B7C7C',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FDF8F3',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#FDF8F3',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: '#0D3B5C',
          fontSize: 18,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`p-2 rounded-xl ${focused ? 'bg-teal/10' : ''}`}
            >
              <Calendar size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="transport"
        options={{
          title: 'Quem busca?',
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`p-2 rounded-xl ${focused ? 'bg-teal/10' : ''}`}
            >
              <Car size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="shopping"
        options={{
          title: 'Compras',
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`p-2 rounded-xl ${focused ? 'bg-teal/10' : ''}`}
            >
              <ShoppingCart size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: 'Listas',
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`p-2 rounded-xl ${focused ? 'bg-teal/10' : ''}`}
            >
              <List size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="pets"
        options={{
          title: 'Pets',
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`p-2 rounded-xl ${focused ? 'bg-teal/10' : ''}`}
            >
              <PawPrint size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="movies"
        options={{
          title: 'Filmes',
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`p-2 rounded-xl ${focused ? 'bg-teal/10' : ''}`}
            >
              <Film size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`p-2 rounded-xl ${focused ? 'bg-teal/10' : ''}`}
            >
              <User size={22} color={color} strokeWidth={focused ? 2.5 : 2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="dates"
        options={{
          href: null, // Hidden - accessible from other screens
        }}
      />
      <Tabs.Screen
        name="wishlist"
        options={{
          href: null, // Hidden - accessible from other screens
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          href: null, // Hide this tab
        }}
      />
    </Tabs>
  );
}
