import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'

// Contract configuration
const SWAG_TOKEN_ADDRESS = "0x83dFA2D731C2E6002fC4dE42DC6be302EC65Dbc2"
const POLYGON_AMOY_RPC = "https://rpc-amoy.polygon.technology"
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY || process.env.PRIVATE_KEY

// SwagToken ABI
const SWAG_TOKEN_ABI = [
  "function mintToUser(address recipient) external",
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function owner() view returns (address)"
]

// In-memory NFC registry (in production, use database like Vercel KV)
const nfcRegistry = new Map<string, {
  walletAddress: string
  claimedChains: number[]
  timestamp: number
  privateKey: string
}>()

// Generate deterministic wallet from NFC ID
function generateTempWallet(nfcId: string, chainId: number) {
  const seed = ethers.utils.keccak256(
    ethers.utils.solidityPack(['string', 'uint256'], [nfcId, chainId])
  )
  return new ethers.Wallet(seed)
}

// Real blockchain transaction - Mint SWAG tokens
async function mintSwagTokens(walletAddress: string) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(POLYGON_AMOY_RPC)
    const relayerWallet = new ethers.Wallet(RELAYER_PRIVATE_KEY!, provider)
    
    const swagContract = new ethers.Contract(SWAG_TOKEN_ADDRESS, SWAG_TOKEN_ABI, relayerWallet)
    
    console.log(`Minting 100 SWAG tokens to ${walletAddress}`)
    
    const tx = await swagContract.mintToUser(walletAddress, {
      gasLimit: 200000,
      gasPrice: ethers.utils.parseUnits('30', 'gwei')
    })
    
    console.log(`Transaction sent: ${tx.hash}`)
    const receipt = await tx.wait()
    
    return { 
      hash: receipt.transactionHash,
      success: true 
    }
  } catch (error) {
    console.error('Mint SWAG tokens failed:', error)
    return { 
      hash: null, 
      success: false, 
      error: (error as Error).message 
    }
  }
}

// Mock functions (still mock for trophy and gas)
async function mockMintTrophy(walletAddress: string, eventName: string, chainId: number) {
  await new Promise(resolve => setTimeout(resolve, 1000))
  console.log(`Minting trophy for ${walletAddress} on chain ${chainId}`)
  return { hash: '0x' + Math.random().toString(16).substr(2, 64) }
}

async function mockTransferGas(walletAddress: string, amount: string) {
  await new Promise(resolve => setTimeout(resolve, 300))
  console.log(`Transferring ${amount} POL to ${walletAddress}`)
  return { hash: '0x' + Math.random().toString(16).substr(2, 64) }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nfcId, chainId = 80002, eventName = "Swagly Demo" } = body // Chain ID para Amoy

    if (!nfcId) {
      return NextResponse.json({ error: 'NFC ID is required' }, { status: 400 })
    }

    // Check if already claimed
    if (nfcRegistry.has(nfcId)) {
      const existing = nfcRegistry.get(nfcId)
      return NextResponse.json({
        success: false,
        walletAddress: existing?.walletAddress,
        message: "NFC already claimed. Showing existing wallet.",
        balance: "100 SWAG + 0.01 POL"
      })
    }

    // Generate temporary wallet
    const tempWallet = generateTempWallet(nfcId, chainId)
    
    console.log(`Creating wallet for NFC ID: ${nfcId}`)
    console.log(`Generated wallet: ${tempWallet.address}`)

    // Execute transactions - mix of real and mock
    const results = await Promise.allSettled([
      mockMintTrophy(tempWallet.address, eventName, chainId),
      mintSwagTokens(tempWallet.address), // Real blockchain transaction
      mockTransferGas(tempWallet.address, "0.01")
    ])

    // Check if SWAG minting was successful
    const swagResult = results[1]
    const swagSuccess = swagResult.status === 'fulfilled' && swagResult.value.success

    // Register NFC as claimed
    nfcRegistry.set(nfcId, {
      walletAddress: tempWallet.address,
      claimedChains: [chainId],
      timestamp: Date.now(),
      privateKey: tempWallet.privateKey
    })

    // Return success response
    return NextResponse.json({
      success: true,
      walletAddress: tempWallet.address,
      privateKey: tempWallet.privateKey, // For migration later
      balance: swagSuccess ? "100 SWAG + 0.01 POL" : "0 SWAG + 0.01 POL (mint failed)",
      chainId,
      eventName,
      message: swagSuccess ? "Trophy and tokens claimed successfully!" : "Trophy claimed, but token mint failed",
      swagMintHash: swagResult.status === 'fulfilled' ? swagResult.value.hash : null,
      transactions: {
        trophy: results[0].status === 'fulfilled' ? results[0].value.hash : null,
        swag: swagResult.status === 'fulfilled' ? swagResult.value.hash : null,
        gas: results[2].status === 'fulfilled' ? results[2].value.hash : null
      }
    })

  } catch (error: any) {
    console.error('NFC scan error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle GET requests (for testing)
export async function GET() {
  return NextResponse.json({
    message: 'Swagly NFC API is running',
    registeredNFCs: nfcRegistry.size,
    swagTokenContract: SWAG_TOKEN_ADDRESS,
    network: 'Polygon Amoy Testnet'
  })
}