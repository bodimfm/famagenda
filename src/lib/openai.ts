import {
  CalendarEvent,
  FamilyMember,
  PickupDropoff,
  ShoppingItem,
  WishlistItem,
  ImportantDate,
  CustomList,
  Pet,
} from './store';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const OPENAI_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

interface FamilyData {
  members: FamilyMember[];
  events: CalendarEvent[];
  pickups: PickupDropoff[];
  shoppingItems: ShoppingItem[];
  wishlistItems: WishlistItem[];
  importantDates: ImportantDate[];
  customLists: CustomList[];
  pets: Pet[];
}

export async function generateFamilyOverview(data: FamilyData): Promise<string> {
  const today = new Date();
  const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
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
      return `- ${e.title} em ${eventDate.toLocaleDateString('pt-BR')} ${e.time ? `às ${e.time}` : ''} (${memberNames || 'Todos'}) [Tipo: ${e.type}]`;
    })
    .join('\n');

  // Format today's pickups/dropoffs
  const todayTransport = data.pickups
    .filter((p) => p.dayOfWeek === today.getDay())
    .map((p) => {
      const responsible = data.members.find((m) => m.id === p.responsibleMemberId);
      return `- ${p.type === 'dropoff' ? 'Levar' : 'Buscar'} ${p.childName} na ${p.location} às ${p.time} (Responsável: ${responsible?.name ?? 'N/A'})${p.recurring ? ' [Recorrente]' : ''}`;
    })
    .join('\n');

  // Format all pickups/dropoffs for the week
  const weekTransport = data.pickups
    .map((p) => {
      const responsible = data.members.find((m) => m.id === p.responsibleMemberId);
      return `- ${dayNames[p.dayOfWeek]}: ${p.type === 'dropoff' ? 'Levar' : 'Buscar'} ${p.childName} na ${p.location} às ${p.time} (${responsible?.name ?? 'N/A'})`;
    })
    .join('\n');

  // Format pending shopping items by category
  const pendingByCategory: Record<string, string[]> = { grocery: [], household: [], other: [] };
  data.shoppingItems
    .filter((item) => !item.completed)
    .forEach((item) => {
      const text = `${item.name}${item.quantity ? ` (x${item.quantity})` : ''}`;
      pendingByCategory[item.category]?.push(text);
    });

  const pendingShopping = [
    pendingByCategory.grocery.length > 0 ? `Alimentos: ${pendingByCategory.grocery.join(', ')}` : '',
    pendingByCategory.household.length > 0 ? `Casa: ${pendingByCategory.household.join(', ')}` : '',
    pendingByCategory.other.length > 0 ? `Outros: ${pendingByCategory.other.join(', ')}` : '',
  ].filter(Boolean).join('\n');

  // Format wishlist items
  const wishlist = data.wishlistItems
    .map((item) => {
      const addedBy = data.members.find((m) => m.id === item.addedBy);
      return `- ${item.name}${item.price ? ` - ${item.price}` : ''} (Adicionado por: ${addedBy?.name ?? 'N/A'}, Prioridade: ${item.priority === 'high' ? 'Alta' : item.priority === 'medium' ? 'Média' : 'Baixa'})`;
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
        const typeLabel = d.type === 'birthday' ? 'Aniversário' : d.type === 'anniversary' ? 'Aniversário de casamento' : d.type === 'holiday' ? 'Feriado' : 'Evento';
        return { ...d, daysUntil: diffDays, typeLabel };
      }
      return null;
    })
    .filter(Boolean)
    .map((d) => `- ${d!.typeLabel}: ${d!.title} em ${d!.daysUntil} dias${d!.recurring ? ' [Recorrente]' : ''}`)
    .join('\n');

  // Format custom lists with pending items
  const customListsFormatted = data.customLists
    .filter((list) => list.items.some((item) => !item.completed))
    .map((list) => {
      const pendingItems = list.items
        .filter((item) => !item.completed)
        .map((item) => item.text)
        .join(', ');
      return `- ${list.name}: ${pendingItems}`;
    })
    .join('\n');

  // Format pets information
  const petsFormatted = data.pets
    .map((pet) => {
      const petType = {
        dog: 'Cachorro',
        cat: 'Gato',
        bird: 'Pássaro',
        fish: 'Peixe',
        rabbit: 'Coelho',
        hamster: 'Hamster',
        other: 'Outro'
      }[pet.type];

      // Check upcoming vaccines
      const upcomingVaccines = pet.vaccines
        .filter((v) => v.nextDate)
        .map((v) => {
          const nextDate = new Date(v.nextDate!);
          const diffDays = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays <= 30) {
            return `${v.name} em ${diffDays} dias`;
          }
          return null;
        })
        .filter(Boolean);

      // Check last bath
      const lastBath = pet.baths.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      const lastBathInfo = lastBath
        ? `Último banho: ${new Date(lastBath.date).toLocaleDateString('pt-BR')}`
        : 'Sem banhos registrados';

      return `- ${pet.name} (${petType}${pet.breed ? `, ${pet.breed}` : ''})
    ${lastBathInfo}
    ${upcomingVaccines.length > 0 ? `Vacinas próximas: ${upcomingVaccines.join(', ')}` : 'Vacinas em dia'}`;
    })
    .join('\n');

  const userPrompt = `Com base nos dados abaixo, crie um resumo breve e útil em português brasileiro sobre as obrigações e tarefas da família para os próximos dias. Seja conciso, amigável e direto. Use emojis com moderação.

DADOS COMPLETOS DA FAMÍLIA:

👥 MEMBROS: ${data.members.length > 0 ? data.members.map((m) => m.name).join(', ') : 'Nenhum membro cadastrado'}

📅 Hoje é ${todayName}, ${today.toLocaleDateString('pt-BR')}.

📆 EVENTOS DOS PRÓXIMOS 7 DIAS:
${upcomingEvents || 'Nenhum evento agendado'}

🚗 TRANSPORTE DE HOJE:
${todayTransport || 'Nenhum transporte agendado para hoje'}

📋 ROTINA DE TRANSPORTE DA SEMANA:
${weekTransport || 'Nenhuma rotina de transporte cadastrada'}

🛒 LISTA DE COMPRAS PENDENTE:
${pendingShopping || 'Lista vazia'}

🎁 LISTA DE DESEJOS:
${wishlist || 'Nenhum item'}

🎂 DATAS IMPORTANTES PRÓXIMAS (30 dias):
${upcomingDates || 'Nenhuma data próxima'}

📝 LISTAS PERSONALIZADAS PENDENTES:
${customListsFormatted || 'Nenhuma lista pendente'}

🐾 PETS DA FAMÍLIA:
${petsFormatted || 'Nenhum pet cadastrado'}

Faça um resumo organizado destacando:
1. O que precisa ser feito HOJE (urgente) - transporte, eventos, tarefas
2. Próximos compromissos importantes da semana
3. Lembretes úteis (compras, datas especiais, cuidados com pets)
4. Itens pendentes nas listas que merecem atenção

Mantenha o tom leve e encorajador. Se não houver dados em alguma categoria, não mencione.`;

  const response = await fetch(OPENAI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um assistente de família carinhoso e organizado chamado FamíliaIA. Responda sempre em português brasileiro de forma clara e objetiva. Seu objetivo é ajudar a família a se organizar melhor.',
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('OpenAI API error:', error);
    throw new Error('Falha ao gerar resumo. Verifique sua conexão e tente novamente.');
  }

  const responseData = await response.json();
  const text = responseData.choices?.[0]?.message?.content ?? '';

  if (!text) {
    throw new Error('Resposta vazia da IA. Tente novamente.');
  }

  return text;
}
