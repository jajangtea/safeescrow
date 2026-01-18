import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const [buyer] = await ethers.getSigners();

  // Hubungkan ke kontrak yang sudah dideploy
  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = Escrow.attach(contractAddress) as any;

  console.log("Melepaskan dana ke Seller...");
  
  // Buyer memanggil fungsi releaseFunds
  const tx = await escrow.connect(buyer).releaseFunds();
  await tx.wait();

  console.log("Transaksi Berhasil! Dana telah dikirim ke Seller.");
  
  const isCompleted = await escrow.isCompleted();
  console.log("Status Escrow Selesai:", isCompleted);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});