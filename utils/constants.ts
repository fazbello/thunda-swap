// Example contract address mapping for different EVM chains
export const RouterAddresses: { [chainId: number]: string } = {
  1: "0x...",      // Ethereum Mainnet
  56: "0x...",     // BSC
  137: "0x...",    // Polygon
  8453: "0x...",   // Base
  // Add all supported EVMs
};

export const FactoryAddresses: { [chainId: number]: string } = {
  1: "0x...",      // Ethereum Mainnet
  56: "0x...",     // BSC
  137: "0x...",    // Polygon
  8453: "0x...",   // Base
  // Add all supported EVMs
};

// Example: List of well-known tokens per chain (could be expanded or fetched)
export const TokenLists: { [chainId: number]: Array<{ address: string, symbol: string, name: string, decimals: number, image?: string }> } = {
  1: [
    { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", symbol: "DAI", name: "Dai Stablecoin", decimals: 18 },
    // ...other Ethereum tokens
  ],
  56: [
    { address: "0xe9e7cea3dedca5984780bafc599bd69add087d56", symbol: "BUSD", name: "Binance USD", decimals: 18 },
    // ...other BSC tokens
  ],
  // Add per chain
};
