# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
bun install            # Install dependencies
bun start              # Start Expo dev server (port 8081)
bun run lint           # Run ESLint
bun run typecheck      # TypeScript type checking
npx expo prebuild      # Generate native iOS/Android projects
eas build --platform ios --profile preview  # Build iOS preview
eas build --platform ios --profile production  # Build iOS production
eas submit --platform ios  # Submit to App Store
```

## Architecture

**FAMAGENDA** is a family organization app for calendar, shopping, transport, and pet management.

### Tech Stack
- **Expo SDK 53** with React Native 0.79.6
- **React 19** with TypeScript strict mode
- **Bun** as package manager (not npm/yarn)
- **NativeWind + Tailwind v3** for styling
- **React Query** for server/async state
- **Zustand** for local state with AsyncStorage persistence
- **Expo Router** for file-based navigation

### State Management

Two Zustand stores with AsyncStorage persistence:

| Store | File | Purpose |
|-------|------|---------|
| `useAuthStore` | `src/lib/auth-store.ts` | User auth, family groups, invites |
| `useFamilyStore` | `src/lib/store.ts` | All family data: events, shopping, pets, custom lists |

```typescript
// Always use selectors to prevent re-renders
const user = useAuthStore(s => s.user)
const addEvent = useFamilyStore(s => s.addEvent)
```

### Key Files

| File | Purpose |
|------|---------|
| `src/app/_layout.tsx` | Root layout with providers (QueryClient → Gesture → Keyboard → Theme) |
| `src/app/(tabs)/_layout.tsx` | Tab navigator (7 visible tabs, 3 hidden) |
| `src/lib/supabase.ts` | Custom REST client for Supabase |
| `src/lib/openai.ts` | OpenAI integration |
| `src/lib/gemini.ts` | Google Gemini integration |
| `src/lib/revenuecatClient.ts` | RevenueCat in-app purchases |

### Provider Order (root layout)
```
QueryClientProvider → GestureHandlerRootView → KeyboardProvider → ThemeProvider → Stack
```

## Data Models

Key interfaces in `src/lib/store.ts`:

- **FamilyMember**: id, name, color, avatar, isAdult
- **CalendarEvent**: id, title, date, time, type ('event'|'appointment'|'activity'), membersInvolved
- **ShoppingItem**: id, name, quantity, completed, addedBy, category ('grocery'|'household'|'other')
- **Pet**: id, name, type, breed, birthDate, color, vaccines[], baths[]
- **CustomList**: id, name, icon, color, items[]

## Theme Colors

```typescript
// Primary
'#1B7C7C'  // Teal (active tabs, primary actions)
'#0D3B5C'  // Dark blue (headers, emphasis)
'#FDF8F3'  // Cream (backgrounds)
'#9CA3AF'  // Gray (inactive states)

// Event gradients
Event:       ['#1B7C7C', '#2FA8A8']
Appointment: ['#0D3B5C', '#1B5A7D']
Activity:    ['#6FA899', '#8FB5A9']
```

## Environment Variables

Configure in `.env` file:

```bash
# Required for AI features
EXPO_PUBLIC_GOOGLE_API_KEY=     # Google Gemini API
EXPO_PUBLIC_OPENAI_API_KEY=     # OpenAI API

# Required for in-app purchases
EXPO_PUBLIC_REVENUECAT_APPLE_KEY=   # RevenueCat iOS
EXPO_PUBLIC_REVENUECAT_GOOGLE_KEY=  # RevenueCat Android
EXPO_PUBLIC_REVENUECAT_TEST_KEY=    # RevenueCat test mode

# Optional features
EXPO_PUBLIC_TMDB_API_KEY=       # TMDB for movie features
EXPO_PUBLIC_SUPABASE_URL=       # Supabase backend
EXPO_PUBLIC_SUPABASE_KEY=       # Supabase anon key
```

## Project Structure

```
src/
├── app/              # Expo Router file-based routes
│   ├── _layout.tsx   # Root layout
│   ├── index.tsx     # Home screen
│   ├── login.tsx     # Auth flow
│   ├── (tabs)/       # Tab navigator screens
│   └── ...
├── components/       # Reusable UI components
└── lib/              # Utilities and business logic
    ├── cn.ts         # className merge helper
    ├── auth-store.ts # Auth state
    ├── store.ts      # Family data state
    ├── supabase.ts   # Backend client
    ├── openai.ts     # AI integration
    ├── gemini.ts     # AI integration
    └── revenuecatClient.ts # Payments
```

## iOS Deployment with EAS

### Initial Setup
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account
eas login

# Initialize EAS in the project (creates project ID)
eas init

# Configure builds
eas build:configure
```

### Building for iOS
```bash
# Development build (with dev client)
eas build --platform ios --profile development

# Preview build (for TestFlight)
eas build --platform ios --profile preview

# Production build
eas build --platform ios --profile production
```

### Submitting to App Store

**Prerequisites:**
1. App must be created in App Store Connect with a unique bundle identifier
2. Update `eas.json` with your App Store Connect App ID:
   - Find your App ID in App Store Connect under App Information
   - Replace `PLACEHOLDER_APP_STORE_CONNECT_APP_ID` in `eas.json` with your actual App ID

```bash
# Submit last build to App Store Connect
eas submit --platform ios

# Or submit a specific build
eas submit --platform ios --id [BUILD_ID]
```

## Code Conventions

### TypeScript
- Explicit type annotations for useState: `useState<Type[]>([])` not `useState([])`
- Null/undefined handling: use optional chaining `?.` and nullish coalescing `??`
- Include ALL required properties when creating objects

### Styling
- Use NativeWind for styling
- Use `cn()` helper from `src/lib/cn.ts` to merge classNames
- CameraView, LinearGradient, and Animated components DO NOT support className - use inline style prop

### Components
- Use Pressable over TouchableOpacity
- Use custom modals, not Alert.alert()
- Import SafeAreaView from react-native-safe-area-context, NOT from react-native

### State Management
- Always use React Query for async/server state
- Always use selectors with Zustand: `useStore(s => s.foo)` not `useStore()`
- Never wrap RootLayoutNav directly with providers

## Forbidden Files

Do not edit these files:
- `patches/` - Expo patches
- `babel.config.js` - Build config
- `metro.config.js` - Bundle config
- `tsconfig.json` - TypeScript config
- `nativewind-env.d.ts` - NativeWind types
