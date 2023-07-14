const hre = require("hardhat");

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  // Deploy the NFT Contract
  const nftContract = await hre.ethers.deployContract("DAONFT");
  await nftContract.waitForDeployment();
  console.log("DAONFT deployed to:", nftContract.target);

  // Deploy the Fake Marketplace Contract
  const NftMarketplaceContract = await hre.ethers.deployContract(
    "NFTMarketplace"
  );
  await NftMarketplaceContract.waitForDeployment();
  console.log(
    "NFTMarketplace deployed to:",
    NftMarketplaceContract.target
  );

  // Deploy the DAO Contract
  const amount = hre.ethers.parseEther("1"); // You can change this value from 1 ETH to something else
  const daoContract = await hre.ethers.deployContract("DevsDAO", [
    NftMarketplaceContract.target,
    nftContract.target,
  ], {value: amount,});
  await daoContract.waitForDeployment();
  console.log("DevsDAO deployed to:", daoContract.target);

  // Sleep for 30 seconds to let Etherscan catch up with the deployments
  await sleep(30 * 1000);

  // Verify the NFT Contract
  await hre.run("verify:verify", {
    address: nftContract.target,
    constructorArguments: [],
  });

  // Verify the Fake Marketplace Contract
  await hre.run("verify:verify", {
    address: NftMarketplaceContract.target,
    constructorArguments: [],
  });

  // Verify the DAO Contract
  await hre.run("verify:verify", {
    address: daoContract.target,
    constructorArguments: [
      NftMarketplaceContract.target,
      nftContract.target,
    ],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});