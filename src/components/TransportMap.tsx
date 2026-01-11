import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { MapPin, Navigation, X } from 'lucide-react-native';
import { useFamilyStore } from '@/lib/store';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface TransportMapProps {
  visible: boolean;
  onClose: () => void;
}

interface LocationCoords {
  latitude: number;
  longitude: number;
}

// Predefined locations for demo (Sao Paulo area)
const KNOWN_LOCATIONS: Record<string, LocationCoords> = {
  'Escola': { latitude: -23.5505, longitude: -46.6333 },
  'Casa': { latitude: -23.5489, longitude: -46.6388 },
  'Ballet': { latitude: -23.5520, longitude: -46.6280 },
  'Futebol': { latitude: -23.5450, longitude: -46.6400 },
};

export function TransportMap({ visible, onClose }: TransportMapProps) {
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const pickups = useFamilyStore((s) => s.pickups);
  const members = useFamilyStore((s) => s.members);

  useEffect(() => {
    if (visible) {
      requestLocation();
    }
  }, [visible]);

  const requestLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        setLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      // Use default location (Sao Paulo)
      setUserLocation({ latitude: -23.5489, longitude: -46.6388 });
    }
    setLoading(false);
  };

  const getLocationCoords = (locationName: string): LocationCoords => {
    return KNOWN_LOCATIONS[locationName] ?? KNOWN_LOCATIONS['Escola'];
  };

  const uniqueLocations = [...new Set(pickups.map((p) => p.location))];

  const getRouteCoordinates = (): LocationCoords[] => {
    if (!userLocation) return [];

    const route: LocationCoords[] = [userLocation];
    uniqueLocations.forEach((loc) => {
      route.push(getLocationCoords(loc));
    });
    return route;
  };

  if (!visible) return null;

  const initialRegion = userLocation ?? { latitude: -23.5489, longitude: -46.6388 };

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      className="absolute inset-0 bg-white z-50"
    >
      {/* Header */}
      <View className="absolute top-0 left-0 right-0 z-10 bg-white/95 pt-14 pb-4 px-5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="bg-teal/10 p-2 rounded-full mr-3">
              <Navigation size={20} color="#1B7C7C" />
            </View>
            <View>
              <Text className="text-darkNavy font-bold text-lg">Mapa de Trajetos</Text>
              <Text className="text-darkNavy/60 text-sm">Locais de transporte</Text>
            </View>
          </View>
          <Pressable onPress={onClose} className="bg-gray-100 p-2 rounded-full">
            <X size={24} color="#0D3B5C" />
          </Pressable>
        </View>
      </View>

      {/* Map */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#1B7C7C" />
          <Text className="text-darkNavy/60 mt-4">Carregando mapa...</Text>
        </View>
      ) : permissionDenied ? (
        <View className="flex-1 items-center justify-center px-8">
          <MapPin size={48} color="#9CA3AF" />
          <Text className="text-darkNavy font-bold text-lg mt-4 text-center">
            Permissao de localizacao necessaria
          </Text>
          <Text className="text-darkNavy/60 text-center mt-2">
            Permitir localizacao para ver o mapa com sua posicao atual
          </Text>
          <Pressable
            onPress={requestLocation}
            className="bg-teal px-6 py-3 rounded-full mt-6"
          >
            <Text className="text-white font-semibold">Tentar Novamente</Text>
          </Pressable>
        </View>
      ) : (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            ...initialRegion,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {/* Location Markers */}
          {uniqueLocations.map((location, index) => {
            const coords = getLocationCoords(location);
            const pickupsAtLocation = pickups.filter((p) => p.location === location);

            return (
              <Marker
                key={location}
                coordinate={coords}
                title={location}
                description={`${pickupsAtLocation.length} transportes agendados`}
                pinColor="#1B7C7C"
              />
            );
          })}

          {/* Route Polyline */}
          {userLocation && uniqueLocations.length > 0 && (
            <Polyline
              coordinates={getRouteCoordinates()}
              strokeColor="#1B7C7C"
              strokeWidth={3}
              lineDashPattern={[10, 5]}
            />
          )}
        </MapView>
      )}

      {/* Bottom Legend */}
      {!loading && !permissionDenied && (
        <View className="absolute bottom-8 left-4 right-4 bg-white rounded-2xl p-4 shadow-lg">
          <Text className="text-darkNavy font-bold text-sm mb-3">Locais de Transporte</Text>
          <View className="flex-row flex-wrap gap-2">
            {uniqueLocations.map((location) => {
              const count = pickups.filter((p) => p.location === location).length;
              return (
                <View
                  key={location}
                  className="flex-row items-center bg-teal/10 px-3 py-2 rounded-full"
                >
                  <MapPin size={14} color="#1B7C7C" />
                  <Text className="text-darkNavy text-sm ml-1 font-medium">
                    {location} ({count})
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}
    </Animated.View>
  );
}
