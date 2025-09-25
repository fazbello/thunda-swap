"use client";

import CoinListButton from "@/app/components/Buttons/CoinListButton";
import CoinListItem from "@/app/components/CoinListItem";
import ERC20 from "@/abis/ERC20.json";
import RouterAbi from "@/abis/Router.json";
import FactoryAbi from "@/abis/Factory.json";
import PairAbi from "@/abis/Pair.json";
import NativeWrapper from "@/abis/NativeWrapper.json";
import {
  Gold,
  RouterAddress,
  Silver,
  WrapperAddress,
  compareHex,
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
import { ConfirmingToast } from "@/app/components/Toasts/Confirming";
import { ethers } from "ethers";
import Link from "next/link";
import React, { Fragment, use, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useStore } from "@/app/useStore";

interface Coin {
  name: string;
  symbol: string;
  address: string;
  image: string;
  new?: boolean;
}

export default function AddLiquidity() {
  let tokenList = [
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
      address: "undefined",
      image: "/logo.svg",
    } as Coin,
    {
      name: "Wrapped Sparq",
      symbol: "WSPRQ",
      address: WrapperAddress,
      image: "/logo.svg",
    } as Coin,
  ];

  const [isSelected, setSelected] = useState(false);
  const [token0, setToken0] = useState({
    name: "SPARQ",
    symbol: "SPRQ",
    address: "undefined",
    image: "/logo.svg",
  } as Coin);
  const [token1, setToken1] = useState({
    name: "",
    symbol: "",
    address: "",
    image: "",
  } as Coin);
  const [Slippage, Network, Deadline] = useStore((state: any) => [
    state.Slippage,
    state.Network,
    state.Deadline,
  ]);
  const [token0Input, setToken0Input] = useState(0);

  const [expectedOut, setExpectedOut] = useState(0);
  const [lpTokenExists, setLPTokenExists] = useState(true);
  const [tokenField, setTokenField] = useState<undefined | number>(undefined);
  const [reserve0, setReserve0] = useState(0);
  const [toastTxnHash, setToastTxnHash] = useState("");
  const [showToast, setShowToast] = useState("");
  const [reserve1, setReserve1] = useState(0);
  const [token0Balance, setToken0Balance] = useState(0);
  const [token1Balance, setToken1Balance] = useState(0);
  const [token1Input, setToken1Input] = useState(0);
  const [needsApproval, setNeedsApproval] = useState(true);
  const [percentOfPool, setPercentOfPool] = useState(0);
  const [coinsForListing, setCoinsForListing] = useState(tokenList);
  const [inputVal, setInputVal] = useState("");
  const [isOpen, setIsOpen] = useState({ show: false, tokenNum: -1 });

  const checkApproval = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      let token0Contract;
      let token1Contract;

      if (
        (token0.address != WrapperAddress &&
          token1.address != WrapperAddress &&
          token0.address !== "undefined") ||
        token1.address !== "undefined"
      ) {
        token0Contract = new ethers.Contract(
          token0.address as string,
          ERC20,
          signer
        );
        token1Contract = new ethers.Contract(
          token1.address as string,
          ERC20,
          signer
        );
      }
      if (token0.address === WrapperAddress) {
        token0Contract = new ethers.Contract(
          token0.address,
          NativeWrapper,
          signer
        );
        token1Contract = new ethers.Contract(
          token1.address as string,
          ERC20,
          signer
        );
      }
      if (token1.address === WrapperAddress) {
        token0Contract = new ethers.Contract(
          token0.address as string,
          ERC20,
          signer
        );
        token1Contract = new ethers.Contract(
          token1.address,
          NativeWrapper,
          signer
        );
      }

      const token0Bal = await token0Contract!
        .balanceOf(signerAddress)
        .then(null, (error) => console.log(error));

      const token1Bal = await token1Contract!
        .balanceOf(signerAddress)
        .then(null, (error) => console.log(error));

      const token0Allowance = await token0Contract!.allowance(
        signerAddress,
        RouterAddress
      );
      const token1Allowance = await token1Contract!.allowance(
        signerAddress,
        RouterAddress
      );

      setToken0Balance(
        Number(Number(ethers.formatEther(token0Bal)).toFixed(3))
      );
      setToken1Balance(
        Number(Number(ethers.formatEther(token1Bal)).toFixed(3))
      );

      console.log(token0Allowance, token1Allowance);

      if (
        Number(ethers.formatEther(token0Allowance)) >= token0Input &&
        Number(ethers.formatEther(token1Allowance)) < token1Input
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
        Number(ethers.formatEther(token0Allowance)) < token0Input &&
        Number(ethers.formatEther(token1Allowance)) >= token1Input
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
      if (Number(ethers.formatEther(token1Allowance)) < token1Input) {
        setNeedsApproval(true);
      } else {
        setNeedsApproval(false);
      }
    }
    if (token1.address === "") {
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

  const supplyLiquidity = async () => {
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

      if (token0.address !== "undefined" && token1.address !== "undefined") {
        const tokenIn =
          [token0.address, token1.address].sort(compareHex)[0] ===
          token0.address;
        const tokenOut =
          [token0.address, token1.address].sort(compareHex)[1] ===
          token1.address;
        const supply = await RouterContract.addLiquidity(
          [token0.address, token1.address].sort(compareHex)[0],
          [token0.address, token1.address].sort(compareHex)[1],
          ethers.parseUnits(
            String(tokenIn ? token0Input : token1Input),
            "ether"
          ),
          ethers.parseUnits(
            String(tokenOut ? token1Input : token0Input),
            "ether"
          ),
          ethers.parseUnits(
            String(token0Input - token0Input * (Slippage / 100)),
            "ether"
          ),
          ethers.parseUnits(
            String(token1Input - token1Input * (Slippage / 100)),
            "ether"
          ),
          signerAddress,
          deadline
        );

        setToastTxnHash(await supply.hash);
        setShowToast("confirm");
        await provider.waitForTransaction(await supply.hash).then(
          async () => await checkApproval(),
          (err) => console.log(err)
        );
        return;
      }

      const TOKEN_SLOT =
        token0.address === "undefined" ? token1.address : token0.address;
      const TOKEN_INPUT =
        token0.address === "undefined" ? token1Input : token0Input;
      const NATIVE_INPUT =
        token0.address === "undefined" ? token0Input : token1Input;
      console.log(TOKEN_SLOT);
      console.log(ethers.parseUnits(String(TOKEN_INPUT), "ether"));
      console.log(
        ethers.parseUnits(
          String(TOKEN_INPUT - TOKEN_INPUT * (Slippage / 100)),
          "ether"
        )
      );
      console.log(
        ethers.parseUnits(
          String(NATIVE_INPUT - NATIVE_INPUT * (Slippage / 100)),
          "ether"
        )
      );

      const supply = await RouterContract.addLiquidityNative(
        TOKEN_SLOT,
        ethers.parseUnits(String(TOKEN_INPUT), "ether"),
        ethers.parseUnits(
          String(TOKEN_INPUT - TOKEN_INPUT * (Slippage / 100)),
          "ether"
        ),
        ethers.parseUnits(
          String(NATIVE_INPUT - NATIVE_INPUT * (Slippage / 100)),
          "ether"
        ),
        signerAddress,
        deadline,
        { value: ethers.parseUnits(String(NATIVE_INPUT), "ether") }
      );

      setToastTxnHash(await supply.hash);
      setShowToast("confirm");
      await provider.waitForTransaction(await supply.hash).then(
        async () => await checkApprovalNative(),
        (err) => console.log(err)
      );
      return;
    } catch (error) {
      console.log(error);
    }
  };

  const approveTokens = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      let token0Contract;
      let token1Contract;

      if (
        token0.address != WrapperAddress &&
        token1.address != WrapperAddress
      ) {
        token0Contract = new ethers.Contract(token0.address, ERC20, signer);
        token1Contract = new ethers.Contract(token1.address, ERC20, signer);
      }
      if (token0.address === WrapperAddress) {
        token0Contract = new ethers.Contract(
          token0.address,
          NativeWrapper,
          signer
        );
        token1Contract = new ethers.Contract(token1.address, ERC20, signer);
      }
      if (token1.address === WrapperAddress) {
        token0Contract = new ethers.Contract(token0.address, ERC20, signer);
        token1Contract = new ethers.Contract(
          token1.address,
          NativeWrapper,
          signer
        );
      }

      const token0Allowance = await token0Contract!.allowance(
        signerAddress,
        RouterAddress
      );
      const token1Allowance = await token1Contract!.allowance(
        signerAddress,
        RouterAddress
      );

      let caughtError = false;

      console.log(
        Number(ethers.formatEther(token0Allowance)),
        token0Input,
        Number(ethers.formatEther(token1Allowance)),
        token1Input
      );
      if (
        Number(ethers.formatEther(token0Allowance)) < token0Input &&
        Number(ethers.formatEther(token1Allowance)) < token1Input
      ) {
        const tx1 = await token0Contract!
          .approve(
            RouterAddress,
            ethers.parseUnits(String(token0Input), "ether")
          )
          .then(null, (error) => {
            caughtError = true;
            console.log(error);
          });
        const tx2 = await token1Contract!
          .approve(
            RouterAddress,
            ethers.parseUnits(String(token1Input), "ether")
          )
          .then(null, (error) => {
            caughtError = true;
            console.log(error);
          });

        await provider.waitForTransaction(tx1.hash);
        await provider.waitForTransaction(tx2.hash).finally(() => {
          if (caughtError === false) {
            setNeedsApproval(false);
          }
        });
      }

      if (
        Number(ethers.formatEther(token0Allowance)) < token0Input &&
        Number(ethers.formatEther(token1Allowance)) >= token1Input
      ) {
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

      if (
        Number(ethers.formatEther(token0Allowance)) >= token0Input &&
        Number(ethers.formatEther(token1Allowance)) < token1Input
      ) {
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

  const getBalance = async (tokenPathA?: string, tokenPathB?: string) => {
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
          tokenPathA !== undefined ? tokenPathA : token0.address,
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
          tokenPathB !== undefined ? tokenPathB : token1.address,
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
          token1Contract = new ethers.Contract(
            tokenPathB !== undefined ? tokenPathB : token1.address,
            ERC20,
            signer
          );
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
          token0Contract = new ethers.Contract(
            tokenPathA !== undefined ? tokenPathA : token0.address,
            ERC20,
            signer
          );
          const balance0 = await token0Contract
            .balanceOf(signerAddress)
            .then(null, (error) => console.log(error));
          setToken0Balance(Number(ethers.formatEther(balance0)));
        }

        const tokenIn =
          token0.address === "undefined"
            ? WrapperAddress
            : tokenPathA !== undefined
            ? tokenPathA
            : token0.address;
        const tokenOut =
          token1.address === "undefined"
            ? WrapperAddress
            : tokenPathB !== undefined
            ? tokenPathB
            : token1.address;
        const pairAddress = await factoryContract.getPair(tokenIn, tokenOut);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const search = async (query: string) => {
    const savedTokens = JSON.parse(localStorage.getItem("addedERC20Token")!);

    if (savedTokens !== null) {
      for (let i = 0; i < Object.keys(savedTokens).length; i++) {
        tokenList.push(savedTokens[i]);
      }
    }

    const newArray = tokenList.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    setCoinsForListing(newArray);

    const addressRegex = /^(0x)?[0-9a-fA-F]{40}$/;

    if (addressRegex.test(query)) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);

        const tokenContract = new ethers.Contract(query, ERC20, provider);

        const symbol0 = await tokenContract
          .symbol()
          .then(null, (error) => console.log(error));

        const name0 = await tokenContract
          .name()
          .then(null, (error) => console.log(error));

        const addition: Coin = {
          name: name0,
          symbol: symbol0,
          address: query,
          image: "",
          new: false,
        };

        const addition1: Coin = {
          name: name0,
          symbol: symbol0,
          address: query,
          image: "",
          new: true,
        };

        if (localStorage.getItem("addedERC20Token") === null) {
          setCoinsForListing([addition1]);
        }

        if (localStorage.getItem("addedERC20Token") !== null) {
          setCoinsForListing([addition]);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const addNewToken = (coin: Coin) => {
    if (localStorage.getItem("addedERC20Token") !== null) {
      const prevEntry = localStorage.getItem("addedERC20Token");
      const prevObject = JSON.parse(prevEntry!);
      for (let i = 0; i < Object.keys(prevObject).length; i++) {
        console.log(prevObject[i]["address"], coin.address);
        if (prevObject[i]["address"] === coin.address) {
          return;
        }
      }
      const nextIndex = Object.keys(prevObject).length + 1;
      prevObject[nextIndex] = {
        name: coin.name,
        symbol: coin.symbol,
        address: coin.address,
        image: coin.image,
        new: false,
      } as Coin;
      const updated = JSON.stringify(prevObject);
      localStorage.setItem("addedERC20Token", updated);
    }

    if (localStorage.getItem("addedERC20Token") === null) {
      const update: Coin = {
        name: coin.name,
        symbol: coin.symbol,
        address: coin.address,
        image: coin.image,
        new: false,
      };
      const newAddition = { 0: update };
      const updated = JSON.stringify(newAddition);

      localStorage.setItem("addedERC20Token", updated);
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
      return;
    }
    const PairContract = new ethers.Contract(
      await doesLPTokenExist,
      PairAbi,
      signer
    );

    const res = await PairContract.getReserves().then(null, (error) =>
      console.log(error)
    );
    setReserve0(Number(ethers.formatEther(res[0])));
    setReserve1(Number(ethers.formatEther(res[1])));

    const userPairBalance = Number(await PairContract.balanceOf(signerAddress));
    const totalSupplyOfPair = Number(await PairContract.totalSupply());
    const percentOfPool = (userPairBalance / totalSupplyOfPair) * 100;
    setPercentOfPool(percentOfPool);

    const reserveIn: bigint = res["reserve0"];
    const reserveOut: bigint = res["reserve1"];

    const token0InputAmount = ethers.parseUnits(String(token0Input), "ether");
    const numerator =
      token0InputAmount *
      ethers.toBigInt(1000) *
      (0 ===
      tokenIn
        .toLowerCase()
        .localeCompare([tokenIn, tokenOut].sort(compareHex)[0].toLowerCase())
        ? reserveOut
        : reserveIn);
    const denominator =
      (0 ===
      tokenIn
        .toLowerCase()
        .localeCompare([tokenIn, tokenOut].sort(compareHex)[0].toLowerCase())
        ? reserveIn
        : reserveOut) * ethers.toBigInt(1000);

    setToken1Input(Number(ethers.formatEther(numerator / denominator)));
    const toke1 = document.getElementById("token1Input") as HTMLInputElement;
    toke1.value = Number(ethers.formatEther(numerator / denominator)).toFixed(
      3
    );
  };

  const getNativeBalance = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();

    await provider.getBalance(signerAddress).then(
      (ret) =>
        setToken0Balance(Number(Number(ethers.formatEther(ret)).toFixed(3))),
      (error) => console.log(error)
    );
  };

  const path = usePathname().split("/");

  useEffect(() => {
    const token0Pth = path[3];
    const token1Pth = path[4];
    if (token0Pth === "null" && token1Pth === "null") {
      getBalance();
      return;
    } else {
      getBalance(token0Pth, token1Pth);
    }
  }, [token0.address, token1.address]);

  useEffect(() => {
    const savedTokens = JSON.parse(localStorage.getItem("addedERC20Token")!);

    if (savedTokens !== null) {
      for (let i = 0; i < Object.keys(savedTokens).length; i++) {
        tokenList.push(savedTokens[i]);
      }
      setCoinsForListing(tokenList);
    }
  }, [tokenList.length]);

  useEffect(() => {
    if (token0.address === "undefined") {
      getNativeBalance();
    }
  }, []);

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
                <Dialog.Panel className="w-full max-w-md transform rounded-xl bg-black border border-grey2 text-left align-middle shadow-xl transition-all">
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-6">
                      <h1 className="text-white">Select Token</h1>
                      <XMarkIcon
                        onClick={() => setIsOpen({ show: false, tokenNum: -1 })}
                        className="w-6 text-white cursor-pointer"
                      />
                    </div>
                    <MagnifyingGlassIcon
                      color="black"
                      className="w-5 absolute mt-[13px] ml-[14px]"
                    />
                    <input
                      className="border border-grey2 outline-none py-2.5 pl-12 rounded-lg w-full placeholder:text-grey placeholder:font-regular text-black"
                      placeholder="Search address"
                      value={inputVal}
                      onChange={(e) => {
                        setInputVal(e.target.value);
                        search(e.target.value);
                      }}
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
                          addToken={addNewToken}
                          key={index}
                        />
                      );
                    })}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <div className="flex flex-col md:max-w-[30vw] mx-auto bg-[#00AFE340] rounded-3xl mt-[3vh]">
        <div className="flex flex-row items-center justify-between p-[5%]">
          <Link href={"/liquidity"}>
            <ArrowSmallLeftIcon color="white" width="1vw" height="1vw" />
          </Link>
          <span className="text-white font-medium text-xl">Add Liquidity</span>
          <span className="question-container">
            <QuestionMarkCircleIcon color="white" width="1vw" height="1vw" />
            <div className="tooltip">
              You will not be able to add uneven amounts of liquidity.
            </div>
          </span>
        </div>
        <div className="border-[1px] border-[#86C7DB25] rounded-xl mx-[3%] p-[3%] text-white ">
          <div className="flex flex-row justify-between">
            <span>Input</span>
            <span key={token0.address}>Balance:{token0Balance}</span>
          </div>

          <div className="flex flex-row justify-between py-[.5vh]">
            <input
              onChange={(e) => {
                setToken0Input(Number(e.target.value));
                calcOutAmount();
              }}
              id="token0Input"
              type="number"
              className="text-3xl bg-transparent border-transparent w-1/2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="0.0"
            />
            <button
              onClick={() => setIsOpen({ show: true, tokenNum: 0 })}
              className="flex flex-row space-x-[.5vw] items-center bg-[#00DAAC30] rounded-xl px-2 py-[.2vh] max-w-[50%]"
            >
              {token0.image === "" ? (
                <QuestionMarkCircleIcon
                  color="white"
                  width="1vw"
                  height="1vw"
                />
              ) : (
                <img className="w-[1vw]" src={token0.image} />
              )}
              <p className="text-2xl font-medium truncate max-w-full text-ellipsis">
                {token0.name.toUpperCase()}
              </p>
              <ChevronDownIcon color="white" width="1vw" height="1vw" />
            </button>
          </div>
        </div>
        <span className="mx-auto text-white text-2xl my-[2vh]">+</span>

        <div className="border-[1px] border-[#86C7DB25] rounded-xl mx-[3%] p-[3%] text-white ">
          <div className="flex flex-row justify-between">
            <span>Input</span>
            <span key={token1.address}>
              {" "}
              {isSelected === true ? `Balance:${token1Balance}` : "-"}
            </span>
          </div>

          {isSelected === true ? (
            <div className="flex flex-row justify-between items-end py-[.5vh]">
              <input
                onChange={(e) => {
                  // calculateLPStats(1, e);
                  setToken1Input(Number(e.target.value));
                }}
                id="token1Input"
                type="number"
                className="text-3xl bg-transparent border-transparent w-1/2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0.0"
              />
              <button
                onClick={() => setIsOpen({ show: true, tokenNum: 1 })}
                className="flex flex-row space-x-[.5vw] items-center bg-[#00DAAC30] rounded-xl px-2 py-[.2vh] max-w-[50%]"
              >
                {token1.image === "" ? (
                  <QuestionMarkCircleIcon
                    color="white"
                    width="1vw"
                    height="1vw"
                  />
                ) : (
                  <img className="w-[1vw]" src={token1.image} />
                )}
                <p className="text-2xl font-medium  truncate max-w-full text-ellipsis ">
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
                className="text-3xl bg-transparent border-transparent w-1/2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0.0"
              />
              <button
                onClick={() => setIsOpen({ show: true, tokenNum: 1 })}
                className="flex flex-row space-x-[.5vw] items-center bg-[#00DAAC30] rounded-xl px-2 py-[.2vh]"
              >
                <p className="text-2xl font-normal">Select Token</p>
                <ChevronDownIcon color="white" width="1vw" height="1vw" />
              </button>
            </div>
          )}
        </div>
        {isSelected ? (
          <div className="border-[1px] border-[#86C7DB25] rounded-xl mx-[3%] text-white flex flex-col mt-[2vh] ">
            <span className="p-[3%]">Prices and pool share</span>
            <div className="border-[1px] border-[#86C7DB25] rounded-xl p-[3%] flex flex-row justify-between ">
              <span className="flex flex-col items-center w-1/3">
                <p>
                  {Number.isNaN(reserve0 / reserve1)
                    ? 0
                    : (reserve0 / reserve1).toFixed(3)}
                </p>
                <p>
                  {token0.symbol} per {token1.symbol}
                </p>
              </span>
              <span key={reserve0} className="flex flex-col items-center w-1/3">
                <p>
                  {Number.isNaN(reserve1 / reserve0)
                    ? 0
                    : (reserve1 / reserve0).toFixed(3)}
                </p>
                <p>
                  {token1.symbol} per {token0.symbol}
                </p>
              </span>

              <span className="flex flex-col items-center w-1/3">
                <p>{percentOfPool.toFixed(2)}%</p>
                <p>Share of Pool</p>
              </span>
            </div>
          </div>
        ) : null}
        {isSelected === false ? (
          <button className="mt-[2vh] mx-[3%] rounded-xl bg-[#888D9B] py-[2vh] mb-[2vh] font-medium text-[#3E4148]">
            {" "}
            Invalid pair
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
            className="mt-[2vh] mx-[3%] rounded-xl bg-[#00DAAC30] py-[2vh] mb-[2vh] font-medium text-[#00DAAC]"
          >
            {" "}
            Approve{" "}
          </button>
        ) : (
          <button
            onClick={() => supplyLiquidity()}
            className="mt-[2vh] mx-[3%] rounded-xl  bg-[#00DAAC30] py-[2vh] mb-[2vh] font-medium text-[#00DAAC] shadow shadow-lg"
          >
            {" "}
            Supply Liquidity
          </button>
        )}
      </div>
    </>
  );
}
