"use client";

import React, { Fragment, useEffect, useState } from "react";

import { Popover, Transition } from "@headlessui/react";
import {
  AdjustmentsHorizontalIcon,
  ArrowDownIcon,
  ArrowSmallLeftIcon,
  ChevronDownIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

import Link from "next/link";
import ERC20Abi from "@/abis/ERC20.json";
import PairAbi from "@/abis/Pair.json";
import { ethers } from "ethers";
import { useStore } from "../useStore";

type Pair = {
  token0: { address: string; symbol: string; name: string };
  token1: { address: string; symbol: string; name: string };
  lp_balance: number;
  pool_share: number;
  reserve_splits: {
    token0: number;
    token1: number;
  };
};

const Pool = () => {
  const [liquidityPairs, setLiquidityPairs] = useState<Pair[]>([]);
  const [isExpanded, setIsExpanded] = useState<{ [key: number]: boolean }>({});
  const [Slippage, Network, Deadline] = useStore((state: any) => [
    state.Slippage, state.Network,  state.Deadline
  ]);
  

   const getLiquidity = async () => {
    try {
      const savedPairs = JSON.parse(localStorage.getItem("addedLPTokens")!);
      console.log(savedPairs, savedPairs[2])
      const addedPairs: Pair[] = [];
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      for (let i = 0; i < Object.keys(savedPairs).length; i++) {
        const pairContract = new ethers.Contract(
          savedPairs[i],
          PairAbi,
          signer
        );
        const token0 = await pairContract.token0();
        const token1 = await pairContract.token1();

        const token0_contract = new ethers.Contract(
          token0,
          ERC20Abi,
          signer
        );
        const token1_contract = new ethers.Contract(
          token1,
          ERC20Abi,
          signer
        );

        const token0_symbol = await token0_contract.symbol();
        const token0_name = await token0_contract.name();

        const token1_symbol = await token1_contract.symbol();
        const token1_name = await token1_contract.name();

        const supply = Number(
          ethers.formatEther(await pairContract.totalSupply())
        );
        const balance = Number(
          ethers.formatEther(await pairContract.balanceOf(signerAddress))
        );
        const reserves = await pairContract.getReserves();
        const shareOfPool = balance / supply;

        addedPairs.push({
          token0: { address: token0, symbol: token0_symbol, name: token0_name },
          token1: { address: token1, symbol: token1_symbol, name: token1_name },
          lp_balance: Math.floor(balance),
          pool_share: shareOfPool * 10 ** 2,
          reserve_splits: {
            token0: Number(ethers.formatEther(reserves[0])) * shareOfPool,
            token1: Number(ethers.formatEther(reserves[1])) * shareOfPool,
          },
        } as Pair);
      }

      setLiquidityPairs(addedPairs);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const savedPairs = JSON.parse(localStorage.getItem("addedLPTokens")!);
    if (savedPairs !== null && Network.name !== "") {
      getLiquidity();
    }
    
  }, [Network.name]);

  return (
    <div className="md:max-w-[35vw] mx-auto">
      <div className="pt-[10vh]">
        <div className="flex flex-col w-full px-6 pt-5 pb-7 bg-[#00AFE340] rounded-xl">
          <div className="flex flex-col leading-none text-white">
            <p className="font-bold pb-2 m-0">Liquidity Provision</p>{" "}
            <br /> Use this page to manage your positions and adjust them by adding or removing liquidity.
          </div>
        </div>
      </div>

      <div className="flex flex-row items-center justify-between text-white py-[3vh]">
        <span className="text-xl">Your liquidity</span>
        <span className="flex flex-row space-x-[.5vw]">
          <Link
            href={"liquidity/add_liquidity/null/null"}
            className="rounded-lg  bg-[#00DAAC90] h-[4vh] px-3 py-2 text-[#00DAAC] "
          >
            Add Liquidity
          </Link>
        </span>
      </div>

      {liquidityPairs?.map((pair: Pair, index: number) => {
        return liquidityPairs.length === 0 ? (
          <div className="flex border-[#00DAAC90] border-[1px] md:min-h-[5vh] mt-[2vh] rounded-lg">
            <span className="text-[#00DAAC] mx-auto place-self-center">
              No liquidity found.
            </span>
          </div>
        ) : isExpanded[index] === false || isExpanded[index] === undefined ? (
          <span key={index} className="flex flex-row justify-between items-center rounded-xl bg-[#00DAAC30] text-white p-[2vh] mt-[1vh]">
            <div className="flex flex-row">
              <span className="flex flex-row mr-[.5vw]">
                {/* handle state for when png exist*/}
                <QuestionMarkCircleIcon className="w-[1.5vw]" />
                <QuestionMarkCircleIcon className="w-[1.5vw]" />
              </span>
              {pair["token0"]["symbol"].toUpperCase() +
                "/" +
                pair["token1"]["symbol"].toUpperCase()}
            </div>
            <button
              onClick={() => {
                setIsExpanded((prevState) => ({
                  ...prevState,
                  [index]: true,
                }));
              }}
              className="flex flex-row space-x-[.5vw] items-center px-2 py-[.2vh]"
            >
              <p className="text-[#00DAAC] font-medium">Manage</p>
              <ChevronDownIcon color="white" width="1vw" height="1vw" />
            </button>
          </span>
        ) : (
          <span key={index} className="flex flex-col rounded-xl bg-[#00DAAC30] text-white p-[2vh] mt-[1vh]">
            <span className="flex flex-row justify-between items-center">
              <div className="flex flex-row">
                <span className="flex flex-row mr-[.5vw]">
                  {/* handle state for when png exist*/}
                  <QuestionMarkCircleIcon className="w-[1vw]" />
                  <QuestionMarkCircleIcon className="w-[1vw]" />
                </span>
                {pair["token0"]["symbol"].toUpperCase() +
                  "/" +
                  pair["token1"]["symbol"].toUpperCase()}
              </div>
              <button
                onClick={() => {
                  setIsExpanded((prevState) => ({
                    ...prevState,
                    [index]: !prevState[index],
                  }));
                }}
                className="flex flex-row space-x-[.5vw] items-center px-2 py-[.2vh]"
              >
                <p className="text-[#00DAAC] font-medium">Manage</p>
                <ChevronDownIcon color="white" width="1vw" height="1vw" />
              </button>
            </span>
            <span className="flex flex-row justify-between items-center">
              <p>Your pool tokens</p>
              <p>{pair["lp_balance"]}</p>
            </span>

            <span className="flex flex-row justify-between items-center">
              <p>Your pool share:</p>
              <p>{pair["pool_share"].toFixed(3)}%</p>
            </span>

            <span className="flex flex-row justify-between items-center">
              <p>Pooled {pair["token0"]["symbol"]}:</p>
              <p>{pair["reserve_splits"]["token0"] < .001 ? 0 : pair["reserve_splits"]["token0"] }</p>
            </span>

            <span className="flex flex-row justify-between items-center">
              <p>Pooled {pair["token1"]["symbol"]}:</p>
              <p>{pair["reserve_splits"]["token1"]  < .001 ? 0 : pair["reserve_splits"]["token1"]}</p>
            </span>
            <span className="flex flex-row mt-[1vh] justify-between">
              <Link
                     href={
                      "/liquidity/add_liquidity/" +
                      pair["token0"]["address"] +
                      "/" +
                      pair["token1"]["address"]
                    }
                className="py-[1vh] w-[49%] bg-[#00DAAC90] rounded-lg flex flex-row justify-center"
              >
                Add
              </Link>
              <Link
                href={
                  "/liquidity/remove_liquidity/" +
                  pair["token0"]["address"] +
                  "/" +
                  pair["token1"]["address"]
                }
                className="py-[1vh] w-[49%] bg-[#00DAAC90] rounded-lg flex flex-row justify-center"
              >
                Remove
              </Link>
            </span>
          </span>
        );
      })}

      <span className="text-white flex justify-center pt-4 ">
        {" "}
        Don&apos;t see a pool you joined?
        <Link
          className="text-[#00DAAC] ml-[.3rem]"
          href="/liquidity/import_liquidity"
        >
          Import it
        </Link>{" "}
      </span>
    </div>
  );
};
export default Pool;
