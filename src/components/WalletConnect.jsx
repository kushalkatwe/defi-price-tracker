import React, { useState, useEffect } from "react";

export default function WalletConnect({
  connected,
  walletAddress,
  walletType,
  onConnect,
  onDisconnect,
}) {
  const [showMenu, setShowMenu] = useState(false);

  // Detect available wallets
  const hasMetaMask = () => {
    return typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask;
  };

  const hasPhantom = () => {
    return typeof window.phantom !== "undefined" && window.phantom.solana;
  };

  const hasSubwallet = () => {
    return typeof window.subwallet !== "undefined";
  };

  // Connect to MetaMask (EVM chains)
  const connectMetaMask = async () => {
    try {
      if (!hasMetaMask()) {
        alert("MetaMask is not installed. Please install it from https://metamask.io");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        onConnect(accounts[0], "MetaMask");
        setShowMenu(false);
      }
    } catch (error) {
      console.error("MetaMask connection error:", error);
      alert("Failed to connect to MetaMask: " + error.message);
    }
  };

  // Connect to Phantom (Solana)
  const connectPhantom = async () => {
    try {
      if (!hasPhantom()) {
        alert("Phantom is not installed. Please install it from https://phantom.app");
        return;
      }

      const response = await window.phantom.solana.connect();
      const publicKey = response.publicKey.toString();

      onConnect(publicKey, "Phantom");
      setShowMenu(false);
    } catch (error) {
      console.error("Phantom connection error:", error);
      alert("Failed to connect to Phantom: " + error.message);
    }
  };

  // Connect to Subwallet (Polkadot)
  const connectSubwallet = async () => {
    try {
      if (!hasSubwallet()) {
        alert("Subwallet is not installed. Please install it from https://www.subwallet.app");
        return;
      }

      const accounts = await window.subwallet.accounts.subscribe((accounts) => {
        if (accounts && accounts.length > 0) {
          const address = accounts[0].address;
          onConnect(address, "Subwallet");
          setShowMenu(false);
        }
      });
    } catch (error) {
      console.error("Subwallet connection error:", error);
      alert("Failed to connect to Subwallet: " + error.message);
    }
  };

  // Disconnect wallet
  const handleDisconnect = () => {
    onDisconnect();
    setShowMenu(false);
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return "";
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <div className="wallet-connect">
      {connected ? (
        <div className="wallet-status">
          <div className="wallet-status-dot"></div>
          <div>
            <div className="wallet-address">{formatAddress(walletAddress)}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {walletType}
            </div>
          </div>
          <button
            className="wallet-btn"
            onClick={handleDisconnect}
            style={{ marginLeft: "auto" }}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="wallet-buttons">
          {hasMetaMask() && (
            <button className="wallet-btn" onClick={connectMetaMask}>
              MetaMask
            </button>
          )}
          {hasPhantom() && (
            <button className="wallet-btn" onClick={connectPhantom}>
              Phantom
            </button>
          )}
          {hasSubwallet() && (
            <button className="wallet-btn" onClick={connectSubwallet}>
              Subwallet
            </button>
          )}
          {!hasMetaMask() && !hasPhantom() && !hasSubwallet() && (
            <button className="wallet-btn" disabled style={{ opacity: 0.5 }}>
              No Wallets Found
            </button>
          )}
        </div>
      )}
    </div>
  );
}
