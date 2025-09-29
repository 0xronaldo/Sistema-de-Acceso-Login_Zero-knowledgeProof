/**
 * Configuración de Wagmi y RainbowKit
 */

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon, polygonAmoy } from 'wagmi/chains';
import { http } from 'wagmi';

// Configuración de RainbowKit
export const config = getDefaultConfig({
  appName: 'ZKP Login Demo',
  projectId: 'c87663dfb9906c400940516d59cc924c', // Project ID público para desarrollo
  chains: [polygonAmoy, polygon],
  transports: {
    [polygonAmoy.id]: http('https://rpc-amoy.polygon.technology/'),
    [polygon.id]: http('https://polygon-rpc.com/')
  },
  ssr: false,
});

// Configuraciones de red
export const SUPPORTED_CHAINS = {
  POLYGON_AMOY: {
    id: 80002,
    name: 'Polygon Amoy Testnet',
    network: 'polygon-amoy',
    nativeCurrency: {
      decimals: 18,
      name: 'MATIC',
      symbol: 'MATIC',
    },
    rpcUrls: {
      default: {
        http: ['https://rpc-amoy.polygon.technology/'],
      },
      public: {
        http: [
          'https://rpc-amoy.polygon.technology/',
          'https://polygon-amoy-bor-rpc.publicnode.com',
          'https://polygon-amoy.drpc.org'
        ],
      },
    },
    blockExplorers: {
      default: { name: 'Polygonscan', url: 'https://amoy.polygonscan.com' },
    },
    contracts: {
      issuerStateContract: '0x1a4cC30f2aA0377b0c3bc9848766D90cb4404124',
    },
    testnet: true,
    faucets: [
      'https://www.alchemy.com/faucets/polygon-amoy',
      'https://faucet.polygon.technology/'
    ],
  },
  POLYGON: {
    id: 137,
    name: 'Polygon',
    network: 'matic',
    nativeCurrency: {
      decimals: 18,
      name: 'MATIC',
      symbol: 'MATIC',
    },
    rpcUrls: {
      default: {
        http: ['https://polygon-rpc.com'],
      },
      public: {
        http: ['https://polygon-rpc.com'],
      },
    },
    blockExplorers: {
      default: { name: 'Polygonscan', url: 'https://polygonscan.com' },
    },
  },
};