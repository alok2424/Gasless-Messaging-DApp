const express = require('express');
const { ethers } = require('ethers');
const cors = require('cors');
const path = require('path');

// Load .env from parent directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Load contract ABIs
const MinimalForwarderABI = require('../frontend/src/config/MinimalForwarder.json');
const contractsConfig = require('../frontend/src/config/contracts.json');

// Setup provider and signer (YOUR wallet that pays gas)
const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const relayerWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const forwarder = new ethers.Contract(
  contractsConfig.contracts.MinimalForwarder,
  MinimalForwarderABI,
  relayerWallet
);

console.log('🚀 Relayer Service Started');
console.log('📝 Relayer Address:', relayerWallet.address);
console.log('💰 Paying gas for all users!\n');

// Endpoint to relay gasless transactions
app.post('/relay', async (req, res) => {
  try {
    const { request, signature } = req.body;

    console.log('📨 Received relay request from:', request.from);

    // Verify the signature
    const valid = await forwarder.verify(request, signature);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid signature' });
    }

    console.log('✅ Signature verified');
    console.log('⚡ Executing transaction (YOU pay gas)...');

    // Execute the transaction (YOU pay the gas!)
    const tx = await forwarder.execute(request, signature);
    const receipt = await tx.wait();

    console.log('✅ Transaction executed!');
    console.log('📝 TX Hash:', receipt.hash);
    console.log('💸 Gas used:', receipt.gasUsed.toString());
    console.log('💰 You paid the gas, user paid NOTHING!\n');

    res.json({
      success: true,
      txHash: receipt.hash,
      gasUsed: receipt.gasUsed.toString(),
    });
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', relayer: relayerWallet.address });
});

// Check relayer balance
app.get('/balance', async (req, res) => {
  const balance = await provider.getBalance(relayerWallet.address);
  res.json({
    address: relayerWallet.address,
    balance: ethers.formatEther(balance),
  });
});

const PORT = process.env.RELAYER_PORT || 4001;
app.listen(PORT, () => {
  console.log(`🎯 Relayer listening on http://localhost:${PORT}`);
  console.log(`📡 Frontend should send signed transactions to /relay endpoint\n`);
});
