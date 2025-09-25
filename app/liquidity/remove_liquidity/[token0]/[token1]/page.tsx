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
  factory_address,
} from "@/utils/constants";
import { Dialog, Transition } from "@headlessui/react";
import {
  ArrowDownIcon,
  ArrowSmallLeftIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { BigNumberish, ethers } from "ethers";
import Link from "next/link";
import React, { Fragment, use, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/app/useStore";
import { ConfirmingToast } from "@/app/components/Toasts/Confirming";

interface Coin {
  name: string;
  symbol: string;
  address: string;
  image?: string;
}

function RemoveLiquidity() {
  const [isSelected, setSelected] = useState(false);
  const [token0, setToken0] = useState({
    name: "Sparq",
    symbol: "SPRQ",
    address: "",
    image: "/logo.svg",
  } as Coin);
  const [token1, setToken1] = useState({
    name: "Sparq",
    symbol: "SPRQ",
    address: "",
    image: "/logo.svg",
  } as Coin);
  const [Slippage, Network, Deadline] = useStore((state: any) => [
    state.Slippage,
    state.Network,
    state.Deadline,
  ]);

  const [token0Input, setToken0Input] = useState(0);
  const [display, setDisplay] = useState("simple");
  const [removePercent, setRemovePercentage] = useState(50);
  const [expectedOut, setExpectedOut] = useState(0);
  const [toastTxnHash, setToastTxnHash] = useState("");
  const [showToast, setShowToast] = useState("");
  const [percentOfPool, setPercentOfPool] = useState(0);
  const [reserve0, setReserve0] = useState(0);
  const [reserve1, setReserve1] = useState(0);
  const [token0Balance, setToken0Balance] = useState(0);
  const [token1Balance, setToken1Balance] = useState(0);
  const [token1Input, setToken1Input] = useState(0);
  const [needsApproval, setNeedsApproval] = useState(0);
  const [lpHoldings, setLPHoldings] = useState(0);

  const checkApproval = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      const factoryContract = new ethers.Contract(
        factory_address,
        FactoryAbi,
        signer
      );

      const pairAddress = await factoryContract.getPair(
        token0.address,
        token1.address
      );
      const pairContract = new ethers.Contract(
        pairAddress,
        PairAbi,
        signer
      );

      const pairTokenAllowance = await pairContract.allowance(
        signerAddress,
        RouterAddress
      );

      console.log(
        Number(ethers.formatEther(pairTokenAllowance)) >=
        (removePercent / 100) * lpHoldings
      )


      if (
        Number(ethers.formatEther(pairTokenAllowance)) <
        (removePercent / 100) * lpHoldings
      ) {
        setNeedsApproval(1);
      }
   

      if (
        Number(ethers.formatEther(pairTokenAllowance)) >=
        (removePercent / 100) * lpHoldings
      ) {
        setNeedsApproval(0);
      }
   
    } catch (error) {
      console.log(error);
    }
  };

  const removeLiquidity = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      const RouterContract = new ethers.Contract(
        RouterAddress,
        RouterAbi,
        signer
      );

      const deadline = Number(Date.now() + Deadline * 60 * 1000);
      const removalAmount0 = (token0Balance * (removePercent / 100)) 
      const removalAmount1 = (token1Balance * (removePercent / 100))
      const Slippage0 =  (removalAmount0 * (Slippage /100))
      const Slippage1 = (removalAmount1 * (Slippage /100))

      const finalRemoval0 = removalAmount0 - Slippage0
      const finalRemoval1 = removalAmount1 - Slippage1
      
      const liquidity = (removePercent /100) * lpHoldings

      

      const txn = await RouterContract.removeLiquidity(
        token0.address,
        token1.address,
        ethers.parseUnits(String(liquidity), 'ether'),
        ethers.parseUnits(String(finalRemoval0), 'ether'),
        ethers.parseUnits(String(finalRemoval1), 'ether'),
        signerAddress,
        deadline
      ).catch((error) => console.log(error));
      setToastTxnHash(await txn.hash)
      setShowToast('confirm')
      await provider.waitForTransaction(await txn.hash).then(async() =>
      await getBalance(token0.address, token1.address), (err) => console.log(err))


      // wasAdded is a boolean. Like any RPC method, an error may be thrown.
      // async() => {const wasAdded = await ethereum.request({
      //   method: 'wallet_watchAsset',
      //   params: {
      //     type: 'ERC20', // Initially only supports ERC20, but eventually more!
      //     options: {
      //       address: LP_Token.address, // The address that the token is at.
      //       symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
      //       decimals: tokenDecimals, // The number of decimals in the token
      //       image: tokenImage, // A string url of the token logo
      //     },
      //   },
      // });

      // if (wasAdded) {
      //   console.log('Thanks for your interest!');
      // } else {
      //   console.log('Your loss!');
      // }

      // }
    } catch (error) {
      console.log(error);
    }
  };

  const approveTokens = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const factoryContract = new ethers.Contract(
        factory_address,
        FactoryAbi,
        signer
      );

      const pairAddress = await factoryContract.getPair(
        token0.address,
        token1.address
      );
      const pairContract = new ethers.Contract(
        pairAddress,
        PairAbi,
        signer
      );

      const removalAmount1 = (removePercent / 100) * lpHoldings;

      let formattedNumber1 = removalAmount1.toString().replace(".", "");

      const integerLength1 = Math.floor(removalAmount1).toString().length;
      const decimalLength1 = (removalAmount1 - Math.floor(removalAmount1))
        .toFixed(3)
        .replace(".", "")
        .replace(/^0+/, "").length;

      const decimalValue1 = Number(
        (removalAmount1 - Math.floor(removalAmount1)).toFixed(3)
      );

      formattedNumber1 =
        integerLength1 > 1 && decimalValue1 !== 0
          ? formattedNumber1.padEnd(
              formattedNumber1.length +
                (18 - (formattedNumber1.length - integerLength1)),
              "0"
            )
          : decimalLength1 === 1 || decimalValue1 === 0
          ? formattedNumber1.padEnd(formattedNumber1.length + 18, "0")
          : formattedNumber1.padEnd(
              formattedNumber1.length + (18 - decimalLength1),
              "0"
            );
      formattedNumber1 =
        formattedNumber1.slice(0, -18) + formattedNumber1.slice(-18);
     const approveTx = await pairContract
        .approve(RouterAddress, ethers.toBigInt(formattedNumber1))
        .catch(
          (error: any) => {
            console.log(error);
          }
        );

        await provider.waitForTransaction(approveTx.hash)
        await checkApproval()
    } catch (error) {
      console.log(error);
    }
  };

  const getBalance = async (token0: string, token1: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      const factoryContract = new ethers.Contract(
        factory_address,
        FactoryAbi,
        signer
      );

      const pairAddress = await factoryContract.getPair(token0, token1);
      const pairContract = new ethers.Contract(
        pairAddress,
        PairAbi,
        signer
      );
      const totalSupply = await pairContract
        .totalSupply()
        .then(null, (error) => console.log(error));
      const reserves: any = await pairContract
        .getReserves()
        .then(null, (error) => console.log(error));
      const pairBalance = await pairContract
        .balanceOf(signerAddress)
        .then(null, (error) => console.log(error));

      setReserve0(Number(ethers.formatEther(reserves[0])));
      setReserve1(Number(ethers.formatEther(reserves[1])));

      const holdings = Number(pairBalance) / Number(totalSupply);
      const token0holdings: number = Number(ethers.formatEther(reserves[0]))* holdings;
      const token1holdings = Number(ethers.formatEther(reserves[1])) * holdings;

        const bal0 = token0holdings < .001 ? 0 :token0holdings 
        const bal1 = token1holdings < .001 ? 0 :token1holdings 
      setToken0Balance(bal0);
      setToken1Balance(bal1);
      setLPHoldings(Number(ethers.formatEther(pairBalance)));
      setPercentOfPool(holdings * 100);

      const token0Contract = new ethers.Contract(token0, ERC20, signer);

      const symbol0 = await token0Contract
        .symbol()
        .then(null, (error) => console.log(error));

      const name0 = await token0Contract
        .name()
        .then(null, (error) => console.log(error));

      setToken0({
        name: name0,
        symbol: symbol0,
        address: token0,
      } as Coin);

      const token1Contract = new ethers.Contract(token1, ERC20, signer);

      const symbol1 = await token1Contract
        .symbol()
        .then(null, (error) => console.log(error));

      const name1 = await token1Contract
        .name()
        .then(null, (error) => console.log(error));

      setToken1({
        name: name1,
        symbol: symbol1,
        address: token1,
      } as Coin);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const calculateStats0 = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const factoryContract = new ethers.Contract(
          factory_address,
          FactoryAbi,
          signer
        );
        const pairAddress = await factoryContract.getPair(
          token0.address,
          token1.address
        );
        const pairContract = new ethers.Contract(
          pairAddress,
          PairAbi,
          signer
        );
        const totalSupply = await pairContract.totalSupply();
        const reserves = await pairContract.getReserves();
        const liquidityGenerated = Math.min(
          (Number(token0Input) * Number(totalSupply)) / Number(reserves[0]),
          (Number(token0Input) * Number(totalSupply)) / Number(reserves[1])
        );
        setExpectedOut(liquidityGenerated);
        setReserve0(Number(reserves[0]));
        setReserve1(Number(reserves[1]));

        if (Number(reserves[0]) === 0) {
          setToken0Input(token1Input);
          const token0 = document.getElementById("token0") as HTMLInputElement;
          token0.value = String(token1Input);
        } else if (Number(reserves[0]) !== 0) {
          const outPutToken =
            (Number(reserves[0]) * token1Input * 1000) /
            (Number(reserves[1]) * 1000);
          setToken0Input(outPutToken);
          const token0 = document.getElementById("token0") as HTMLInputElement;
          token0.value = String(outPutToken);
        }
      } catch (error) {
        console.log(error);
      }

      calculateStats0();
    };

    const calculateStats = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        const factoryContract = new ethers.Contract(
          factory_address,
          FactoryAbi,
          signer
        );
        const pairAddress = await factoryContract.getPair(
          token0.address,
          token1.address
        );
        const pairContract = new ethers.Contract(
          pairAddress,
          PairAbi,
          signer
        );
        const totalSupply = await pairContract.totalSupply();
        const reserves = await pairContract.getReserves();
        const liquidityGenerated = Math.min(
          (Number(token0Input) * Number(totalSupply)) / Number(reserves[0]),
          (Number(token0Input) * Number(totalSupply)) / Number(reserves[1])
        );
        setExpectedOut(liquidityGenerated);
        setReserve0(Number(reserves[0]));
        setReserve1(Number(reserves[1]));

        if (Number(reserves[0]) === 0) {
          setToken1Input(token0Input);
          const token1 = document.getElementById("token1") as HTMLInputElement;
          token1.value = String(token0Input);
        } else if (Number(reserves[0]) !== 0) {
          const outPutToken =
            (Number(reserves[1]) * token0Input * 1000) /
            (Number(reserves[0]) * 1000);
          setToken1Input(outPutToken);
          const token1 = document.getElementById("token1") as HTMLInputElement;
          token1.value = String(outPutToken);
        }
      } catch (error) {
        console.log(error);
      }

      calculateStats();
    };
  }, [token1Input, token0Input]);

  const path = usePathname().split("/");



  useEffect(() => {
    const token0Pth = path[3];
    const token1Pth = path[4];
    getBalance(token0Pth, token1Pth);
  }, [token0.address, token1.address]);

  useEffect(() => {
    if (token0.address !== "" && token1.address !== "") {
      checkApproval();
    }
  }, [needsApproval, token0.address, token1.address, removePercent]);

  useEffect(() => {
  }, [token0Balance, token1Balance]);

  return (
    <>
      <ConfirmingToast
        hash={toastTxnHash}
        key={showToast}
        isOpen={showToast}
        closeToast={(toast: string) => setShowToast(toast)}
      />
      <div className="flex flex-col md:max-w-[30vw] mx-auto bg-[#00AFE340] rounded-3xl mt-[3vh]">
        <div className="flex flex-row items-center justify-between p-[5%]">
          <Link href={"/liquidity"}>
            <ArrowSmallLeftIcon color="white" width="1vw" height="1vw" />
          </Link>
          <span className="text-white font-medium text-xl">
            Remove Liquidity
          </span>
          <QuestionMarkCircleIcon color="white" width="1vw" height="1vw" />
        </div>
        <div className="border-[1px] border-[#86C7DB25] rounded-xl mx-[3%] p-[5%] text-white ">
          <div className="flex flex-row justify-between text-[#00DAAC]">
            <span className="text-white">Amount</span>
            <span
              className="cursor-pointer"
              onClick={() => {
                if (display === "detailed") {
                  setDisplay("simple");
                } else {
                  setDisplay("detailed");
                }
              }}
            >
              {display === "detailed" ? "Detailed" : "Simple"}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[4rem]">{removePercent}%</span>
            <input
              value={removePercent}
              onChange={async (e) => {
                setRemovePercentage(Number(e.target.value));
              }}
              className="cursor-pointer w-full my-[2vh] focus:outline-none"
              type="range"
              min={0}
              max={100}
              step={1}
            ></input>
            <div className="flex flex-row justify-between pt-[2vh]">
              <button
                onClick={() => {
                  setRemovePercentage(25);
                }}
                className="rounded-lg  bg-[#00DAAC40] h-[4vh] w-[] px-3 py-2 text-[#00DAAC] border border-solid-[1px] border-[#00DAAC]"
              >
                25%
              </button>
              <button
                onClick={() => {
                  setRemovePercentage(50);
                }}
                className="rounded-lg  bg-[#00DAAC40] h-[4vh] w-[] px-3 py-2 text-[#00DAAC] border border-solid-[1px] border-[#00DAAC]"
              >
                50%
              </button>
              <button
                onClick={() => {
                  setRemovePercentage(75);
                }}
                className="rounded-lg  bg-[#00DAAC40] h-[4vh] w-[] px-3 py-2 text-[#00DAAC] border border-solid-[1px] border-[#00DAAC]"
              >
                75%
              </button>
              <button
                onClick={() => {
                  setRemovePercentage(100);
                }}
                className="rounded-lg  bg-[#00DAAC40] h-[4vh] w-[] px-3 py-2 text-[#00DAAC] border border-solid-[1px] border-[#00DAAC]"
              >
                Max
              </button>
            </div>
          </div>
        </div>
        <div>
          <ArrowDownIcon
            className="mx-auto my-[2vh]"
            color="white"
            width="1.5vw"
            height="1.5vw"
          />
          <div className="border-[1px] border-[#86C7DB25] rounded-xl mx-[3%] text-white ">
            <div className="border-b-[1px] border-[#86C7DB25] rounded-xl  p-[5%] text-white ">
              <span className="flex flex-row text-2xl justify-between items-center">
                <p className="">{token0Balance.toFixed(3)}</p>
                <span className="flex flex-row items-center justify-center">
                  <QuestionMarkCircleIcon
                    className="w-[2.5vh] h-[2.5vh] mr-[5%]"
                    width="100%"
                    height="100%"
                  />
                  {token0.symbol}
                </span>
              </span>

              <span className="flex flex-row justify-between items-center text-2xl">
                <p className="">{token1Balance.toFixed(3)}</p>
                <span className="flex flex-row items-center justify-center">
                  <QuestionMarkCircleIcon
                    className="w-[2.5vh] h-[2.5vh] mr-[5%]"
                    width="100%"
                    height="100%"
                  />
                  {token1.symbol}
                </span>
              </span>
            </div>

            <span className="flex flex-col justify-between p-[5%]">
              <p>Price:</p>
              <span className="flex flex-col space-y-[1vh]">
                <p>
                  {Number.isNaN(reserve0 / reserve1) ? 0 : (reserve0 / reserve1).toFixed(3)}{" "}
                  {token0.symbol} ={" "}
                  {Number.isNaN(reserve1 / reserve0) ? 0 : (reserve1 / reserve0).toFixed(3)}{" "}
                  {token1.symbol}
                </p>
                <p>
                  {Number.isNaN(reserve1 / reserve0) ? 0 : (reserve1 / reserve0).toFixed(3)}{" "}
                  {token1.symbol} ={" "}
                  {Number.isNaN(reserve0 / reserve1) ? 0 : (reserve0 / reserve1).toFixed(3)}{" "}
                  {token0.symbol}
                </p>
              </span>
            </span>
          </div>
          <span className="flex flex-row mt-[2vh] justify-between mb-[2vh] mx-[3%]">
            <button
            key={needsApproval}
              onClick={() => approveTokens()}
              className={
                needsApproval === 1
                  ? "py-[2vh] w-[49%] bg-[#00DAAC90] rounded-xl flex flex-row justify-center items-center text-white"
                  : "py-[2vh] w-[49%] bg-gray-600 rounded-xl flex flex-row justify-center items-center text-white cursor-not-allowed"
              }
            >
              Approve
            </button>
            <button
              disabled={needsApproval === 1}
              onClick={() => removeLiquidity()}
              className={
                needsApproval === 0
                  ? "py-[2vh] w-[49%] bg-[#00DAAC90] rounded-xl flex flex-row justify-center items-center text-white"
                  : "py-[2vh] w-[49%] bg-gray-600 rounded-xl flex flex-row justify-center items-center text-white cursor-not-allowed"
              }
            >
              Remove
            </button>
          </span>
        </div>
      </div>
      <div className="text-white bg-gray-600 w-[30vw] rounded-2xl mx-auto md:max-w-[30vw] mt-[1vh]">
        <div className="mx-[4%] py-[4%] ">
          <span className="flex flex-row justify-start items-center">
            <p>Your Position</p>
          </span>

          <span className="flex flex-row justify-between items-center text-xl pt-[1vh]">
            <p>
              {token0.symbol} / {token1.symbol}
            </p>
            <p> {lpHoldings < .001 ? 0 : lpHoldings.toFixed(3)}</p>
          </span>

          <span className="flex flex-row justify-between items-center">
            <p>Your pool share:</p>
            <p>{percentOfPool.toFixed(3)}%</p>
          </span>

          <span className="flex flex-row justify-between items-center">
            <p>{token0.symbol}:</p>
            <p>{token0Balance  < .01 ? 0 : token0Balance.toFixed(3)}</p>
          </span>

          <span className="flex flex-row justify-between items-center">
            <p>{token1.symbol}:</p>
            <p>{token1Balance < .1 ? 0 : token1Balance.toFixed(3)}</p>
          </span>
        </div>
      </div>
    </>
  );
}

export default RemoveLiquidity;
