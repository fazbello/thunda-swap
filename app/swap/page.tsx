import { useState, useEffect } from "react";
import { RouterAddresses, FactoryAddresses } from "@/utils/constants";
import { TokenSelector } from "../components/TokenSelector";
import { ethers } from "ethers";
import RouterAbi from "../../abis/Router.json";
import FactoryAbi from "../../abis/Factory.json";

// Helper function to get current contracts based on chainId
async function getContracts() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const { chainId } = await provider.getNetwork();
  const routerAddress = RouterAddresses[chainId];
  const factoryAddress = FactoryAddresses[chainId];
  const RouterContract = new ethers.Contract(routerAddress, RouterAbi, provider);
  const FactoryContract = new ethers.Contract(factoryAddress, FactoryAbi, provider);
  return { RouterContract, FactoryContract };
}

export default function SwapPage() {
  const [chainId, setChainId] = useState<number>();
  const [token0, setToken0] = useState<any>();
  const [token1, setToken1] = useState<any>();

  useEffect(() => {
    async function fetchChainId() {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const { chainId } = await provider.getNetwork();
      setChainId(chainId);
    }
    fetchChainId();
    window.ethereum?.on("chainChanged", fetchChainId);
    return () => window.ethereum?.removeListener("chainChanged", fetchChainId);
  }, []);

  return (
    <div>
      <TokenSelector chainId={chainId} onSelectToken={setToken0} />
      <TokenSelector chainId={chainId} onSelectToken={setToken1} />
      {/* ...rest of swap form */}
    </div>
  );
}
