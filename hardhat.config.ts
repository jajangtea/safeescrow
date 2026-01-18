import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv"; // Import library dotenv

dotenv.config();
const config: HardhatUserConfig = {
  solidity: "0.8.24",
 networks: {
  amoy: {
    url: process.env.POLYGON_AMOY_RPC_URL,
    accounts: [process.env.PRIVATE_KEY] 
  }
}
};

export default config;  

