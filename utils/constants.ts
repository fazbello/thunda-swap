// Example token addresses (replace with actual ones for your networks)
export const Gold = "0x123456...";   // Update with actual Gold token address
export const Silver = "0xabcdef..."; // Update with actual Silver token address

// Old single-address exports (for backwards compatibility)
export const WrapperAddress = "0x357872F740253583bAadBd7fAd7a192E0f3e22d9";
export const RouterAddress = "0xYourDefaultRouterAddress"; // fallback, use mapping below for multi-chain

// Dynamic address mappings for multi-EVM support
export const RouterAddresses: { [chainId: number]: string } = {
  1: "0x...",      // Ethereum Mainnet
  56: "0x...",     // BSC
  137: "0x...",    // Polygon
  // Add all supported EVMs
};

export const FactoryAddresses: { [chainId: number]: string } = {
  1: "0x...",
  56: "0x...",
  137: "0x...",
  // Add all supported EVMs
};

// For backwards compatibility
export const factory_address = "0xYourDefaultFactoryAddress";

// Utility function (was missing export)
export const compareHex = (a: string, b: string) => {
  const numA = parseInt(a, 16);
  const numB = parseInt(b, 16);

  if (numA < numB) return -1;
  if (numA > numB) return 1;
  return 0;
};
// ...other exports

// Example: list of tokens per chainId (fill in with real tokens for your app!)
export const TokenLists: { [chainId: number]: Array<{ address: string, symbol: string, name: string, decimals: number, image?: string }> } = {
  1: [
    { address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", symbol: "DAI", name: "Dai Stablecoin", decimals: 18 },
    { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC", name: "USD Coin", decimals: 6 },
    // ...more Ethereum tokens
  ],
  56: [
    { address: "0xe9e7cea3dedca5984780bafc599bd69add087d56", symbol: "BUSD", name: "Binance USD", decimals: 18 },
    { address: "0x55d398326f99059fF775485246999027B3197955", symbol: "USDT", name: "Tether USD", decimals: 18 },
    // ...more BSC tokens
  ],
  // Add other chains as needed
};

// ...more exports as needed
