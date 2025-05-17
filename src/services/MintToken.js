import * as ethers from "ethers";
import abi from "./abi/noteContractAbi.json" with { type: "json" };

export class MintTokenService {
    constructor() {
        this.name = "MintToken";
        this.provider = new ethers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545');
        this.signer = new ethers.Wallet(process.env.PRIVATE_KEY || "8ce91cb7e282d3ba0e658f4cee6ffe494c74cad1d40a61cc4fc5bee4ce9ae0b1", this.provider);
        this.contract = new ethers.Contract(process.env.CONTRACT_ADDRESS || "0x42D4083457186A9C0ebF7A457c5a4b67b71049d5", abi.abi, this.signer);
    }

    mintToken = async (tokenUri) => {
        try {
            console.log("Mint Token: ", tokenUri);
            
            // Send the transaction
            const tx = await this.contract.mintNote(tokenUri);
            console.log("Transaction hash:", tx.hash);
            
            // Wait for the transaction to be mined
            const receipt = await tx.wait();
            console.log("Transaction confirmed in block:", receipt.blockNumber);
            
            return tx.hash;
        } catch (error) {
            console.error("Error minting token:", error);
            throw error;
        }
    }
}
