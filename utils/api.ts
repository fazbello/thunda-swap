import { Swap } from './db';

// API client functions for interacting with the backend

export interface SwapData {
  user_address: string;
  from_chain: string;
  to_chain: string;
  from_token: string;
  to_token: string;
  amount: string;
  tx_hash: string;
  timestamp?: Date;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// Log a swap to the backend
export const logSwap = async (swapData: SwapData): Promise<ApiResponse<Swap>> => {
  try {
    const response = await fetch('/api/swaps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(swapData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || 'Failed to log swap',
        status: response.status,
      };
    }

    return {
      data: data.swap,
      status: response.status,
    };
  } catch (error) {
    console.error('Error logging swap:', error);
    return {
      error: 'Network error while logging swap',
      status: 500,
    };
  }
};

// Get swaps for a specific user
export const getUserSwaps = async (
  address: string,
  limit: number = 50,
  offset: number = 0
): Promise<ApiResponse<{ swaps: Swap[]; pagination: any }>> => {
  try {
    const response = await fetch(
      `/api/swaps/${address}?limit=${limit}&offset=${offset}`
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || 'Failed to fetch user swaps',
        status: response.status,
      };
    }

    return {
      data: data,
      status: response.status,
    };
  } catch (error) {
    console.error('Error fetching user swaps:', error);
    return {
      error: 'Network error while fetching user swaps',
      status: 500,
    };
  }
};

// Get all swaps (admin endpoint)
export const getAllSwaps = async (
  params: {
    limit?: number;
    offset?: number;
    from_chain?: string;
    to_chain?: string;
    user_address?: string;
    from_date?: string;
    to_date?: string;
  } = {}
): Promise<ApiResponse<{ swaps: Swap[]; pagination: any; stats: any; topChains: any[] }>> => {
  try {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const response = await fetch(`/api/swaps/all?${searchParams.toString()}`);
    const data = await response.json();

    if (!response.ok) {
      return {
        error: data.error || 'Failed to fetch all swaps',
        status: response.status,
      };
    }

    return {
      data: data,
      status: response.status,
    };
  } catch (error) {
    console.error('Error fetching all swaps:', error);
    return {
      error: 'Network error while fetching all swaps',
      status: 500,
    };
  }
};

// Helper function to determine the current chain (you may need to adjust this based on your setup)
export const getCurrentChain = (): string => {
  // This should be determined based on the connected wallet's network
  // For now, returning a default value, but this should be dynamic
  return 'Orbiter'; // or whatever the default chain is in your app
};

// Helper function to format token address for logging
export const formatTokenForLogging = (token: { address: string; symbol: string }): string => {
  // If address is "undefined", it means it's the native token
  if (token.address === "undefined") {
    return "NATIVE";
  }
  return token.address;
};