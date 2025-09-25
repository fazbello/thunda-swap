import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

function CoinListItem({ chooseToken ,coin, addToken}: any){
    // const [tokenBalanceInfo, tokenBalanceBox] = useTokenBalance(coin?.id);

    return(
                                      <div className="bg-dark text-white"
                                      // onClick={chooseToken(coin)}
                data-name={coin.name}
                data-logouri={coin.image}
                data-symbol={coin.symbol}
                key={coin.name}
                data-decimals={coin.decimals}
                data-address={coin.id}>
                                <div onClick={() => chooseToken(coin)} className="border border-transparent px-5 pb-4 flex justify-between items-start w-full">
                                  <div className="flex items-start gap-x-3 border border-white rounded-md p-2">
                                    { coin.image !== "" ?
                                    <img
                                      className="w-8 h-8"
                                      src={coin.image}
                                    /> :
                                    <QuestionMarkCircleIcon  className="w-8 h-8"/>}
                                  
                                    <div className="flex flex-col gap-y-[.5px] items-start " >
                                      <h1 className=" text-sm">
                                        {coin.name}
                                      </h1>
                                      <span className="text-[11px] text-grey">
                                        {coin.symbol}
                                      </span>
                                    </div>
                                  
                                  </div>

                                  {coin.new === true ?
                                    <span className="underline text-[#00DAAC] font-medium place-self-center cursor-pointer" onClick={() => addToken(coin)}>Add</span> : coin.new === false ? null: null}
                                    
                                
                                </div>
                                </div>
    );
}

export default CoinListItem