import { ethers } from 'ethers'

export const SWAG_TOKEN_ADDRESS = process.env.SWAG_TOKEN_CONTRACT_ADDRESS!
export const POLYGON_AMOY_RPC = process.env.POLYGON_AMOY_RPC || "https://rpc-amoy.polygon.technology"

export const SWAG_TOKEN_ABI = [
  "function mintToUser(address recipient) external",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)"
]

export function getSwagTokenContract(signer: ethers.Signer) {
  return new ethers.Contract(SWAG_TOKEN_ADDRESS, SWAG_TOKEN_ABI, signer)
}