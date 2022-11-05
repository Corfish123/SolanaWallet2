// Coinbase Wallet Provider
export const getCoinbaseWalletProvider = () => {
  if ("coinbaseSolana" in window) {
    return window.coinbaseSolana;
  }
  // Redirect user if Coinbase Wallet isn’t installed
  window.open("https://www.coinbase.com/wallet", "_blank");
};

// Phantom Provider
export const getPhantomProvider = () => {
  if ("phantom" in window) {
    const provider = window.phantom?.solana;

    if (provider?.isPhantom) {
      return provider;
    }
  }

  window.open("https://phantom.app/", "_blank");
};
