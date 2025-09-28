// Configuración alternativa de Wagmi sin depender fuertemente de MetaMask SDK
import { http, createConfig } from 'wagmi'
import { polygonAmoy, polygon } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

// Configuración más liviana que evita el SDK de MetaMask problemático
export const lightweightConfig = createConfig({
  chains: [polygonAmoy, polygon],
  connectors: [
    injected({
      target: () => ({
        id: 'injected',
        name: 'Injected Wallet',
        provider: window.ethereum,
      }),
    }),
    walletConnect({
      projectId: process.env.REACT_APP_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
      metadata: {
        name: 'ZKP Login',
        description: 'Zero Knowledge Proof Authentication System',
        url: 'https://localhost:3000',
        icons: ['https://localhost:3000/logo192.png']
      }
    })
  ],
  transports: {
    [polygonAmoy.id]: http('https://rpc-amoy.polygon.technology/'),
    [polygon.id]: http('https://polygon-rpc.com/')
  },
})

export default lightweightConfig;