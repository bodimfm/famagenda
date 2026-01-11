# Agenda Familia

Aplicativo de coordenacao de agenda familiar para organizar compromissos, transporte de filhos, compras e datas importantes.

## Funcionalidades

### Autenticacao e Grupos Familiares
- **Cadastro e Login** - Sistema completo de autenticacao com email e senha
- **Criar Familia** - Crie um grupo familiar e receba um codigo de convite
- **Entrar com Codigo** - Entre em um grupo familiar existente com codigo de convite
- **Convidar Familiares** - Compartilhe o codigo por email ou outras formas
- **Perfil** - Gerencie sua conta e grupo familiar
- **Membros da Familia** - Adicione membros diretamente pelo nome, sem convite obrigatorio
  - Escolha nome e cor para cada membro
  - Envie convites por email ou compartilhe depois
  - Opcao de compartilhar convite personalizado para cada membro
  - Remova membros quando necessario

### Agenda (Tab Principal)
- Calendario mensal interativo
- Visualizacao de eventos por dia
- Eventos com cores por tipo (evento, compromisso, atividade)
- Avatares de membros da familia participantes
- **Agenda Integrada** - Mostra automaticamente:
  - Eventos da familia
  - Vacinas dos pets (proximas doses)
  - Banhos dos pets (sugere a cada 30 dias)
  - Compras pendentes
  - Transportes do dia (quem busca/leva)
- **Panorama da Familia com IA** - Botao que gera um resumo inteligente de todas as obrigacoes usando GPT-5-Nano (OpenAI)

### Quem busca? (Tab Transporte)
- Gerenciamento de quem leva e busca os filhos
- Organizacao por dia da semana
- Visualizacao de responsavel por cada transporte
- Horarios e locais
- **Mapa de Trajetos** - Visualizacao dos locais de transporte em mapa com Apple Maps

### Lista de Compras
- Lista interativa com checkbox
- Categorias: Mercado, Casa, Outros
- Marcar itens como comprados
- Limpar itens comprados
- **Compartilhar lista** - Envie a lista por WhatsApp, mensagem ou outros apps

### Listas Personalizadas (Nova Tab)
- Crie listas personalizadas para qualquer finalidade
- Escolha icone e cor para cada lista
- 11 icones disponiveis (lista, trabalho, coracao, estrela, casa, livro, musica, exercicio, comida, viagem, presente)
- 10 cores diferentes para personalizar
- Adicione, marque como concluido e remova itens
- Limpe itens concluidos de uma vez
- **Compartilhar lista** - Envie qualquer lista por WhatsApp, mensagem ou outros apps
- Persistencia automatica dos dados

### Filmes (Noite de Cinema)
- Catalogo de filmes em alta via TMDB
- Busca de filmes por nome
- Detalhes completos do filme (sinopse, nota, generos, duracao)
- Agendar sessao de cinema em familia automaticamente
- Recomendacoes para familia

### Datas Importantes
- Aniversarios
- Datas especiais (aniversario de casamento, etc)
- Feriados
- Contagem regressiva para proximas datas

### Pets (Nova Tab)
- Cadastro de pets com nome, tipo (cachorro, gato, passaro, peixe, coelho, hamster, outro) e raca
- Personalizacao com cores diferentes para cada pet
- **Vacinas** - Registro completo de vacinas com:
  - Nome e tipo da vacina (V8/V10, Antirrabica, Gripe, Giardia, etc.)
  - Data de aplicacao
  - Data da proxima dose (opcional)
  - Observacoes
- **Banhos** - Controle de banhos com:
  - Data do banho
  - Local (pet shop, em casa, etc.)
  - Observacoes
- Visualizacao rapida da proxima vacina e ultimo banho no card do pet

### Lista de Desejos (acessivel via outras telas)

## Membros da Familia (Exemplo)
- Pai (P)
- Mae (M)
- Lucas (L)
- Sofia (S)

## Cores do App
- Cream (#FDF8F3) - Fundo principal
- Dark Navy (#0D3B5C) - Texto principal
- Dark Navy Light (#1B5A7D) - Nuances de texto
- Teal (#1B7C7C) - Cor de destaque principal
- Sage (#8FB096) - Itens concluidos/levar
- Coral (#E8927C) - Buscar/alertas
