"use client";

import CoinListButton from "@/app/components/Buttons/CoinListButton";
import CoinListItem from "@/app/components/CoinListItem";
import ERC20 from "@/abis/ERC20.json";
import RouterAbi from "@/abis/Router.json";
import FactoryAbi from "@/abis/Factory.json";
import PairAbi from "@/abis/Pair.json";
import {
  Gold,
  RouterAddress,
  Silver,
  WrapperAddress,
  factory_address,
} from "@/utils/constants";
import { Dialog, Transition } from "@headlessui/react";
import {
  ArrowSmallLeftIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ethers } from "ethers";
import Link from "next/link";
import React, { Fragment, useEffect, useState } from "react";

interface Coin {
  name: string;
  symbol: string;
  address: string;
  image: string;
}

export default function ImportLiquidity() {
  const [isSelected, setSelected] = useState(false);
  const [token0, setToken0] = useState({
    name: "Sparq",
    symbol: "SPRQ",
    address: "",
    image: "/logo.svg",
  } as Coin);
  const [token1, setToken1] = useState({
    name: "",
    symbol: "",
    address: "",
    image: "",
  } as Coin);
  const [LPBalance, setLPBalance] = useState(0);
  const [coinsForListing, setCoinsForListing] = useState([
    { name: "Gold", symbol: "GLD", address: Gold, image: "/gold.png" } as Coin,
    {
      name: "Silver",
      symbol: "SLV",
      address: Silver,
      image: "/silver.png",
    } as Coin,
    {
      name: "Sparq",
      symbol: "SPRQ",
      address: "",
      image: "/logo.svg",
    } as Coin,
    {
      name: "Wrapped Sparq",
      symbol: "WSPRQ",
      address: WrapperAddress,
      image: "/logo.svg",
    } as Coin,
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isOpen, setIsOpen] = useState({ show: false, tokenNum: -1 });
  const [poolShare, setPoolShare] = useState<undefined | number>(undefined);
  const [reserves, setReserveSplits] = useState<
    undefined | { token0: number; token1: number }
  >(undefined);

  const chooseTokenFunction = async (coin: Coin) => {
    if (token0.address === coin.address || token1.address === coin.address) {
      return;
    }

    if (isOpen.tokenNum === 0) {
      setToken0(coin);
      setIsOpen({ show: false, tokenNum: 0 });
    }

    if (isOpen.tokenNum === 1) {
      setToken1(coin);
      setSelected(true);
      setIsOpen({ show: false, tokenNum: 1 });
    }
  };
  const getBalanceNative = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      const contract = new ethers.Contract(factory_address, FactoryAbi, signer);
      const wrapperSlot =
        token0.address === "" ? WrapperAddress : token0.address;
      const tokenSlot = token1.address === "" ? WrapperAddress : token1.address;

      const pair = await contract.getPair(wrapperSlot, tokenSlot);
      console.log(pair);
      const tokenContract = new ethers.Contract(pair, PairAbi, signer);

      const supply = Number(
        ethers.formatEther(await tokenContract.totalSupply())
      );
      const balance = Number(
        ethers.formatEther(await tokenContract.balanceOf(signerAddress))
      );

      const reserves = await tokenContract.getReserves();
      const shareOfPool = balance / supply;
      setLPBalance(Math.floor(balance));
      setPoolShare(shareOfPool * 10 ** 2);
      setReserveSplits({
        token0: Number(ethers.formatEther(reserves[0])) * shareOfPool,
        token1: Number(ethers.formatEther(reserves[1])) * shareOfPool,
      });

      if (localStorage.getItem("addedLPTokens") !== null) {
        const prevEntry = localStorage.getItem("addedLPTokens");
        const prevObject = JSON.parse(prevEntry!);
        for (let i = 0; i < Object.keys(prevObject).length; i++) {
          if (prevObject[i] === pair) {
            return;
          }
        }
        const nextIndex = Object.keys(prevObject).length;
        prevObject[nextIndex] = pair;
        const updated = JSON.stringify(prevObject);
        localStorage.setItem("addedLPTokens", updated);
      }

      if (localStorage.getItem("addedLPTokens") === null) {
        const addedLPTokens = JSON.stringify({ 0: pair });
        localStorage.setItem("addedLPTokens", addedLPTokens);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getBalance = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      const contract = new ethers.Contract(factory_address, FactoryAbi, signer);
      const pair = await contract.getPair(token0.address, token1.address);
      const tokenContract = new ethers.Contract(pair, PairAbi, signer);

      const supply = Number(
        ethers.formatEther(await tokenContract.totalSupply())
      );
      const balance = Number(
        ethers.formatEther(await tokenContract.balanceOf(signerAddress))
      );

      const reserves = await tokenContract.getReserves();
      const shareOfPool = balance / supply;
      setLPBalance(Math.floor(balance));
      setPoolShare(shareOfPool * 10 ** 2);
      setReserveSplits({
        token0: Number(ethers.formatEther(reserves[0])) * shareOfPool,
        token1: Number(ethers.formatEther(reserves[1])) * shareOfPool,
      });

      if (localStorage.getItem("addedLPTokens") !== null) {
        const prevEntry = localStorage.getItem("addedLPTokens");
        const prevObject = JSON.parse(prevEntry!);
        for (let i = 0; i < Object.keys(prevObject).length; i++) {
          if (prevObject[i] === pair) {
            return;
          }
        }
        const nextIndex = Object.keys(prevObject).length;
        prevObject[nextIndex] = pair;
        const updated = JSON.stringify(prevObject);
        localStorage.setItem("addedLPTokens", updated);
      }

      if (localStorage.getItem("addedLPTokens") === null) {
        const addedLPTokens = JSON.stringify({ 0: pair });
        localStorage.setItem("addedLPTokens", addedLPTokens);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isSelected) {
      if (token0.address === "" || token1.address === "") {
        getBalanceNative();
        return;
      }
      getBalance();
    }
  }, [token0.address, token1.address]);

  return (
    <>
      <Transition appear show={isOpen.show === true} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => {}}>
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-black border border-grey2 text-left align-middle shadow-xl transition-all">
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-6">
                      <h1 className="text-white">Select Token</h1>
                      <XMarkIcon
                        onClick={() => setIsOpen({ show: false, tokenNum: -1 })}
                        className="w-6 text-white cursor-pointer"
                      />
                    </div>
                    <MagnifyingGlassIcon className="w-5 text-white absolute mt-[13px] ml-[14px] text-grey" />
                    <input
                      className="cursor-pointer border border-grey2 outline-none py-2.5 pl-12 rounded-lg w-full placeholder:text-grey placeholder:font-regular text-white"
                      placeholder="Search address"
                      value={inputVal}
                      onChange={(e) => setInputVal(e.target.value)}
                    ></input>
                    <div className="cursor-pointer flex justify-between flex-wrap mt-4 gap-y-2 pb-6 border-b">
                      {coinsForListing?.map((coin: Coin, index: number) => {
                        return (
                          <CoinListButton
                            coin={coin}
                            chooseToken={chooseTokenFunction}
                            key={index}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="cursor-pointer mb-4 h-[25vh] overflow-y-scroll">
                    {coinsForListing?.map((coin: Coin, index: number) => {
                      return (
                        <CoinListItem
                          coin={coin}
                          chooseToken={chooseTokenFunction}
                          key={index}
                        />
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

      <div className="flex flex-col md:max-w-[25vw] mx-auto bg-[#00AFE340] rounded-3xl mt-[3vh]">
        <div className="flex flex-row items-center justify-between p-[5%]">
          <Link href={"/liquidity"}>
            <ArrowSmallLeftIcon color="white" width="1vw" height="1vw" />
          </Link>
          <span className="text-white font-medium text-xl">Import</span>
          <QuestionMarkCircleIcon color="white" width="1vw" height="1vw" />
        </div>

        <button
          className="flex flex-row justify-between items-center border-[1px] border-[#86C7DB25] rounded-xl mx-[3%] px-[3%] py-[4%] text-white "
          onClick={() => setIsOpen({ show: true, tokenNum: 0 })}
        >
          <span className="flex flex-row space-x-[.5vw]">
            <img className="w-[1vw]" src={token0.image} />
            <p className="text-2xl font-medium">{token0.name.toUpperCase()}</p>
          </span>
          <ChevronDownIcon color="white" width="1vw" height="1vw" />
        </button>

        <span className="mx-auto text-white text-2xl my-[2vh]">+</span>

        {isSelected === true ? (
          <button
            className="flex flex-row justify-between items-center border-[1px] border-[#86C7DB25] rounded-xl mx-[3%] px-[3%] py-[4%] text-white "
            onClick={() => setIsOpen({ show: true, tokenNum: 1 })}
          >
            <span className="flex flex-row space-x-[.5vw]">
              <img className="w-[1vw]" src={token1.image} />
              <p className="text-2xl font-medium">
                {token1.name.toUpperCase()}
              </p>
            </span>
            <ChevronDownIcon color="white" width="1vw" height="1vw" />
          </button>
        ) : (
          <button
            className="flex flex-row justify-between items-center border-[1px] border-[#86C7DB25] rounded-xl mx-[3%] px-[3%] py-[4%] text-white "
            onClick={() => setIsOpen({ show: true, tokenNum: 1 })}
          >
            <span className="flex flex-row space-x-[.5vw]">
              <p className="text-2xl font-medium">Select a Token</p>
            </span>
            <ChevronDownIcon color="white" width="1vw" height="1vw" />
          </button>
        )}
        {isSelected && poolShare != undefined ? (
          <>
            <span className="flex flex-col mx-auto items-center text-white py-[3%]">
              <p>Pool Found!</p>
              <Link className="text-[#00DAAC]" href="/liquidity">
                Manage this pool
              </Link>
            </span>

            <span className="flex flex-col text-white mx-[3%] p-[3%] rounded-xl bg-[#888D9B] mb-[2vh] shadow shadow-lg">
              <span className="flex flex-row justify-between items-center">
                <div className="flex flex-row">
                  <span className="flex flex-row mr-[.5vw]">
                    <img className="w-[1vw]" src={token0.image} />
                    <img className="w-[1vw]" src={token1.image} />
                  </span>
                  {token0.symbol.toUpperCase() +
                    "/" +
                    token1.symbol.toUpperCase()}
                </div>
                <p>{LPBalance}</p>
              </span>

              <span className="flex flex-row justify-between items-center">
                <p>Your pool share:</p>
                <p>{poolShare}%</p>
              </span>

              <span className="flex flex-row justify-between items-center">
                <p>{token0.symbol}:</p>
                <p>{reserves?.token0}</p>
              </span>

              <span className="flex flex-row justify-between items-center">
                <p>{token1.symbol}:</p>
                <p>{reserves?.token1}</p>
              </span>
            </span>
          </>
        ) : (
          <div className="flex border-[#00DAAC90] border-[1px] md:min-h-[5vh] mt-[2vh] rounded-lg mx-[3%] mb-[2vh]">
            <span className="text-[#00DAAC] mx-auto place-self-center">
              No liquidity found.
            </span>
          </div>
        )}

        {!isSelected ? (
          <span className="flex flex-row justify-center mx-[3%] rounded-xl bg-[#888D9B] py-[2vh] mb-[2vh] font-medium text-[#3E4148]">
            Select a token to find your liquidity
          </span>
        ) : null}
      </div>
    </>
  );
}
