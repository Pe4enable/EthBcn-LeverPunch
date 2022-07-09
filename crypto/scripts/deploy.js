const hre = require("hardhat");

async function main() {
  const TokenSymbol = "TKN";
  const TokenName = "Token";
  const signers = await hre.ethers.getSigners();

  console.log("Deploying implementation contract...");
  const TestNFT = await hre.ethers.getContractFactory("Test");
  const testNFT = await TestNFT.deploy();
  await testNFT.deployed();
  console.log("Implementation deployed to:", testNFT.address);
  
  console.log("Deploying proxy contract...");
  const Proxy = await hre.ethers.getContractFactory("TransparentUpgradeableProxy");
  const init = await testNFT.populateTransaction.__TestNFT_init(TokenName, TokenSymbol);
  const proxy = await Proxy.deploy(testNFT.address, signers[0].address, init.data);
  await proxy.deployed();
  console.log("Contract deployed to:", proxy.address);
  
  console.log("Delay before verification...");
  await new Promise(r => setTimeout(r, 60000));
  
  console.log("Done!");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
