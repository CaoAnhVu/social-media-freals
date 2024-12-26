import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ChakraProvider } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import { extendTheme } from "@chakra-ui/theme-utils";
import { ColorModeScript } from "@chakra-ui/color-mode";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { SocketContextProvider } from "./context/SocketContext";

// Global styles configuration
const styles = {
  global: (props) => ({
    body: {
      color: mode("gray.800", "whiteAlpha.900")(props),
      bg: mode("gray.100", "#101010")(props),
      fontFamily: "Segoe UI, Noto Emoji, Arial, sans-serif",
    },
  }),
};

// Chakra theme configuration
const config = {
  initialColorMode: "dark",
  useSystemColorMode: true,
};

// Custom color configurations
const colors = {
  gray: {
    light: "#616161", // Lighter gray for light mode
    dark: "#1e1e1e", // Darker gray for dark mode
  },
};

// Extend the theme with custom settings
const theme = extendTheme({ config, styles, colors });

// Render the application with Chakra, routing, and recoil
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RecoilRoot>
      <BrowserRouter>
        <ChakraProvider theme={theme}>
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <SocketContextProvider>
            <App />
          </SocketContextProvider>
        </ChakraProvider>
      </BrowserRouter>
    </RecoilRoot>
  </React.StrictMode>
);
