import {
  CheckCircleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

export const SuccessToast = ({successDisplay, setSuccessDisplay, hash}:any) => {
  return (
    <div className="bg-black py-3 px-4 rounded-xl flex gap-x-5">
      <div>
        <div className="flex gap-x-2 pb-1">
          <CheckCircleIcon className="w-6 text-green-500" />
          <h1>Your Transaction was succesful</h1>
        </div>
        <a
          href={`https://goerli.arbiscan.io/tx/${hash}`}
          rel="noreferrer"
          target="_blank"
          className="text-xs text-blue-500 underline"
        >
          View on Block Explorer
        </a>
      </div>
      <XMarkIcon
        onClick={() => setSuccessDisplay(false)}
        className="w-6 text-gray-400 cursor-pointer"
      />
    </div>
  );
};
