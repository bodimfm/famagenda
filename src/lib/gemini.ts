import {
  CalendarEvent,
  FamilyMember,
  PickupDropoff,
  ShoppingItem,
  WishlistItem,
  ImportantDate,
} from './store';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent';

interface FamilyData {
  members: FamilyMember[];
  events: CalendarEvent[];
  pickups: PickupDropoff[];
  shoppingItems: ShoppingItem[];
  wishlistItems: WishlistItem[];
  importantDates: ImportantDate[];
}

export async function generateFamilyOverview(data: FamilyData): Promise<string> {
  const today = new Date();
  const dayNames = ['Domingo', 'Segunda-feira', 'Terca-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sabado'];
  const todayName = dayNames[today.getDay()];

  // Format upcoming events (next 7 days)
  const upcomingEvents = data.events
    .filter((e) => {
      const eventDate = new Date(e.date);
      const diffDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    })
    .map((e) => {
      const eventDate = new Date(e.date);
      const memberNames = data.members
        .filter((m) => e.membersInvolved.includes(m.id))
        .map((m) => m.name)
        .join(', ');
      return `- ${e.title} em ${eventDate.toLocaleDateString('pt-BR')} ${e.time ? `as ${e.time}` : ''} (${memberNames})`;
    })
    .join('\n');

  // Format today's pickups/dropoffs
  const todayTransport = data.pickups
    .filter((p) => p.dayOfWeek === today.getDay())
    .map((p) => {
      const responsible = data.members.find((m) => m.id === p.responsibleMemberId);
      return `- ${p.type === 'dropoff' ? 'Levar' : 'Buscar'} ${p.childName} na ${p.location} as ${p.time} (${responsible?.name ?? 'N/A'})`;
    })
    .join('\n');

  // Format pending shopping items
  const pendingShopping = data.shoppingItems
    .filter((item) => !item.completed)
    .map((item) => `- ${item.name}${item.quantity ? ` (x${item.quantity})` : ''}`)
    .join('\n');

  // Format wishlist items
  const wishlist = data.wishlistItems
    .map((item) => {
      const addedBy = data.members.find((m) => m.id === item.addedBy);
      return `- ${item.name}${item.price ? ` - ${item.price}` : ''} (${addedBy?.name ?? 'N/A'}, prioridade ${item.priority})`;
    })
    .join('\n');

  // Format upcoming important dates
  const upcomingDates = data.importantDates
    .map((d) => {
      const [month, day] = d.date.split('-').map(Number);
      const thisYear = new Date(today.getFullYear(), month - 1, day);
      if (thisYear < today) {
        thisYear.setFullYear(today.getFullYear() + 1);
      }
      const diffDays = Math.ceil((thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 30) {
        return { ...d, daysUntil: diffDays };
      }
      return null;
    })
    .filter(Boolean)
    .map((d) => `- ${d!.title} em ${d!.daysUntil} dias`)
    .join('\n');

  const prompt = `Voce e um assistente de familia carinhoso e organizado. Com base nos dados abaixo, crie um resumo breve e util em portugues brasileiro sobre as obrigacoes e tarefas da familia para os proximos dias. Seja conciso, amigavel e direto. Use emojis com moderacao para deixar a mensagem mais agradavel.

DADOS DA FAMILIA:

Membros: ${data.members.map((m) => m.name).join(', ')}

Hoje e ${todayName}, ${today.toLocaleDateString('pt-BR')}.

EVENTOS DOS PROXIMOS 7 DIAS:
${upcomingEvents || 'Nenhum evento agendado'}

TRANSPORTE DE HOJE:
${todayTransport || 'Nenhum transporte agendado'}

LISTA DE COMPRAS PENDENTE:
${pendingShopping || 'Lista vazia'}

LISTA DE DESEJOS:
${wishlist || 'Nenhum item'}

DATAS IMPORTANTES PROXIMAS (30 dias):
${upcomingDates || 'Nenhuma data proxima'}

Por favor, faca um resumo organizado e amigavel destacando:
1. O que precisa ser feito HOJE (urgente)
2. Proximos compromissos importantes
3. Lembretes uteis (compras, datas especiais)

Mantenha o tom leve e encorajador, como se fosse um assistente pessoal da familia.`;

  const response = await fetch(GEMINI_ENDPOINT, {
    method: 'POST',
    headers: {
      'x-goog-api-key': GEMINI_API_KEY ?? '',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Gemini API error:', error);
    throw new Error('Falha ao gerar resumo. Tente novamente.');
  }

  const responseData = await response.json();
  const text = responseData.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  if (!text) {
    throw new Error('Resposta vazia da IA. Tente novamente.');
  }

  return text;
}
