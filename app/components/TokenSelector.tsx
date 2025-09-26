import { useState } from "react";
import { ethers } from "ethers";
import ERC20Abi from "../../abis/ERC20.json"; // adjust path as needed

export function TokenSelector({ chainId, onSelectToken }) {
  const [search, setSearch] = useState("");
  const [customToken, setCustomToken] = useState<any>(null);
  const tokenList = TokenLists[chainId] || [];

  async function handleCustomAddress(address: string) {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const token = new ethers.Contract(address, ERC20Abi, provider);
      const symbol = await token.symbol();
      const name = await token.name();
      const decimals = await token.decimals();
      setCustomToken({ address, symbol, name, decimals });
    } catch {
      setCustomToken(null);
    }
  }

  return (
    <div>
      <input
        placeholder="Search or paste address"
        value={search}
        onChange={e => {
          setSearch(e.target.value);
          if (/^0x[a-fA-F0-9]{40}$/.test(e.target.value)) {
            handleCustomAddress(e.target.value);
          }
        }}
      />
      <div>
        {customToken && (
          <button onClick={() => onSelectToken(customToken)}>
            {customToken.symbol} ({customToken.name})
          </button>
        )}
        {tokenList
          .filter(token => token.symbol.toLowerCase().includes(search.toLowerCase()) || token.name.toLowerCase().includes(search.toLowerCase()))
          .map(token => (
            <button key={token.address} onClick={() => onSelectToken(token)}>
              {token.symbol} ({token.name})
            </button>
          ))}
      </div>
    </div>
  );
}
