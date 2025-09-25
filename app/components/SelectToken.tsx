import { Fragment, useState, useEffect } from "react";
import {
  ChevronDownIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/20/solid";
import { Transition, Dialog } from "@headlessui/react";
// import { tokenZeroAddress, tokenOneAddress, rangeTokenZero, rangeTokenOne } from "../constants/contractAddresses";
import CoinListButton from "./Buttons/CoinListButton";
import CoinListItem from "./CoinListItem";



export default function SelectToken(props:any) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState("");
  // const coins = useTokenList()[0];
  const coins = []

  //@dev this is temporary for testnet
  // const [coinsForListing, setCoinsForListing] = useState(coins["listed_tokens"]);
  const [coinsForListing, setCoinsForListing] = useState([{
    name: "Wrapped Ether",
    address: "",
    symbol: "WSPARQ",
    logoURI: "./wrapped-avax.png",
    decimals: 18
},
{
  name: "USDC",
  address: "",
  symbol: "USDC",
  logoURI:  "/static/images/token.png",
  decimals: 18
}

])

//@dev this is temporary for testnet
  // const findCoin = () => {
  //   if (inputVal.length === 0) {
  //     setCoinsForListing(coins["listed_tokens"]);
  //   } else {
  //     if (inputVal.length === 42 && inputVal.substring(0, 2) === "0x") {
  //       let searchedCoin = coins["search_tokens"].find(
  //         (token) => token.id === inputVal
  //       );
  //       if (searchedCoin != undefined) {
  //         setCoinsForListing(searchedCoin);
  //       }
  //     } else {
  //       let searchedCoins = coins["search_tokens"].filter(
  //         (coin) =>
  //           coin.name.toUpperCase().includes(inputVal.toUpperCase()) ||
  //           coin.symbol.toUpperCase().includes(inputVal.toUpperCase())
  //       );
  //       if (searchedCoins.length > 20) {
  //         searchedCoins = searchedCoins.slice(0, 20);
  //       }
  //       setCoinsForListing(searchedCoins);
  //     }
  //   }
  // };
  const chooseToken = (coin:any) => {
    props.tokenChosen({
      name: coin?.name,
      address: coin?.address,    //@dev use id for address in production like so address: coin?.id because thats what coin [] will have instead of address
      symbol: coin?.symbol,
      logoURI: coin?.logoURI,
      decimals: coin?.decimals,
    })
    props.balance(coin?.id)
    closeModal();
  };

  useEffect(() => {
    //@dev this is temporary for testnet
    // findCoin();
  }, [inputVal, isOpen]);

  //   useEffect(() => {
  // }, [coinsForListing]);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white border border-grey-200 text-left align-middle shadow-xl transition-all">
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-6">
                      <h1 className="text-white">Select Token</h1>
                      <XMarkIcon
                        onClick={() => setIsOpen(false)}
                        className="w-6 text-white cursor-pointer"
                      />
                    </div>
                    <MagnifyingGlassIcon className="w-5 text-white absolute mt-[13px] ml-[14px] text-grey" />
                    <input
                      className="border border-grey2 bg-dark outline-none py-2.5 pl-12 rounded-lg w-full placeholder:text-grey placeholder:font-regular text-white"
                      placeholder="Search name or paste address"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                    ></input>
                    <div className="flex justify-between flex-wrap mt-4 gap-y-2">
                      {coinsForListing?.map((coin, index:number) => {
                        return <CoinListButton coin={coin} key={index} chooseToken={chooseToken} />;
                      })}
                    </div>
                  </div>
                  <div>
                    {coinsForListing?.map((coin, index:number) => {
                      return (
                        <CoinListItem coin={coin} key={index} chooseToken={chooseToken} />
                      );
                    })}
                    {/* {(coinsForListing === null || coinsForListing.length === 0) &&
                                <div>No coin</div>
                                } */}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      <button
        onClick={() => openModal()}
        className={props.index === "0" || props.index === "1" && props.selected === true  ? "flex items-center uppercase gap-x-3 bg-[#00DAAC30]  border border-black px-2 py-1.5 rounded-xl":
       "flex items-center bg-[#00DAAC30] text-main gap-x-3 hover:opacity-80  px-4 py-2 rounded-xl" }
      >
        <div className="flex items-center gap-x-2 w-full">
          { props.index === "0" || props.index === "1" && props.selected === true  ? <img className="w-7" src={props.displayToken?.logoURI} /> : <></>}
          {props.displayToken?.symbol}
        </div>
        <ChevronDownIcon className="w-5" />
      </button>
    </div>
  );
}
