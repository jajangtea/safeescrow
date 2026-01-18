import { ethers } from "hardhat";

async function main() {
  const [deployer, seller] = await ethers.getSigners();
  
  console.log("Deploying contract with account:", deployer.address);

  // Ganti "Escrow" dengan nama contract yang ada di file .sol Anda
  const Escrow = await ethers.getContractFactory("Escrow");

  // Deploy dengan parameter constructor: (address_seller, address_developer)
  const escrow = await Escrow.deploy(
    seller.address,     // Menggunakan akun kedua sebagai seller untuk testing
    deployer.address,   // Developer (pengirim transaksi)
    { value: ethers.parseEther("0.01") } 
  );

  await escrow.waitForDeployment();

  console.log("Escrow deployed at:", await escrow.getAddress());
  console.log("Seller address used:", seller.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});