import { Transition, Dialog } from "@headlessui/react";
import { Fragment, useEffect } from "react";
import { ethers } from "ethers";

export const ConfirmingToast = ({
  hash,
  isOpen,
  closeToast
}: {
  hash: string;
  isOpen: string;
  closeToast: (toastStatus:string) => void
}) => {
  const listenForTxn = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    console.log("listening for txn")
    console.log("hash: ", hash)
    if (!hash) { 
      closeToast("")
      return
    }
    const mined = await provider.waitForTransaction(hash);
    console.log(mined)
    closeToast("")
  };

  useEffect(() => {
    listenForTxn()
  }, []);
  return (
    <Transition appear key={isOpen} show={isOpen === "confirm"} as={Fragment}>
      <div className="flex p-4 text-center absolute right-20 bottom-20">
        <Transition.Child
          as={Fragment}
          enter="ease-in duration-1000 transform"
          enterFrom="opacity-0 -translate-x-[30vw]"
          enterTo="opacity-100 translate-x-0"
          leave="ease-out duration-1000 transform "
          leaveFrom="opacity-100  translate-x-0 "
          leaveTo="opacity-0 -translate-x-full"
        >
          <div className="p-5 bg-[#00DAAC40] h-[8vh] w-[24vh] bg-black transform rounded-xl bg-black border border-grey shadow-xl transition-all">
            <div className="flex justify-between flex-row h-full items-center">
              <span className="text-white">Transaction Pending</span>
              <span className="rounded-full bg-yellow-600 h-5 w-5 animate-pulse"></span>
            </div>
          </div>
        </Transition.Child>
      </div>
    </Transition>
  );
};
