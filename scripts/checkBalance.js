const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("\n💰 Checking Deployer Wallet Balance...\n");
  console.log("═".repeat(60));
  console.log("Address:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const balanceInEth = hre.ethers.formatEther(balance);

  console.log("Balance:", balanceInEth, "ETH");
  console.log("═".repeat(60));

  // Warning if balance is low
  if (parseFloat(balanceInEth) < 0.05) {
    console.log("\n⚠️  WARNING: Balance is low!");
    console.log("Get more Sepolia ETH from:");
    console.log("- https://sepoliafaucet.com/");
    console.log("- https://www.infura.io/faucet/sepolia");
  } else {
    console.log("\n✅ Balance is sufficient for testing");
  }

  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
