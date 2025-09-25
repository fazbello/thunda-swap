import {
  AdjustmentsHorizontalIcon,
  ArrowDownIcon,
  ArrowSmallLeftIcon,
  ChevronDownIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import React from "react";

export default function addLiquidity() {
  return (
    <div className="flex flex-col md:max-w-[25vw] mx-auto bg-[#00AFE340] rounded-xl mt-[3vh]">
      <div className="flex flex-row items-center justify-between p-[5%]">
        <Link href={"/liquidity"}>
        <ArrowSmallLeftIcon color="white" width="1vw" height="1vw" />
        </Link>
        <span className="text-white">Add Liquidity</span>
        <QuestionMarkCircleIcon color="white" width="1vw" height="1vw" />
      </div>
      <div className="border-[.1px] rounded-xl mx-[3%] p-[3%] text-white ">
        <div className="flex flex-row justify-between">
          <span>Input</span>
          <span>Balance:0</span>
        </div>

        <div className="flex flex-row justify-between py-[.5vh]">
          <span className="text-3xl">0.0</span>
          <span className="flex flex-row space-x-[.5vw] items-center">
            <p>WSPARQ</p>
            <p>Wrapped AVAX</p>
          </span>
        </div>
      </div>
      <span className="mx-auto text-white text-2xl my-[2vh]">+</span>

      <div className="border-[.1px] rounded-xl mx-[3%] p-[3%] text-white ">
        <div className="flex flex-row justify-between">
          <span>Input</span>
          <span>Balance:0</span>
        </div>

        <div className="flex flex-row justify-between items-end py-[.5vh]">
          <span className="text-3xl">0.0</span>
          <span className="flex flex-row space-x-[.5vw] items-center bg-[#00DAAC30] rounded-xl px-2 py-[.2vh]">
            <img className="w-[1vw]" src="/logo.svg" />
            <p className="text-2xl font-semibold">SPARQ</p>
            <ChevronDownIcon color="white" width="1vw" height="1vw" />
          </span>
        </div>
      </div>
    </div>
  );
}
