require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 300  // Optimiza para reducir costo de gas
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    polygonAmoy: {
      url: "https://rpc-amoy.polygon.technology",
      accounts: ["4fa281947a1fb44ccc621101a0ff1d819ddf793e7368cf46dca27885fa84bd52"],
      chainId: 80002,
      gasPrice: 30000000000, // 30 gwei - más económico
      gas: 4000000 // Límite más bajo
    }
  }
};