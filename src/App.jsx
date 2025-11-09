import React, { useState, useEffect } from "react";
import "./App.css";
import PriceTracker from "./components/PriceTracker";
import WalletConnect from "./components/WalletConnect";

export default function App() {
  const [connected, setConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [walletType, setWalletType] = useState("");

  const handleWalletConnect = (address, type) => {
    setWalletAddress(address);
    setWalletType(type);
    setConnected(true);
  };

  const handleWalletDisconnect = () => {
    setWalletAddress("");
    setWalletType("");
    setConnected(false);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">De-Fi Price Tracker</h1>
          <p className="app-subtitle">Live Cryptocurrency Prices</p>
        </div>
        <WalletConnect
          connected={connected}
          walletAddress={walletAddress}
          walletType={walletType}
          onConnect={handleWalletConnect}
          onDisconnect={handleWalletDisconnect}
        />
      </header>

      <main className="app-main">
        <PriceTracker />
      </main>

      <footer className="app-footer">
        <p>&copy; 2025 De-Fi Price Tracker. Powered by CoinGecko API.</p>
      </footer>
    </div>
  );
}
