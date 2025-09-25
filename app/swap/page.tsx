"use client";

import CoinListButton from "@/app/components/Buttons/CoinListButton";
import CoinListItem from "@/app/components/CoinListItem";
import ERC20 from "@/abis/ERC20.json";
import RouterAbi from "@/abis/Router.json";
import PairAbi from "@/abis/Pair.json";
import FactoryAbi from "@/abis/Factory.json";
import NativeWrapperAbi from "@/abis/NativeWrapper.json";
import {
  Gold,
  RouterAddress,
  WrapperAddress,
  Silver,
  factory_address,
  compareHex,
} from "@/utils/constants";
import { Dialog, Transition } from "@headlessui/react";
import {
  ArrowSmallDownIcon,
  ArrowSmallLeftIcon,
  ArrowSmallUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { ethers } from "ethers";
import Link from "next/link";
import React, { Fragment, use, useEffect, useState } from "react";
import { useStore } from "../useStore";
import { ConfirmingToast } from "../components/Toasts/Confirming";

interface Coin {
  name: string;
  symbol: string;
  address: string;
  image: string;
}

export default function Swap() {
  const [
    Slippage,
    Network,
    Connection,
    Deadline,
    updateNetwork,
    updateSlippage,
    updateConnection,
    updateDeadline,
  ] = useStore((state: any) => [
    state.Slippage,
    state.Network,
    state.Connection,
    state.Deadline,
    state.updateNetwork,
    state.updateSlippage,
    state.updateConnection,
    state.updateDeadline,
  ]);
  const [isSelected, setSelected] = useState(false);
  const [token0, setToken0] = useState({
    name: "Sparq",
    symbol: "SPRQ",
    address: "undefined",
    image: "/logo.svg",
  } as Coin);
  const [token1, setToken1] = useState({
    name: "Sparq",
    symbol: "SPRQ",
    address: "undefined",
    image: "/logo.svg",
  } as Coin);
  const [token0Input, setToken0Input] = useState(0);
  const [token0Balance, setToken0Balance] = useState(0);
  const [token1Balance, setToken1Balance] = useState(0);
  const [token1Input, setToken1Input] = useState(0);
  const [direction, setDirection] = useState("down");
  const [needsApproval, setNeedsApproval] = useState(true);
  const [impact, setImpact] = useState(0);
  const [reserve0, setReserve0] = useState(0);
  const [reserve1, setReserve1] = useState(0);
  const [noLiq, setNoLiq] = useState(false);
  const [toastTxnHash, setToastTxnHash] = useState("");
  const [showToast, setShowToast] = useState("");

  const [coinsForListing, setCoinsForListing] = useState([
    { name: "Gold", symbol: "GLD", address: Gold, image: "/gold.png" } as Coin,
    {
      name: "Silver",
      symbol: "SLV",
      address: Silver,
      image: "/silver.png",
    } as Coin,
    {
      name: "Wrapped Sparq",
      symbol: "WSPRQ",
      address: WrapperAddress,
      image: "/logo.svg",
    } as Coin,
    {
      name: "Sparq",
      symbol: "SPRQ",
      address: "undefined",
      image: "/logo.svg",
    } as Coin,
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isOpen, setIsOpen] = useState({ show: false, tokenNum: -1 });

  const checkApproval = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      const token0Contract = new ethers.Contract(token0.address, ERC20, signer);
      const token1Contract = new ethers.Contract(token1.address, ERC20, signer);

      const token0Allowance = await token0Contract.allowance(
        signerAddress,
        RouterAddress
      );
      const token1Allowance = await token1Contract.allowance(
        signerAddress,
        RouterAddress
      );

      if (
        (Number(ethers.formatEther(token0Allowance)) < token0Input &&
          Number(ethers.formatEther(token1Allowance)) > token1Input) ||
        (Number(ethers.formatEther(token0Allowance)) > token0Input &&
          Number(ethers.formatEther(token1Allowance)) < token1Input)
      ) {
        setNeedsApproval(true);
        return;
      }

      if (
        Number(ethers.formatEther(token0Allowance)) < token0Input &&
        Number(ethers.formatEther(token1Allowance)) < token1Input
      ) {
        setNeedsApproval(true);
        return;
      }

      if (
        Number(ethers.formatEther(token0Allowance)) >= token0Input &&
        Number(ethers.formatEther(token1Allowance)) >= token1Input
      ) {
        setNeedsApproval(false);
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkApprovalNative = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    if (token0.address === "undefined") {
      const token1Contract = new ethers.Contract(token1.address, ERC20, signer);
      const token1Allowance = await token1Contract!.allowance(
        signerAddress,
        RouterAddress
      );
      const token1Balance = await token1Contract.balanceOf(signerAddress);
      setToken0Balance(
        Number(ethers.formatEther(await provider.getBalance(signerAddress)))
      );
      setToken1Balance(Number(ethers.formatEther(token1Balance)));
      console.log(ethers.formatEther(token1Allowance), token1Input);
      if (Number(ethers.formatEther(token1Allowance)) < token1Input) {
        setNeedsApproval(true);
      } else {
        setNeedsApproval(false);
      }
    }
    if (token1.address === "undefined") {
      const token0Contract = new ethers.Contract(token0.address, ERC20, signer);
      const token0Allowance = await token0Contract!.allowance(
        signerAddress,
        RouterAddress
      );
      const token0Balance = await token0Contract.balanceOf(signerAddress);
      setToken0Balance(Number(ethers.formatEther(token0Balance)));
      setToken1Balance(
        Number(ethers.formatEther(await provider.getBalance(signerAddress)))
      );
      if (Number(ethers.formatEther(token0Allowance)) < token0Input) {
        setNeedsApproval(true);
      } else {
        setNeedsApproval(false);
      }
    }
  };

  const calcOutAmount = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();

    const FactoryContract = new ethers.Contract(
      factory_address,
      FactoryAbi,
      signer
    );

    const tokenIn =
      token0.address === "undefined" ? WrapperAddress : token0.address;
    const tokenOut =
      token1.address === "undefined" ? WrapperAddress : token1.address;

    const doesLPTokenExist = await FactoryContract.getPair(tokenIn, tokenOut);
    if (doesLPTokenExist === "0x0000000000000000000000000000000000000000") {
      setNoLiq(true);
      return;
    }
    setNoLiq(false);
    const PairContract = new ethers.Contract(
      await doesLPTokenExist,
      PairAbi,
      signer
    );

    const res = await PairContract.getReserves();

    const reserve0: bigint = res["reserve0"];
    const reserve1: bigint = res["reserve1"];

    const token0InputAmount = ethers.parseUnits(String(token0Input), "ether");
    const amountInWFee = token0InputAmount * ethers.toBigInt(997);
    const numerator =
      amountInWFee *
      (0 ===
      tokenIn
        .toLowerCase()
        .localeCompare([tokenIn, tokenOut].sort(compareHex)[0].toLowerCase())
        ? reserve1
        : reserve0);
    const denominator =
      (0 ===
      tokenIn
        .toLowerCase()
        .localeCompare([tokenIn, tokenOut].sort(compareHex)[0].toLowerCase())
        ? reserve0
        : reserve1) *
        ethers.toBigInt(1000) +
      amountInWFee;
    setToken1Input(Number(ethers.formatEther(numerator / denominator)));
    const toke1 = document.getElementById("token1Input") as HTMLInputElement;
    toke1.value = Number(ethers.formatEther(numerator / denominator)).toFixed(
      3
    );

    const kstant: bigint =
      (0 ===
      tokenIn
        .toLowerCase()
        .localeCompare([tokenIn, tokenOut].sort(compareHex)[0].toLowerCase())
        ? reserve1
        : reserve0) *
      (0 ===
      tokenIn
        .toLowerCase()
        .localeCompare([tokenIn, tokenOut].sort(compareHex)[0].toLowerCase())
        ? reserve0
        : reserve1);
    const inReserveChange =
      (0 ===
      tokenIn
        .toLowerCase()
        .localeCompare([tokenIn, tokenOut].sort(compareHex)[0].toLowerCase())
        ? reserve1
        : reserve0) + token0InputAmount;
    const outReserveChange = kstant / inReserveChange;
    const pricePaid: number =
      Number(token0InputAmount) / Number(outReserveChange);
    const reserveIn =
      tokenIn
        .toLowerCase()
        .localeCompare([tokenIn, tokenOut].sort(compareHex)[0].toLowerCase()) ==
      0
        ? reserve0
        : reserve1;
    const reserveOut =
      tokenIn
        .toLowerCase()
        .localeCompare([tokenIn, tokenOut].sort(compareHex)[0].toLowerCase()) ==
      0
        ? reserve1
        : reserve0;
    const bestPrice: number = Number(reserveIn) / Number(reserveOut);
    const impact = pricePaid / bestPrice;

    setImpact(Number((impact * 100).toFixed(3)));
  };

  const swap = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();

    const RouterContract = new ethers.Contract(
      RouterAddress,
      RouterAbi,
      signer
    );

    const block = await provider.getBlock("latest");
    let deadline;

    if (block) {
      deadline = block.timestamp + Deadline * 60;
      // Further processing using the deadline
    } else {
      // Handle the case when the block is null
      console.error("Error: Block is null");
    }

    if (token0.address === "undefined") {
      const supply = await RouterContract.swapExactNativeForTokens(
        ethers.parseUnits(
          String(token1Input - token1Input * (Slippage / 100)),
          "ether"
        ),
        [WrapperAddress, token1.address],
        signerAddress,
        deadline,
        { value: ethers.parseUnits(String(token0Input), "ether") }
      );

      setToastTxnHash(await supply.hash);
      setShowToast("confirm");
      await provider.waitForTransaction(await supply.hash).then(
        async () => {
          setToken0Input(0);
          setToken1Input(0);
          const reset1 = document.getElementById(
            "token0Input"
          ) as HTMLInputElement;
          reset1.value = String(0);
          const reset2 = document.getElementById(
            "token1Input"
          ) as HTMLInputElement;
          reset2.value = String(0);
          await checkApprovalNative();
          await getBalance();
          async () => {
            await window.ethereum.request({
              method: "wallet_watchAsset",
              params: {
                type: "ERC20",
                options: {
                  address: token1.address,
                  symbol: token1.symbol,
                  decimals: 18,
                  image: token1.image,
                },
              },
            });
          };
        },
        (err) => console.log(err)
      );
      return;
    }

    if (token1.address === "undefined") {
      const supply = await RouterContract.swapExactTokensForNative(
        ethers.parseUnits(String(token0Input), "ether"),
        ethers.parseUnits(
          String(token1Input - token1Input * (Slippage / 100)),
          "ether"
        ),
        [token0.address, WrapperAddress],
        signerAddress,
        deadline
      );

      setToastTxnHash(await supply.hash);
      setShowToast("confirm");
      await provider.waitForTransaction(await supply.hash).then(
        async () => {
          setToken0Input(0);
          setToken1Input(0);
          const reset1 = document.getElementById(
            "token0Input"
          ) as HTMLInputElement;
          reset1.value = String(0);
          const reset2 = document.getElementById(
            "token1Input"
          ) as HTMLInputElement;
          reset2.value = String(0);
          await checkApprovalNative();
          await getBalance();
        },
        (err) => console.log(err)
      );
      return;
    }
    const txn = await RouterContract.swapExactTokensForTokens(
      ethers.parseUnits(String(token0Input), "ether"),
      ethers.parseUnits(
        String(token1Input - (token1Input * Slippage) / 100),
        "ether"
      ),
      0 ===
        token0.address
          .toLowerCase()
          .localeCompare(
            [token0.address, token1.address].sort(compareHex)[0].toLowerCase()
          )
        ? [token0.address, token1.address]
        : [token1.address, token0.address],
      signerAddress,
      deadline
    ).catch((error) => console.log(error));
    setToastTxnHash(await txn.hash);
    setShowToast("confirm");
    await provider.waitForTransaction(await txn.hash).then(
      async () => {
        setToken0Input(0);
        setToken1Input(0);
        const reset1 = document.getElementById(
          "token0Input"
        ) as HTMLInputElement;
        reset1.value = String(0);
        const reset2 = document.getElementById(
          "token1Input"
        ) as HTMLInputElement;
        reset2.value = String(0);
        await checkApproval();
        await getBalance();
      },
      (err) => console.log(err)
    );
  };

  const approveTokens = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      const token0Contract = new ethers.Contract(token0.address, ERC20, signer);
      const token1Contract = new ethers.Contract(token1.address, ERC20, signer);

      const token0Allowance = await token0Contract.allowance(
        signerAddress,
        RouterAddress
      );
      const token1Allowance = await token1Contract.allowance(
        signerAddress,
        RouterAddress
      );
      let caughtError = false;
      if (
        Number(ethers.formatEther(token0Allowance)) < token0Input &&
        Number(ethers.formatEther(token1Allowance)) < token1Input
      ) {
        await token0Contract
          .approve(
            RouterAddress,
            ethers.parseUnits(String(token0Input + 50), "ether")
          )
          .then(null, (error) => {
            caughtError = true;
            console.log(error);
          });
        await token1Contract
          .approve(
            RouterAddress,
            ethers.parseUnits(String(token1Input + 50), "ether")
          )
          .then(null, (error) => {
            caughtError = true;
            console.log(error);
          });
        if (caughtError === false) {
          setNeedsApproval(false);
        }
      }

      if (
        Number(ethers.formatEther(token0Allowance)) < token0Input &&
        Number(ethers.formatEther(token1Allowance)) > token1Input
      ) {
        await token0Contract
          .approve(
            RouterAddress,
            ethers.parseUnits(String(token0Input + 50), "ether")
          )
          .then(null, (error) => {
            caughtError = true;
            console.log(error);
          });
        if (caughtError === false) {
          setNeedsApproval(false);
        }
      }

      if (
        Number(ethers.formatEther(token0Allowance)) > token0Input &&
        Number(ethers.formatEther(token1Allowance)) < token1Input
      ) {
        await token1Contract
          .approve(
            RouterAddress,
            ethers.parseUnits(String(token1Input + 50), "ether")
          )
          .then(null, (error) => {
            caughtError = true;
            console.log(error);
          });
        if (caughtError === false) {
          setNeedsApproval(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const approveForNative = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();
    let caughtError: boolean = false;
    if (token0.address === "undefined") {
      const token1Contract = new ethers.Contract(token1.address, ERC20, signer);
      const token1Allowance = await token1Contract!.allowance(
        signerAddress,
        RouterAddress
      );
      if (Number(ethers.formatEther(token1Allowance)) < token1Input) {
        const tx1 = await token1Contract!
          .approve(
            RouterAddress,
            ethers.parseUnits(String(token1Input), "ether")
          )
          .then(null, (error) => {
            caughtError = true;
            console.log(error);
          });
        await provider.waitForTransaction(tx1.hash).finally(() => {
          if (caughtError === false) {
            setNeedsApproval(false);
          }
        });
      }
    }
    if (token1.address === "undefined") {
      const token0Contract = new ethers.Contract(token0.address, ERC20, signer);
      const token0Allowance = await token0Contract!.allowance(
        signerAddress,
        RouterAddress
      );
      if (Number(ethers.formatEther(token0Allowance)) < token0Input) {
        const tx1 = await token0Contract!
          .approve(
            RouterAddress,
            ethers.parseUnits(String(token0Input), "ether")
          )
          .then(null, (error) => {
            caughtError = true;
            console.log(error);
          });
        await provider.waitForTransaction(tx1.hash).finally(() => {
          if (caughtError === false) {
            setNeedsApproval(false);
          }
        });
      }
    }
  };

  const chooseTokenFunction = async (coin: Coin) => {
    if (token0.address === coin.address || token1.address === coin.address) {
      return;
    }

    if (
      (token0.address === WrapperAddress && coin.address === "undefined") ||
      (token1.address === WrapperAddress && coin.address === "undefined")
    ) {
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

  const getBalance = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      if (isOpen.tokenNum === 0) {
        if (token0.address === "undefined") {
          await provider.getBalance(signerAddress).then(
            (ret) => setToken0Balance(Number(ethers.formatEther(ret))),
            (error) => console.log(error)
          );
          return;
        }

        const token0Contract = new ethers.Contract(
          token0.address,
          ERC20,
          signer
        );
        const balance = await token0Contract
          .balanceOf(signerAddress)
          .then(null, (error) => console.log(error));
        setToken0Balance(Number(ethers.formatEther(balance)));
        return;
      }

      if (isOpen.tokenNum === 1) {
        if (token1.address === "undefined") {
          await provider.getBalance(signerAddress).then(
            (ret) => setToken1Balance(Number(ethers.formatEther(ret))),
            (error) => console.log(error)
          );
          return;
        }

        const token1Contract = new ethers.Contract(
          token1.address,
          ERC20,
          signer
        );
        const balance = await token1Contract
          .balanceOf(signerAddress)
          .then(null, (error) => console.log(error));
        setToken1Balance(Number(ethers.formatEther(balance)));
        return;
      }

      if (isSelected) {
        const factoryContract = new ethers.Contract(
          factory_address,
          FactoryAbi,
          signer
        );
        let token0Contract;
        let token1Contract;
        if (token1.address === "undefined") {
          await provider.getBalance(signerAddress).then(
            (ret) => setToken1Balance(Number(ethers.formatEther(ret))),
            (error) => console.log(error)
          );
          token1Contract = new ethers.Contract(WrapperAddress, ERC20, signer);
        } else {
          token1Contract = new ethers.Contract(token1.address, ERC20, signer);
          const balance1 = await token1Contract
            .balanceOf(signerAddress)
            .then(null, (error) => console.log(error));
          setToken1Balance(Number(ethers.formatEther(balance1)));
        }
        if (token0.address === "undefined") {
          await provider.getBalance(signerAddress).then(
            (ret) => setToken0Balance(Number(ethers.formatEther(ret))),
            (error) => console.log(error)
          );
          token0Contract = new ethers.Contract(WrapperAddress, ERC20, signer);
        } else {
          token0Contract = new ethers.Contract(token0.address, ERC20, signer);
          const balance0 = await token0Contract
            .balanceOf(signerAddress)
            .then(null, (error) => console.log(error));
          setToken0Balance(Number(ethers.formatEther(balance0)));
        }

        const tokenIn =
          token0.address === "undefined" ? WrapperAddress : token0.address;
        const tokenOut =
          token1.address === "undefined" ? WrapperAddress : token1.address;
        try {
          const pairAddress = await factoryContract.getPair(tokenIn, tokenOut);
          if (pairAddress != "0x0000000000000000000000000000000000000000") {
            const pairContract = new ethers.Contract(
              pairAddress,
              PairAbi,
              signer
            );
            const reserves: any = await pairContract
              .getReserves()
              .then(null, (error) => console.log(error));
            setReserve0(Number(ethers.formatEther(reserves[0])));
            setReserve1(Number(ethers.formatEther(reserves[1])));
            return;
          }
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getNativeBalance = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();

    await provider.getBalance(signerAddress).then(
      (ret) => setToken0Balance(Number(ethers.formatEther(ret))),
      (error) => console.log(error)
    );
  };

  useEffect(() => {
    if (isSelected && (token0Input >= 0 || token1Input >= 0)) {
      if (token0.address === "undefined" || token1.address === "undefined") {
        checkApprovalNative();
        return;
      }
      checkApproval();
    }
  }, [isSelected, token0Input, token1Input, token1.address, token0.address]);

  useEffect(() => {
    getBalance();
  }, [token0.address, token1.address]);

  useEffect(() => {
    if (token0.address === "undefined") {
      getNativeBalance();
    }
  }, []);

  useEffect(() => {
    if (isSelected === true) {
      calcOutAmount();
    }
  }, [token0.address, token1.address, token0Input, token1Input]);
  return (
    <>
      <ConfirmingToast
        hash={toastTxnHash}
        key={showToast}
        isOpen={showToast}
        closeToast={(toast: string) => setShowToast(toast)}
      />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-black border border-grey text-left align-middle shadow-xl transition-all">
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
                      className="border border-grey2 outline-none py-2.5 pl-12 rounded-lg w-full placeholder:text-grey placeholder:font-regular text-white"
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

      <div className="flex flex-col box-border md:max-w-[27vw] mx-auto bg-[#00AFE340] rounded-3xl mt-[10vh]">
        <div className="border-[1px] border-[#86C7DB25] rounded-xl mx-[3%] mt-[5%] p-[3%] text-white">
          <div className="flex flex-row justify-between">
            <span className="select-none text-sm">
              From{" "}
              {isSelected &&
              0 ===
                token0.address
                  .toLowerCase()
                  .localeCompare(
                    [token0.address, token1.address]
                      .sort(compareHex)[1]
                      .toLowerCase()
                  )
                ? "(estimated)"
                : ""}
            </span>
            <span key={token0.address}>Balance:{token0Balance.toFixed(2)}</span>
          </div>

          <div className="flex flex-row justify-between py-[.5vh]">
            <input
              onChange={(e) => {
                setToken0Input(Number(e.target.value));
                calcOutAmount();
              }}
              id="token0Input"
              type="number"
              className="text-2xl bg-transparent border-transparent w-1/2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0.0"
            />
            <button
              onClick={() => setIsOpen({ show: true, tokenNum: 0 })}
              className="flex flex-row space-x-[.5vw] items-center bg-[#00DAAC30] rounded-xl px-2 py-[.2vh]"
            >
              <img className="w-[1vw]" src={token0.image} />
              <p className="text-xl font-medium">{token0.name.toUpperCase()}</p>
              <ChevronDownIcon color="white" width="1vw" height="1vw" />
            </button>
          </div>
        </div>
        <span
          className="mx-auto text-white text-xl my-[1vh] p-2 border border-[1px] border-[#86C7DB25] bg-[#00DAAC30] rounded-lg cursor-pointer box-border"
          onClick={async () => {
            if (isSelected) {
              let temp = token0;
              let temp1 = token1;
              setToken1(temp);
              setToken0(temp1);
              console.log(token0Balance);
              if (direction === "down") {
                setDirection("up");
              } else {
                setDirection("down");
              }
            }
          }}
        >
          <ArrowSmallDownIcon color="white" className="w-4 h-4" />
        </span>

        <div className="border-[1px] border-[#86C7DB25] rounded-xl mx-[3%] p-[3%] text-white ">
          <div className="flex flex-row justify-between">
            <span className="select-none text-sm">
              To{" "}
              {isSelected &&
              0 ===
                token1.address
                  .toLowerCase()
                  .localeCompare(
                    [token0.address, token1.address]
                      .sort(compareHex)[1]
                      .toLowerCase()
                  )
                ? "(estimated)"
                : ""}
            </span>
            <span key={token1.address} className="select-none">
              {" "}
              {isSelected === true
                ? `Balance:${token1Balance.toFixed(2)}`
                : "-"}
            </span>
          </div>

          {isSelected === true ? (
            <div className="flex flex-row justify-between items-end py-[.5vh]">
              <input
                onChange={(e) => {
                  setToken1Input(Number(e.target.value));
                }}
                id="token1Input"
                type="number"
                className="text-2xl bg-transparent border-transparent w-1/2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0.0"
              />
              <button
                onClick={() => setIsOpen({ show: true, tokenNum: 1 })}
                className="flex flex-row space-x-[.5vw] items-center bg-[#00DAAC30] rounded-xl px-2 py-[.2vh]"
              >
                <img className="w-[1vw]" src={token1.image} />
                <p className="text-xl font-medium">
                  {token1.name.toUpperCase()}
                </p>
                <ChevronDownIcon color="white" width="1vw" height="1vw" />
              </button>
            </div>
          ) : (
            <div className="flex flex-row justify-between items-end py-[.5vh]">
              <input
                disabled={true}
                id="token1Input"
                type="number"
                className="text-2xl bg-transparent border-transparent w-1/2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0.0"
              />
              <button
                onClick={() => setIsOpen({ show: true, tokenNum: 1 })}
                className="flex flex-row space-x-[.5vw] items-center bg-[#00DAAC30] rounded-xl px-2 py-[.2vh]"
              >
                <p className="text-xl font-normal">Select Token</p>
                <ChevronDownIcon color="white" width="1vw" height="1vw" />
              </button>
            </div>
          )}
        </div>
        {isSelected ? (
          <div className="border-[1px] border-[#86C7DB25] rounded-xl mx-[3%] text-white flex flex-col mt-[2vh] ">
            <span className="p-[3%]">Price and Impact</span>
            <div className="border-[1px] border-[#86C7DB25] rounded-xl p-[3%] flex flex-col justify-between ">
              <span className="flex flex-row items-center w-full space-x-1">
                <p key={direction}>
                  {direction === "up"
                    ? Number.isNaN(reserve0 / reserve1)
                      ? 0
                      : " " + (reserve0 / reserve1).toFixed(3)
                    : Number.isNaN(reserve1 / reserve0)
                    ? 0
                    : (reserve1 / reserve0).toFixed(3)}
                </p>
                <span className="font-bold">- {token0.symbol}</span>
                <span> per </span>
                <span className="font-bold">{token1.symbol}</span>
              </span>
              <span>
                Impact:{" "}
                <span
                  className={
                    impact < 10
                      ? "text-green-500 font-bold"
                      : impact < 25
                      ? "text-yellow-500  font-bold"
                      : impact > 25
                      ? "text-red-500  font-bold"
                      : ""
                  }
                >
                  {impact}%
                </span>
              </span>
            </div>
          </div>
        ) : null}
        <span className="flex flex-row justify-between mx-[3%] pt-[1vh] px-[3%] text-white">
          <span>Slippage Tolerance</span>
          <span>{Slippage}%</span>
        </span>
        {isSelected === false ? (
          <button className="mt-[2vh] mx-[3%] rounded-xl bg-[#888D9B] py-[2vh] mb-[2vh] font-medium text-lg text-[#3E4148]">
            {" "}
            Invalid pair
          </button>
        ) : noLiq === true ? (
          <button
            disabled
            className="mt-[2vh] mx-[3%] rounded-xl bg-red-900 py-[2vh] mb-[2vh] font-medium text-lg text-red-200 cursor-not-allowed"
          >
            {" "}
            No Liquidity
          </button>
        ) : token0Input > token0Balance || token1Input > token1Balance ? (
          <button className="mt-[2vh] mx-[3%] rounded-xl bg-red-900 py-[2vh] mb-[2vh] font-medium text-lg text-red-200 cursor-not-allowed">
            {" "}
            Insufficient Balance
          </button>
        ) : token0Input === 0 || token1Input === 0 ? (
          <button className="mt-[2vh] mx-[3%] rounded-xl bg-[#888D9B] py-[2vh] mb-[2vh] font-medium text-lg text-[#3E4148]">
            {" "}
            Enter an amount
          </button>
        ) : needsApproval === true ? (
          <button
            onClick={() => {
              if (
                token0.address === "undefined" ||
                token1.address === "undefined"
              ) {
                approveForNative();
                return;
              }
              approveTokens();
            }}
            className="mt-[2vh] mx-[3%] rounded-xl bg-[#00DAAC30] py-[2vh] mb-[2vh] font-medium text-lg  text-[#00DAAC]"
          >
            {" "}
            Approve{" "}
          </button>
        ) : (
          <button
            onClick={() => swap()}
            className="mt-[2vh] mx-[3%] rounded-xl  bg-[#00DAAC30] py-[2vh] mb-[2vh] font-medium text-[#00DAAC] shadow shadow-lg"
          >
            {" "}
            Swap
          </button>
        )}
      </div>
    </>
  );
}
