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
