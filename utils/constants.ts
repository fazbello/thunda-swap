
//Factory:
export const deployer = "0x00dEAD00665771855a34155f5e7405489df2C3C6"
export const factory_address = "0xE2651E2409D8479572cd1D59eE2e6B9B751deF79"

//Gold:
export const Gold = "0x5b41CEf7F46A4a147e31150c3c5fFD077e54d0e1"

//Silver:
export const Silver = "0x6D48fDFE009E309DD5c4E69DeC87365BFA0c8119"

//LP
export const PAIR_LP = "0x4aFf1a752E49017FC486E627426F887DDf948B2F"

//Router:
export const RouterAddress = "0x1073652AA8272A19EBF70832d4E3861aC1664F1A"
export const FaucetAddress = "0xfb207018effd6bed21fd8ef30c82295ff14ee187"

//WSPARQ:
export const WrapperAddress = "0x357872F740253583bAadBd7fAd7a192E0f3e22d9"
export const ContractManagerAddress = "0x0001cb47ea6d8b55fe44fdd6b1bdb579efb43e61"


export const compareHex = (a:string, b:string) => {
    const numA = parseInt(a, 16);
    const numB = parseInt(b, 16);
  
    if (numA < numB) {
      return -1;
    } else if (numA > numB) {
      return 1;
    } else {
      return 0;
    }
  }