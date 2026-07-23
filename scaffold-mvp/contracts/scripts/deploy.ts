import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // 1. RIUToken
  const RIUToken = await ethers.getContractFactory("RIUToken");
  const riuToken = await RIUToken.deploy();
  await riuToken.deployed();
  console.log("RIUToken:", riuToken.address);

  // 2. ImpactNFT
  const ImpactNFT = await ethers.getContractFactory("ImpactNFT");
  const impactNFT = await ImpactNFT.deploy();
  await impactNFT.deployed();
  console.log("ImpactNFT:", impactNFT.address);

  // 3. Anchor (existing)
  const Anchor = await ethers.getContractFactory("Anchor");
  const anchor = await Anchor.deploy();
  await anchor.deployed();
  console.log("Anchor:", anchor.address);

  // 4. SimpleDAO (existing)
  const SimpleDAO = await ethers.getContractFactory("SimpleDAO");
  const simpleDAO = await SimpleDAO.deploy();
  await simpleDAO.deployed();
  console.log("SimpleDAO:", simpleDAO.address);

  // 5. RIUMarketplace — requires a payment token address
  //    On testnet/mainnet, use real USDC. On local hardhat, deploy a mock.
  let paymentTokenAddress = process.env.PAYMENT_TOKEN_ADDRESS;
  if (!paymentTokenAddress) {
    // Deploy a second RIUToken as mock stablecoin for local testing
    const MockUSDC = await ethers.getContractFactory("RIUToken");
    const mockUSDC = await MockUSDC.deploy();
    await mockUSDC.deployed();
    paymentTokenAddress = mockUSDC.address;
    console.log("MockUSDC (local only):", paymentTokenAddress);
  }

  const RIUMarketplace = await ethers.getContractFactory("RIUMarketplace");
  const marketplace = await RIUMarketplace.deploy(
    riuToken.address,
    paymentTokenAddress,
    deployer.address // fee recipient
  );
  await marketplace.deployed();
  console.log("RIUMarketplace:", marketplace.address);

  // Authorize marketplace as RIU minter (for future automated minting flows)
  await riuToken.addMinter(marketplace.address);
  console.log("Marketplace authorized as RIU minter");

  // Authorize deployer as ImpactNFT minter
  await impactNFT.authorizeMinter(deployer.address);

  console.log("\n=== Deployment Summary ===");
  console.log(JSON.stringify({
    RIUToken: riuToken.address,
    ImpactNFT: impactNFT.address,
    Anchor: anchor.address,
    SimpleDAO: simpleDAO.address,
    RIUMarketplace: marketplace.address,
    PaymentToken: paymentTokenAddress,
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
