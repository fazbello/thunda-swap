import { create } from "zustand";

type Network = {
  chainId: number;
  name: string;
};

type SettingActions = {
  updateSlippage: (slippage: number) => void;
  updateNetwork: (network: Network) => void;
  updateConnection: (connection: boolean) => void;
  updateDeadline: (deadline: number) => void;
};

const initialSlippageState: number = 5;

const initialNetworkState: Network = {
  chainId: 0,
  name: "",
};

type State = {
  Slippage: number;
  Network: Network;
  Connection: boolean;
  Deadline: number;
};

type Contracts = {
  FactoryContract: string;
  RouterContract: string;
  WrappedContract: string;
};

type ContractUpdaters = {
  updateFactoryContract: (new_add: string) => void;
  updateRouterAddress: (new_add: string) => void;
  updateWrappedAddress: (new_add: string) => void;
};

export const useStore = create<State & SettingActions>((set) => ({
  Slippage: initialSlippageState,
  Network: initialNetworkState,
  Connection: false,
  Deadline: 10,
  updateSlippage: (newSlippage: number) =>
    set(() => ({
      Slippage: newSlippage,
    })),
  updateNetwork: (newNetwork: Network) => {
    set(() => ({
      Network: newNetwork,
    }));
  },
  updateConnection: (connectionStatus: boolean) => {
    set(() => ({
      Connection: connectionStatus,
    }));
  },
  updateDeadline: (newDeadline: number) => {
    set(() => ({
      Deadline: newDeadline,
    }));
  },
}));

export const useContracts = create<Contracts & ContractUpdaters>((set) => ({
  FactoryContract: "",
  RouterContract: "",
  WrappedContract: "",
  updateFactoryContract: (new_add: string) => {
    set(() => ({
      FactoryContract: new_add,
    }));
  },
  updateRouterAddress: (new_add: string) => {
    set(() => ({
      RouterContract: new_add,
    }));
  },
  updateWrappedAddress: (new_add: string) => {
    set(() => ({
      WrappedContract: new_add,
    }));
  },
}));
