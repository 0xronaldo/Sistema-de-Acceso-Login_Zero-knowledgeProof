/**
 * Configuración de Wagmi y RainbowKit
 */

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { polygon, polygonAmoy } from 'wagmi/chains';

// Configuración de RainbowKit
export const config = getDefaultConfig({
  appName: 'ZKP Login Demo',
  projectId: 'YOUR_PROJECT_ID', // Reemplazar con tu Project ID de WalletConnect
  chains: [polygonAmoy, polygon],
  ssr: false, // Si usas SSR, cambiar a true
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
        http: ['https://rpc-amoy.polygon.technology'],
      },
      public: {
        http: ['https://rpc-amoy.polygon.technology'],
      },
    },
    blockExplorers: {
      default: { name: 'Polygonscan', url: 'https://amoy.polygonscan.com' },
    },
    testnet: true,
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