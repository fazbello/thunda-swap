import QuestionMarkCircleIcon from "@heroicons/react/24/outline/QuestionMarkCircleIcon";
import React from "react";

function CoinListButton({ chooseToken, coin }: any) {
  return (
    <button
      onClick={() => chooseToken(coin)}
      data-name={coin.name}
      data-image={coin.image}
      data-symbol={coin.symbol}
      data-address={coin.address}
      key={coin.id}
      className="flex items-center gap-x-2 text-white border-grey1 border p-1.5 px-3 rounded-xl text-sm"
    >
      {coin.image !== "" ? (
        <img className="w-8 h-8" src={coin.image} />
      ) : (
        <QuestionMarkCircleIcon className="w-8 h-8" />
      )}
      {coin.symbol}
    </button>
  );
}

export default CoinListButton;
