import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Film, Search, Star, Clock, X, Plus, Heart, Calendar } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useFamilyStore } from '@/lib/store';
import * as Haptics from 'expo-haptics';

const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY;

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  runtime?: number;
  genres?: { id: number; name: string }[];
}

interface MovieResponse {
  results: Movie[];
}

async function fetchTrendingMovies(): Promise<Movie[]> {
  const response = await fetch(
    'https://api.themoviedb.org/3/trending/movie/week',
    {
      headers: {
        Authorization: `Bearer ${TMDB_API_KEY}`,
      },
    }
  );

  if (!response.ok) throw new Error('Failed to fetch trending movies');
  const data: MovieResponse = await response.json();
  return data.results;
}

async function searchMovies(query: string): Promise<Movie[]> {
  if (!query.trim()) return [];

  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&language=pt-BR`,
    {
      headers: {
        Authorization: `Bearer ${TMDB_API_KEY}`,
      },
    }
  );

  if (!response.ok) throw new Error('Failed to search movies');
  const data: MovieResponse = await response.json();
  return data.results;
}

async function fetchMovieDetails(movieId: number): Promise<Movie> {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}?append_to_response=videos&language=pt-BR`,
    {
      headers: {
        Authorization: `Bearer ${TMDB_API_KEY}`,
      },
    }
  );

  if (!response.ok) throw new Error('Failed to fetch movie details');
  return response.json();
}

function MovieCard({
  movie,
  index,
  onPress,
}: {
  movie: Movie;
  index: number;
  onPress: () => void;
}) {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
    : null;

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
      <Pressable
        onPress={onPress}
        className="mr-4 active:scale-95"
        style={{ width: 140 }}
      >
        <View className="rounded-2xl overflow-hidden bg-gray-200">
          {posterUrl ? (
            <Image
              source={{ uri: posterUrl }}
              style={{ width: 140, height: 210 }}
              resizeMode="cover"
            />
          ) : (
            <View
              className="items-center justify-center bg-gray-300"
              style={{ width: 140, height: 210 }}
            >
              <Film size={32} color="#9CA3AF" />
            </View>
          )}
        </View>
        <View className="mt-2">
          <Text className="text-darkNavy font-semibold text-sm" numberOfLines={2}>
            {movie.title}
          </Text>
          <View className="flex-row items-center mt-1">
            <Star size={12} color="#F59E0B" fill="#F59E0B" />
            <Text className="text-darkNavy/60 text-xs ml-1">
              {movie.vote_average.toFixed(1)}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function MovieDetailModal({
  movie,
  visible,
  onClose,
  onSchedule,
}: {
  movie: Movie | null;
  visible: boolean;
  onClose: () => void;
  onSchedule: (movie: Movie) => void;
}) {
  const { data: details, isLoading } = useQuery({
    queryKey: ['movie-details', movie?.id, movie],
    queryFn: () => (movie ? fetchMovieDetails(movie.id) : Promise.resolve(null)),
    enabled: !!movie && visible,
  });

  if (!movie) return null;

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
    : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-cream">
        {/* Header Image */}
        {backdropUrl && (
          <View style={{ height: 220 }}>
            <Image
              source={{ uri: backdropUrl }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(253, 248, 243, 1)']}
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 100,
              }}
            />
          </View>
        )}

        {/* Close Button */}
        <Pressable
          onPress={onClose}
          className="absolute top-14 right-4 bg-black/30 p-2 rounded-full"
        >
          <X size={24} color="white" />
        </Pressable>

        <ScrollView className="flex-1 px-5 -mt-8" showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeIn.delay(100)}>
            <Text className="text-darkNavy font-bold text-2xl">{movie.title}</Text>

            <View className="flex-row items-center mt-2 space-x-4">
              <View className="flex-row items-center">
                <Star size={16} color="#F59E0B" fill="#F59E0B" />
                <Text className="text-darkNavy/70 ml-1">
                  {movie.vote_average.toFixed(1)}
                </Text>
              </View>
              {movie.release_date && (
                <Text className="text-darkNavy/60">
                  {new Date(movie.release_date).getFullYear()}
                </Text>
              )}
              {details?.runtime && (
                <View className="flex-row items-center">
                  <Clock size={14} color="#6B7280" />
                  <Text className="text-darkNavy/60 ml-1">{details.runtime} min</Text>
                </View>
              )}
            </View>

            {details?.genres && details.genres.length > 0 && (
              <View className="flex-row flex-wrap mt-3 gap-2">
                {details.genres.map((genre) => (
                  <View
                    key={genre.id}
                    className="bg-teal/10 px-3 py-1 rounded-full"
                  >
                    <Text className="text-teal text-sm">{genre.name}</Text>
                  </View>
                ))}
              </View>
            )}

            <Text className="text-darkNavy/80 mt-4 leading-relaxed">
              {movie.overview || 'Descricao nao disponivel.'}
            </Text>

            {/* Action Buttons */}
            <View className="flex-row space-x-3 mt-6 mb-8">
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onSchedule(movie);
                }}
                className="flex-1 bg-teal py-4 rounded-xl flex-row items-center justify-center"
              >
                <Calendar size={20} color="white" />
                <Text className="text-white font-bold ml-2">Agendar Sessao</Text>
              </Pressable>
              <Pressable className="bg-darkNavy/10 p-4 rounded-xl">
                <Heart size={20} color="#0D3B5C" />
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>

        {isLoading && (
          <View className="absolute inset-0 items-center justify-center bg-cream/50">
            <ActivityIndicator size="large" color="#1B7C7C" />
          </View>
        )}
      </View>
    </Modal>
  );
}

export default function MoviesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const addEvent = useFamilyStore((s) => s.addEvent);
  const members = useFamilyStore((s) => s.members);

  const {
    data: trendingMovies,
    isLoading: loadingTrending,
    error: trendingError,
  } = useQuery({
    queryKey: ['trending-movies'],
    queryFn: fetchTrendingMovies,
  });

  const {
    data: searchResults,
    isLoading: loadingSearch,
  } = useQuery({
    queryKey: ['search-movies', searchQuery],
    queryFn: () => searchMovies(searchQuery),
    enabled: searchQuery.length > 2,
  });

  const handleMoviePress = (movie: Movie) => {
    setSelectedMovie(movie);
    setShowDetail(true);
  };

  const handleScheduleMovie = (movie: Movie) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Schedule movie for next Saturday
    const nextSaturday = new Date();
    nextSaturday.setDate(nextSaturday.getDate() + ((6 - nextSaturday.getDay() + 7) % 7 || 7));

    addEvent({
      title: `Noite de Cinema: ${movie.title}`,
      date: nextSaturday.toISOString(),
      time: '20:00',
      membersInvolved: members.map((m) => m.id),
      description: movie.overview,
      type: 'activity',
    });

    setShowDetail(false);
    setSelectedMovie(null);
  };

  const displayMovies = searchQuery.length > 2 ? searchResults : trendingMovies;
  const isLoading = searchQuery.length > 2 ? loadingSearch : loadingTrending;

  // Family-friendly categories
  const familyMovies = trendingMovies?.filter(
    (m) => m.vote_average >= 6.5
  ) ?? [];

  return (
    <View className="flex-1 bg-cream">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View className="px-5 pt-4">
          <View className="bg-white rounded-xl flex-row items-center px-4 py-3">
            <Search size={20} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar filmes..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 ml-3 text-darkNavy"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <X size={18} color="#9CA3AF" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Search Results or Trending */}
        {searchQuery.length > 2 ? (
          <View className="px-5 mt-6">
            <Text className="text-darkNavy font-bold text-lg mb-4">Resultados</Text>
            {loadingSearch ? (
              <ActivityIndicator size="large" color="#1B7C7C" />
            ) : searchResults && searchResults.length > 0 ? (
              <View className="flex-row flex-wrap justify-between">
                {searchResults.slice(0, 6).map((movie, index) => (
                  <View key={movie.id} style={{ width: '48%', marginBottom: 16 }}>
                    <MovieCard
                      movie={movie}
                      index={index}
                      onPress={() => handleMoviePress(movie)}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <View className="items-center py-8">
                <Film size={48} color="#9CA3AF" />
                <Text className="text-gray-400 mt-4">Nenhum filme encontrado</Text>
              </View>
            )}
          </View>
        ) : (
          <>
            {/* Trending Movies */}
            <View className="mt-6">
              <Text className="text-darkNavy font-bold text-lg mb-4 px-5">
                Em Alta Esta Semana
              </Text>
              {loadingTrending ? (
                <ActivityIndicator size="large" color="#1B7C7C" />
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingLeft: 20, paddingRight: 4 }}
                  style={{ flexGrow: 0 }}
                >
                  {trendingMovies?.slice(0, 10).map((movie, index) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      index={index}
                      onPress={() => handleMoviePress(movie)}
                    />
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Family Picks */}
            <View className="mt-8 mb-8">
              <Text className="text-darkNavy font-bold text-lg mb-4 px-5">
                Recomendados para Familia
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 20, paddingRight: 4 }}
                style={{ flexGrow: 0 }}
              >
                {familyMovies.slice(0, 10).map((movie, index) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    index={index}
                    onPress={() => handleMoviePress(movie)}
                  />
                ))}
              </ScrollView>
            </View>
          </>
        )}
      </ScrollView>

      {/* Movie Detail Modal */}
      <MovieDetailModal
        movie={selectedMovie}
        visible={showDetail}
        onClose={() => {
          setShowDetail(false);
          setSelectedMovie(null);
        }}
        onSchedule={handleScheduleMovie}
      />
    </View>
  );
}
