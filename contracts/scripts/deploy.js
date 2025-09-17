const hre = require("hardhat");

async function main() {
  try {
    console.log("Deploying simple SwagToken...");
    
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deployer:", deployer.address);
    
    const SwagToken = await hre.ethers.getContractFactory("SwagToken");
    const swagToken = await SwagToken.deploy();
    
    console.log("Waiting for deployment...");
    await swagToken.deployed();
    
    console.log("SUCCESS!");
    console.log("SwagToken deployed to:", swagToken.address);
    console.log("SWAG_TOKEN_CONTRACT_ADDRESS=" + swagToken.address);
    
  } catch (error) {
    console.error("Deploy failed:", error.message);
  }
}

main();