import { RouterAddresses, FactoryAddresses } from "@/utils/constants";

async function getContracts() {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const { chainId } = await provider.getNetwork();
  const routerAddress = RouterAddresses[chainId];
  const factoryAddress = FactoryAddresses[chainId];
  const RouterContract = new ethers.Contract(routerAddress, RouterAbi, provider);
  const FactoryContract = new ethers.Contract(factoryAddress, FactoryAbi, provider);
  return { RouterContract, FactoryContract };
}
