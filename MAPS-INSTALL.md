Instalar react-native-maps (mapa interativo)

1) No terminal do projeto execute:

```bash
expo install react-native-maps
```

2) Android: em muitos casos um rebuild / dev-client é necessário para suporte nativo.
Se estiver usando Expo Go no Android, `react-native-maps` pode requerer um dev-client (EAS) — siga a documentação do Expo.

3) iOS: execute `npx pod-install ios` se estiver desenvolvendo nativamente.

Uso no app
- O mapa é carregado dinamicamente; após instalar a lib, reinicie o Metro/Expo.
- Para melhor experiência com notificações e serviços nativos, considere criar um dev-client com EAS.

Referências
- https://github.com/react-native-maps/react-native-maps
- https://docs.expo.dev/clients/installation/