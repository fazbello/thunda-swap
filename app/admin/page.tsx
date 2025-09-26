"use client";

import React, { useState, useEffect } from 'react';
import { getAllSwaps } from '@/utils/api';
import { Swap } from '@/utils/db';
import Link from 'next/link';
import { ArrowSmallLeftIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface AdminStats {
  total_swaps: number;
  unique_users: number;
  unique_from_chains: number;
  unique_to_chains: number;
  first_swap_date: string;
  latest_swap_date: string;
}

interface TopChain {
  chain: string;
  swap_count: number;
}

export default function AdminPage() {
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [topChains, setTopChains] = useState<TopChain[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [filters, setFilters] = useState({
    from_chain: '',
    to_chain: '',
    user_address: '',
    from_date: '',
    to_date: '',
  });
  
  const limit = 50;

  const loadSwaps = async (reset = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const currentOffset = reset ? 0 : offset;
      const params = {
        limit,
        offset: currentOffset,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value.trim() !== '')
        ),
      };
      
      const result = await getAllSwaps(params);
      
      if (result.error) {
        setError(result.error);
        return;
      }
      
      if (result.data) {
        if (reset) {
          setSwaps(result.data.swaps);
          setStats(result.data.stats);
          setTopChains(result.data.topChains);
        } else {
          setSwaps(prev => [...prev, ...result.data!.swaps]);
        }
        setHasMore(result.data.pagination.hasMore);
        setOffset(currentOffset + limit);
      }
    } catch (err) {
      setError('Failed to load swaps data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSwaps(true);
  }, []);

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setOffset(0);
    loadSwaps(true);
  };

  const clearFilters = () => {
    setFilters({
      from_chain: '',
      to_chain: '',
      user_address: '',
      from_date: '',
      to_date: '',
    });
    setOffset(0);
    loadSwaps(true);
  };

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
    window.open(`https://explorer.example.com/tx/${txHash}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white relative z-10">
      <div className="container mx-auto px-4 py-8 relative z-20">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-[#00DAAC] hover:text-[#00DAAC]/80">
              <ArrowSmallLeftIcon className="w-6 h-6" />
            </Link>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#00DAAC20] border border-[#00DAAC30] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#00DAAC] mb-2">Total Swaps</h3>
              <p className="text-2xl font-bold">{stats.total_swaps}</p>
            </div>
            <div className="bg-[#00DAAC20] border border-[#00DAAC30] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#00DAAC] mb-2">Unique Users</h3>
              <p className="text-2xl font-bold">{stats.unique_users}</p>
            </div>
            <div className="bg-[#00DAAC20] border border-[#00DAAC30] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-[#00DAAC] mb-2">Active Chains</h3>
              <p className="text-2xl font-bold">{stats.unique_from_chains}</p>
            </div>
          </div>
        )}

        {/* Top Chains */}
        {topChains.length > 0 && (
          <div className="bg-[#00DAAC20] border border-[#00DAAC30] rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-[#00DAAC] mb-4">Top Chains by Volume</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {topChains.slice(0, 5).map((chain) => (
                <div key={chain.chain} className="text-center">
                  <div className="text-sm font-medium">{chain.chain}</div>
                  <div className="text-lg font-bold text-[#00DAAC]">{chain.swap_count}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-[#00DAAC20] border border-[#00DAAC30] rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-[#00DAAC] mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              placeholder="From Chain"
              value={filters.from_chain}
              onChange={(e) => handleFilterChange('from_chain', e.target.value)}
              className="bg-black/50 border border-[#00DAAC30] rounded-lg px-3 py-2 text-white placeholder-gray-400"
            />
            <input
              type="text"
              placeholder="To Chain"
              value={filters.to_chain}
              onChange={(e) => handleFilterChange('to_chain', e.target.value)}
              className="bg-black/50 border border-[#00DAAC30] rounded-lg px-3 py-2 text-white placeholder-gray-400"
            />
            <input
              type="text"
              placeholder="User Address"
              value={filters.user_address}
              onChange={(e) => handleFilterChange('user_address', e.target.value)}
              className="bg-black/50 border border-[#00DAAC30] rounded-lg px-3 py-2 text-white placeholder-gray-400"
            />
            <input
              type="date"
              placeholder="From Date"
              value={filters.from_date}
              onChange={(e) => handleFilterChange('from_date', e.target.value)}
              className="bg-black/50 border border-[#00DAAC30] rounded-lg px-3 py-2 text-white"
            />
            <input
              type="date"
              placeholder="To Date"
              value={filters.to_date}
              onChange={(e) => handleFilterChange('to_date', e.target.value)}
              className="bg-black/50 border border-[#00DAAC30] rounded-lg px-3 py-2 text-white"
            />
          </div>
          <div className="flex space-x-4">
            <button
              onClick={applyFilters}
              className="bg-[#00DAAC] hover:bg-[#00DAAC]/80 text-black px-4 py-2 rounded-lg font-medium"
            >
              Apply Filters
            </button>
            <button
              onClick={clearFilters}
              className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-8">
            {error}
          </div>
        )}

        {/* Swaps Table */}
        <div className="bg-[#00DAAC20] border border-[#00DAAC30] rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-[#00DAAC30]">
            <h3 className="text-lg font-semibold text-[#00DAAC]">All Swaps</h3>
          </div>
          
          {swaps.length === 0 && !loading && !error && (
            <div className="text-center text-gray-400 py-12">
              No swaps found
            </div>
          )}

          {swaps.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#00DAAC10]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#00DAAC] uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#00DAAC] uppercase tracking-wider">
                      From → To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#00DAAC] uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#00DAAC] uppercase tracking-wider">
                      Chain
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#00DAAC] uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#00DAAC] uppercase tracking-wider">
                      Tx Hash
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#00DAAC30]">
                  {swaps.map((swap) => (
                    <tr key={swap.id} className="hover:bg-[#00DAAC10]">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatAddress(swap.user_address)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatAddress(swap.from_token)} → {formatAddress(swap.to_token)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-[#00DAAC] font-medium">
                        {formatAmount(swap.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {swap.from_chain}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(swap.created_at!.toString())}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => openTxInExplorer(swap.tx_hash)}
                          className="text-[#00DAAC] hover:text-[#00DAAC]/80 underline"
                        >
                          {formatAddress(swap.tx_hash)}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Load More Button */}
          {hasMore && (
            <div className="text-center py-6 border-t border-[#00DAAC30]">
              <button
                onClick={() => loadSwaps(false)}
                disabled={loading}
                className="bg-[#00DAAC30] hover:bg-[#00DAAC40] text-[#00DAAC] px-6 py-2 rounded-lg disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}

          {loading && swaps.length === 0 && (
            <div className="text-center text-gray-400 py-12">
              Loading swaps...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}