"use client";

import React, { Fragment, use, useEffect, useState } from "react";
import { ethers } from "ethers";
import { WrapperAddress } from "@/utils/constants";
import NativeWrapper from "@/abis/NativeWrapper.json";
import { ConfirmingToast } from "@/app/components/Toasts/Confirming";

export default function Wrap() {
  const [WrapperInput, setWrapperInput] = useState("0");
  const [unwrap, setUnwrap] = useState(false);
  const [wrappedBalance, setWrappedBalance] = useState("0");
  const [showToast, setShowToast] = useState("");
  const [toastTxnHash, setToastTxnHash] = useState("");
  const [isPopulated, setIsPopulated] = useState(false);

  const wrap = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const wrapperContract = new ethers.Contract(
      WrapperAddress,
      NativeWrapper,
      signer
    );

    const txn = await wrapperContract
      .deposit({ value: ethers.parseUnits(String(WrapperInput), "ether") })
      .catch((err) => {
        console.log(err);
      });
    setToastTxnHash(await txn.hash);
    setShowToast("confirm");
    await provider
      .waitForTransaction(txn.hash)
      .finally(async () => await balance());
  };

  const checkIsPopulated = async () => {
    if (WrapperInput.length === 0) {
      setIsPopulated(false);
      return;
    }
    if (Number(ethers.parseUnits(WrapperInput, "ether")) === 0) {
      setIsPopulated(false);
      return;
    }
    if (Number(ethers.parseUnits(WrapperInput, "ether")) > 0) {
      setIsPopulated(true);
      return;
    }
  };

  const unWrap = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const wrapperContract = new ethers.Contract(
      WrapperAddress,
      NativeWrapper,
      signer
    );

    const txn = await wrapperContract
      .withdraw(ethers.parseUnits(String(WrapperInput), "ether"))
      .catch((err) => {
        console.log(err);
      });
    setToastTxnHash(await txn.hash);
    setShowToast("confirm");
    await provider
      .waitForTransaction(txn.hash)
      .finally(async () => await balance());
  };

  const balance = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    const wrapperContract = new ethers.Contract(
      WrapperAddress,
      NativeWrapper,
      signer
    );

    const ret = await wrapperContract.balanceOf(signer.address).catch((err) => {
      console.log(err);
    });
    setWrappedBalance(String(ethers.formatEther(await ret)));
  };

  useEffect(() => {
    balance();
  }, []);

  useEffect(() => {
    checkIsPopulated();
  }, [Number(WrapperInput)]);
  return (
    <>
      <ConfirmingToast
        hash={toastTxnHash}
        key={showToast}
        isOpen={showToast}
        closeToast={(toast: string) => setShowToast(toast)}
      />

      <div className="flex flex-col box-border md:max-w-[20vw] mx-auto bg-[#00AFE340] rounded-3xl mt-[10vh] p-6">
        <span className="flex flex-col text-white mt-[2vh]">
          <span className="flex flex-row items-center text-white">
            <img className="w-[2vw] mr-[1vw]" src="/logo.svg" />
            <span className="flex flex-col text-white">
              <span>Balance: {wrappedBalance}</span>
              <span className="text-xl mr-[1vw]">Wrapped Sparq</span>
            </span>
          </span>

          <input
            id="wrappedInput"
            type="number"
            className="text-2xl mt-[2vh] text-white bg-transparent outline outline-white outline-[.5px] rounded-md p-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            placeholder="0.0"
            onChange={(e) => setWrapperInput(e.target.value)}
          />
        </span>
        <span className="text-white space-x-1 mt-[2vh]">
          <input
            className="accent-green-200"
            type="checkbox"
            id="unwrap"
            onChange={(e) => {
              setUnwrap(e.target.checked);
            }}
          />
          <label htmlFor="unwrap">Unwrap</label>
        </span>

        {!isPopulated ? (
          <button className="mt-[2vh] rounded-xl bg-[#888D9B] py-[2vh] mb-[2vh] font-medium text-lg text-[#3E4148]">
            {" "}
            Enter an amount to wrap
          </button>
        ) : (
          <button
            onClick={() => {
              if (unwrap) {
                unWrap();
                return;
              }
              wrap();
            }}
            className="mt-[2vh] rounded-xl  bg-[#00DAAC30] py-[2vh] mb-[2vh] font-medium text-[#00DAAC] shadow shadow-lg"
          >
            {" "}
            {unwrap ? "Unwrap" : "Wrap"}
          </button>
        )}
      </div>
    </>
  );
}
