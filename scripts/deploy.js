const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment to Sepolia...\n");

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Deploy MinimalForwarder
  console.log("📦 Deploying MinimalForwarder...");
  const MinimalForwarder = await hre.ethers.getContractFactory("MinimalForwarder");
  const forwarder = await MinimalForwarder.deploy();
  await forwarder.waitForDeployment();
  const forwarderAddress = await forwarder.getAddress();
  console.log("✅ MinimalForwarder deployed to:", forwarderAddress);
  console.log("⏳ Waiting for block confirmations...\n");
  await forwarder.deploymentTransaction().wait(5);

  // Deploy BlockchainWhatsApp
  console.log("📦 Deploying BlockchainWhatsApp...");
  const BlockchainWhatsApp = await hre.ethers.getContractFactory("BlockchainWhatsApp");
  const whatsapp = await BlockchainWhatsApp.deploy(forwarderAddress);
  await whatsapp.waitForDeployment();
  const whatsappAddress = await whatsapp.getAddress();
  console.log("✅ BlockchainWhatsApp deployed to:", whatsappAddress);
  console.log("⏳ Waiting for block confirmations...\n");
  await whatsapp.deploymentTransaction().wait(5);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    contracts: {
      MinimalForwarder: forwarderAddress,
      BlockchainWhatsApp: whatsappAddress
    },
    timestamp: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  // Save to frontend config
  const configDir = path.join(__dirname, "../frontend/src/config");
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(configDir, "contracts.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  // Save ABIs
  const forwarderArtifact = await hre.artifacts.readArtifact("MinimalForwarder");
  const whatsappArtifact = await hre.artifacts.readArtifact("BlockchainWhatsApp");

  fs.writeFileSync(
    path.join(configDir, "MinimalForwarder.json"),
    JSON.stringify(forwarderArtifact.abi, null, 2)
  );

  fs.writeFileSync(
    path.join(configDir, "BlockchainWhatsApp.json"),
    JSON.stringify(whatsappArtifact.abi, null, 2)
  );

  console.log("\n📄 Deployment Summary:");
  console.log("═".repeat(60));
  console.log(`Network:              ${hre.network.name}`);
  console.log(`Chain ID:             ${deploymentInfo.chainId}`);
  console.log(`MinimalForwarder:     ${forwarderAddress}`);
  console.log(`BlockchainWhatsApp:   ${whatsappAddress}`);
  console.log("═".repeat(60));

  console.log("\n💾 Configuration saved to frontend/src/config/");
  console.log("\n🔍 Verify contracts on Etherscan:");
  console.log(`npx hardhat verify --network sepolia ${forwarderAddress}`);
  console.log(`npx hardhat verify --network sepolia ${whatsappAddress} ${forwarderAddress}`);

  console.log("\n✨ Deployment completed successfully!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
