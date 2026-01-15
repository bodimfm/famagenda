# Guia de Deploy - FAMAGENDA

Este guia explica como fazer o deploy da aplicação FAMAGENDA para a App Store.

## Pré-requisitos

1. **Conta Apple Developer** - Você precisa de uma conta Apple Developer ativa
2. **App Store Connect** - Seu app deve estar configurado no App Store Connect
3. **EAS CLI** - Instale globalmente: `npm install -g eas-cli`
4. **Credenciais** - Configure suas credenciais Apple

## Configuração Inicial

### 1. Login no Expo
```bash
eas login
```

### 2. Verificar Configuração do Projeto

O arquivo `eas.json` já está configurado com os perfis necessários para iOS:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "bodimfm@gmail.com",
        "ascAppId": "6740013313",
        "appleTeamId": "W8W4YXE48X"
      }
    }
  }
}
```

### 3. Obter IDs Necessários (se precisar atualizar)

#### App Store Connect App ID (ascAppId)
1. Acesse [App Store Connect](https://appstoreconnect.apple.com/)
2. Vá em "Meus Apps"
3. Selecione o app FAMAGENDA
4. O ID numérico aparece na URL ou na seção "Informações do App"

#### Apple Team ID (appleTeamId)
1. No App Store Connect, vá em "Usuários e Acesso"
2. Selecione seu usuário
3. O Team ID será exibido nos detalhes

#### Apple ID (appleId)
- É o email da sua conta Apple Developer (já configurado como bodimfm@gmail.com)

## Processo de Build

### Build de Produção para iOS

```bash
# Build para produção
eas build --platform ios --profile production

# Build com submit automático
eas build --platform ios --profile production --auto-submit
```

O EAS irá:
1. Criar o build na nuvem
2. Incrementar automaticamente o buildNumber (configurado com `autoIncrement: true`)
3. Gerar o arquivo IPA pronto para a App Store

## Submissão para App Store

### Método 1: Submeter o último build
```bash
npx eas submit --platform ios --profile production
```

### Método 2: Submeter um build específico
```bash
# Listar builds disponíveis
eas build:list --platform ios

# Submeter build específico
npx eas submit --platform ios --id [BUILD_ID]
```

### Método 3: Para CI/CD (não-interativo)
```bash
npx eas submit --platform ios --profile production --non-interactive
```

## Variáveis de Ambiente para CI/CD

Se você está configurando CI/CD, configure estas variáveis de ambiente:

```bash
EXPO_TOKEN=your_expo_token
EXPO_APPLE_ID=bodimfm@gmail.com
EXPO_APPLE_APP_SPECIFIC_PASSWORD=your_app_specific_password
```

Para gerar um App-Specific Password:
1. Acesse [appleid.apple.com](https://appleid.apple.com/)
2. Vá em "Segurança"
3. Clique em "Gerar senha..." em "Senhas de apps"

## Configurações Importantes

### Bundle Identifier
- iOS: `com.famagenda.app`
- Android: `com.famagenda.app`

### Versão do App
- Versão atual: `1.0.0` (definido em `app.json`)
- Build Number: incrementado automaticamente pelo EAS

### Criptografia
O app usa `ITSAppUsesNonExemptEncryption: false` porque não utiliza criptografia além da fornecida pela Apple.

## Troubleshooting

### Problema: EAS pede ascAppId mesmo configurado
**Solução**: Verifique se o formato do ID está correto (deve ser numérico) e se o perfil está correto no comando.

### Problema: Credenciais inválidas
**Solução**: Execute `eas credentials` para reconfigurar as credenciais:
```bash
eas credentials --platform ios
```

### Problema: Build falha
**Solução**: Verifique os logs do build:
```bash
eas build:list
# Clique no link do build para ver os logs completos
```

## Checklist de Submissão

Antes de submeter para a App Store, verifique:

- [ ] Todas as dependências estão instaladas e atualizadas
- [ ] O app foi testado em dispositivos iOS físicos
- [ ] Screenshots e assets estão preparados no App Store Connect
- [ ] Descrição e informações do app estão atualizadas
- [ ] Privacy Policy está configurada (se necessário)
- [ ] Build number foi incrementado
- [ ] Todas as permissões (câmera, localização, etc.) estão justificadas

## Comandos Úteis

```bash
# Verificar status de builds
eas build:list --platform ios

# Verificar credenciais
eas credentials --platform ios

# Ver versão do EAS CLI
eas --version

# Atualizar EAS CLI
npm install -g eas-cli@latest
```

## Links Úteis

- [Documentação EAS Submit](https://docs.expo.dev/submit/ios/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Apple Developer Portal](https://developer.apple.com/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

## Suporte

Para problemas ou dúvidas:
1. Consulte a [documentação oficial do Expo EAS](https://docs.expo.dev/)
2. Verifique o [fórum do Expo](https://forums.expo.dev/)
3. Abra uma issue no repositório do projeto
