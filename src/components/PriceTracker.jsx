import React, { useState, useEffect } from "react";

const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";

// Cryptocurrency list with CoinGecko IDs
const CRYPTOCURRENCIES = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", emoji: "₿" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", emoji: "Ξ" },
  { id: "solana", symbol: "SOL", name: "Solana", emoji: "◎" },
  { id: "cardano", symbol: "ADA", name: "Cardano", emoji: "₳" },
  { id: "ripple", symbol: "XRP", name: "XRP", emoji: "✕" },
  { id: "polkadot", symbol: "DOT", name: "Polkadot", emoji: "●" },
  { id: "litecoin", symbol: "LTC", name: "Litecoin", emoji: "Ł" },
  { id: "chainlink", symbol: "LINK", name: "Chainlink", emoji: "🔗" },
  { id: "uniswap", symbol: "UNI", name: "Uniswap", emoji: "🦄" },
  { id: "aave", symbol: "AAVE", name: "Aave", emoji: "👻" },
  { id: "tether", symbol: "USDT", name: "Tether", emoji: "₮" },
  { id: "usd-coin", symbol: "USDC", name: "USDC", emoji: "💵" },
];

export default function PriceTracker() {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchPrices = async () => {
    setLoading(true);
    setError(null);

    try {
      const ids = CRYPTOCURRENCIES.map((c) => c.id).join(",");
      const url = `${COINGECKO_API_BASE}/simple/price?ids=${ids}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch prices from CoinGecko API");
      }

      const data = await response.json();
      setPrices(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching prices:", err);
      setError(err.message || "Failed to fetch cryptocurrency prices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch prices on component mount
    fetchPrices();

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchPrices, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price) => {
    if (!price) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(price);
  };

  const formatMarketCap = (marketCap) => {
    if (!marketCap) return "N/A";
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    }
    if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    }
    if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    }
    return formatPrice(marketCap);
  };

  const formatVolume = (volume) => {
    if (!volume) return "N/A";
    if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`;
    }
    if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`;
    }
    return formatPrice(volume);
  };

  const formatTime = (date) => {
    if (!date) return "";
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  if (error) {
    return (
      <div className="price-tracker">
        <div className="error">
          <strong>Error:</strong> {error}
        </div>
        <button className="refresh-btn" onClick={fetchPrices}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="price-tracker">
      <div className="tracker-header">
        <h2 className="tracker-title">Live Prices</h2>
        <button
          className={`refresh-btn ${loading ? "loading" : ""}`}
          onClick={fetchPrices}
          disabled={loading}
        >
          {loading ? "Updating..." : "Refresh"}
        </button>
      </div>

      {loading && Object.keys(prices).length === 0 ? (
        <div className="loading">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          <div className="price-grid">
            {CRYPTOCURRENCIES.map((crypto) => {
              const priceData = prices[crypto.id];
              const currentPrice = priceData?.usd || 0;
              const change24h = priceData?.usd_24h_change || 0;
              const marketCap = priceData?.usd_market_cap || 0;
              const volume24h = priceData?.usd_24h_vol || 0;

              return (
                <div key={crypto.id} className="price-card">
                  <div className="card-header">
                    <div className="card-icon">{crypto.emoji}</div>
                    <div className="card-name">
                      <div className="card-symbol">{crypto.symbol}</div>
                      <div className="card-full-name">{crypto.name}</div>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="price-row">
                      <span className="price-label">Price</span>
                      <span className="price-value">{formatPrice(currentPrice)}</span>
                    </div>

                    <div className="price-row">
                      <span className="price-label">24h Change</span>
                      <span
                        className={`price-change ${
                          change24h >= 0 ? "positive" : "negative"
                        }`}
                      >
                        <span className="price-change-arrow">
                          {change24h >= 0 ? "▲" : "▼"}
                        </span>
                        {Math.abs(change24h).toFixed(2)}%
                      </span>
                    </div>

                    <div className="price-row">
                      <span className="price-label">Market Cap</span>
                      <span className="price-value">{formatMarketCap(marketCap)}</span>
                    </div>

                    <div className="price-row">
                      <span className="price-label">24h Volume</span>
                      <span className="price-value">{formatVolume(volume24h)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {lastUpdated && (
            <div className="last-updated">
              Last updated: {formatTime(lastUpdated)}
            </div>
          )}
        </>
      )}
    </div>
  );
}
