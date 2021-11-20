/// <reference types="react-scripts" />
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: "development" | "production" | "test";
    PUBLIC_URL_: string;
    REACT_APP_RPC_URL: string;
    REACT_APP_CHAIN_ID: string;
    REACT_APP_CONTRACT_ADDRESS: string;
  }
}
