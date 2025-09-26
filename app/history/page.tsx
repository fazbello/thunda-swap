"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowSmallLeftIcon } from '@heroicons/react/24/outline';
import TransactionHistory from '@/app/components/TransactionHistory';
import { ethers } from 'ethers';

export default function HistoryPage() {
  const [userAddress, setUserAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  // Get wallet connection
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setUserAddress(accounts[0].address);
            setIsConnected(true);
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkWalletConnection();
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        setUserAddress(signer.address);
        setIsConnected(true);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    }
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
            <h1 className="text-3xl font-bold">Transaction History</h1>
          </div>
          
          {!isConnected && (
            <button
              onClick={connectWallet}
              className="bg-[#00DAAC] hover:bg-[#00DAAC]/80 text-black px-4 py-2 rounded-lg font-medium"
            >
              Connect Wallet
            </button>
          )}
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {isConnected && userAddress ? (
            <div>
              <div className="bg-[#00DAAC20] border border-[#00DAAC30] rounded-lg p-4 mb-6">
                <div className="text-sm text-gray-400">Connected Wallet:</div>
                <div className="text-[#00DAAC] font-mono">{userAddress}</div>
              </div>
              
              <TransactionHistory 
                userAddress={userAddress} 
                className="bg-[#00DAAC20] border border-[#00DAAC30] rounded-lg p-6"
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-[#00DAAC20] border border-[#00DAAC30] rounded-lg p-8">
                <h2 className="text-xl font-semibold text-[#00DAAC] mb-4">
                  Wallet Connection Required
                </h2>
                <p className="text-gray-400 mb-6">
                  Please connect your wallet to view your transaction history.
                </p>
                <button
                  onClick={connectWallet}
                  className="bg-[#00DAAC] hover:bg-[#00DAAC]/80 text-black px-6 py-3 rounded-lg font-medium"
                >
                  Connect Wallet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}