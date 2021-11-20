import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Grommet } from "grommet";
import { Web3ReactProvider } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30,
    },
  },
});

ReactDOM.render(
  <React.StrictMode>
    <Web3ReactProvider getLibrary={(provider) => new Web3Provider(provider)}>
      <QueryClientProvider client={queryClient}>
        <Grommet
          theme={{
            global: {
              colors: {
                brand: {
                  dark: "#2E4C6D",
                  light: "#396EB0",
                },
              },
              font: {
                family: "Oxygen",
              },
            },
          }}
        >
          <App />
        </Grommet>

        <ReactQueryDevtools />
      </QueryClientProvider>
    </Web3ReactProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
