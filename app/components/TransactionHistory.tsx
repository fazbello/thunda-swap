"use client";

import React, { useState, useEffect } from 'react';
import { getUserSwaps } from '@/utils/api';
import { Swap } from '@/utils/db';

interface TransactionHistoryProps {
  userAddress?: string;
  className?: string;
}

export default function TransactionHistory({ userAddress, className = "" }: TransactionHistoryProps) {
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const loadSwaps = async (reset = false) => {
    if (!userAddress) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const currentOffset = reset ? 0 : offset;
      const result = await getUserSwaps(userAddress, limit, currentOffset);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      if (result.data) {
        if (reset) {
          setSwaps(result.data.swaps);
        } else {
          setSwaps(prev => [...prev, ...result.data!.swaps]);
        }
        setHasMore(result.data.pagination.hasMore);
        setOffset(currentOffset + limit);
      }
    } catch (err) {
      setError('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userAddress) {
      loadSwaps(true);
    }
  }, [userAddress]);

  const formatAddress = (address: string) => {
    if (address === "NATIVE") return "NATIVE";
    if (address.length <= 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: string) => {
    try {
      const num = parseFloat(amount);
      if (num < 0.0001) return num.toExponential(2);
      return num.toFixed(4);
    } catch {
      return amount;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const openTxInExplorer = (txHash: string) => {
    // You may want to customize this based on your network
    // For now, assuming it's a generic explorer link
    window.open(`https://explorer.example.com/tx/${txHash}`, '_blank');
  };

  if (!userAddress) {
    return (
      <div className={`p-4 text-center text-gray-400 ${className}`}>
        Connect your wallet to view transaction history
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-xl font-semibold text-white mb-4">Transaction History</h2>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg">
          {error}
        </div>
      )}
      
      {swaps.length === 0 && !loading && !error && (
        <div className="text-center text-gray-400 py-8">
          No transactions found
        </div>
      )}
      
      <div className="space-y-2">
        {swaps.map((swap) => (
          <div
            key={swap.id}
            className="bg-[#00DAAC20] border border-[#00DAAC30] rounded-lg p-4 hover:bg-[#00DAAC30] transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-gray-300">
                    {formatAddress(swap.from_token)} → {formatAddress(swap.to_token)}
                  </span>
                  <span className="text-[#00DAAC]">
                    {formatAmount(swap.amount)}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {formatDate(swap.created_at!.toString())}
                </div>
              </div>
              <button
                onClick={() => openTxInExplorer(swap.tx_hash)}
                className="text-[#00DAAC] hover:text-[#00DAAC]/80 text-xs underline"
              >
                View Tx
              </button>
            </div>
            
            <div className="text-xs text-gray-500">
              <div>Chain: {swap.from_chain}</div>
              <div>Hash: {formatAddress(swap.tx_hash)}</div>
            </div>
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => loadSwaps(false)}
            disabled={loading}
            className="bg-[#00DAAC30] hover:bg-[#00DAAC40] text-[#00DAAC] px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
      
      {loading && swaps.length === 0 && (
        <div className="text-center text-gray-400 py-4">
          Loading transactions...
        </div>
      )}
    </div>
  );
}