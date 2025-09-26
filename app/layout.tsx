// ... imports and state setup remain unchanged

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
  wallet: { address: string; nativeBalance: string };
}) {
  // ... state hooks

  // Remove or comment out the checkNetwork function entirely
  // const checkNetwork = async () => {
  //   if (window.ethereum) {
  //     try {
  //       await window.ethereum.request({
  //         method: "wallet_switchEthereumChain",
  //         params: [{ chainId: "0xC5490" }],
  //       });
  //       setNetwork("Orbiter");
  //       updateNetwork("Orbiter");
  //     } catch (switchError: any) {
  //       if (switchError.code === 4902) {
  //         setNetwork("Wrong Network");
  //         try {
  //           const number = 808080;
  //           const hexadecimalString = "0x" + number.toString(16).toLowerCase();
  //           await window.ethereum.request({
  //             method: "wallet_addEthereumChain",
  //             params: [
  //               {
  //                 chainId: hexadecimalString,
  //                 // ...rest of params
  //               },
  //             ],
  //           });
  //         } catch (addError: any) {
  //           // handle error
  //         }
  //       }
  //     }
  //   }
  // };

  // Make sure you don't call checkNetwork on wallet connect or in useEffect

  // Remove any UI that checks for "Wrong Network" or a specific network and blocks access
  // For example:
  // if (network === "Wrong Network") {
  //   return <div>Please change to the Orbiter Dex Chain to continue.</div>;
  // }

  // Render your app normally:
  return (
    <>
      {/* ...your layout and navigation */}
      {children}
    </>
  );
}
