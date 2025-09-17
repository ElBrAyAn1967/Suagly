'use client'

import { useState } from 'react'
import axios from 'axios'

interface WalletResult {
  success: boolean
  walletAddress: string
  privateKey: string
  balance: string
  message?: string
}

export default function NFCScanner() {
  const [scanning, setScanning] = useState(false)
  const [wallet, setWallet] = useState<WalletResult | null>(null)
  const [error, setError] = useState('')

  // Simulate NFC scan for demo (replace with real NFC later)
  const handleNFCScan = async () => {
    setScanning(true)
    setError('')
    
    try {
      // Generate demo NFC ID
      const nfcId = `demo-${Date.now()}`
      
      const response = await axios.post('/api/nfc-scan', {
        nfcId,
        chainId: 137, // Polygon by default
        eventName: "Swagly Demo Hackathon"
      })
      
      if (response.data.success) {
        setWallet(response.data)
      } else {
        setError(response.data.message || 'Failed to create wallet')
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Network error')
      console.error('NFC scan failed:', error)
    } finally {
      setScanning(false)
    }
  }

  if (wallet && wallet.success) {
    return <WalletSuccess wallet={wallet} />
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="container mx-auto max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          {/* NFC Icon */}
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-4xl">📱</span>
          </div>
          
          {/* Title */}
          <h1 className="text-3xl font-bold text-center text-foreground mb-4">
            Ready to Claim Your Trophy?
          </h1>
          
          {/* Description */}
          <p className="text-center text-muted-foreground mb-8">
            Tap the button below to simulate an NFC scan and create your instant builder profile
          </p>
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
          
          {/* Scan Button */}
          <button
            onClick={handleNFCScan}
            disabled={scanning}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 rounded-full font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {scanning ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Wallet...
              </span>
            ) : (
              'Simulate NFC Tap'
            )}
          </button>
          
          {/* Info */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            In production, this would detect your NFC tap automatically
          </p>
        </div>
      </div>
    </div>
  )
}

// Success component (placeholder)
function WalletSuccess({ wallet }: { wallet: WalletResult }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="container mx-auto max-w-md">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm text-center">
          <div className="w-20 h-20 bg-accent/20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">🏆</span>
          </div>
          
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Trophy Claimed!
          </h2>
          
          <p className="text-sm text-muted-foreground mb-4">
            Your instant wallet: {wallet.walletAddress.slice(0, 6)}...{wallet.walletAddress.slice(-4)}
          </p>
          
          <div className="bg-accent/10 p-4 rounded-lg mb-6">
            <p className="text-sm text-foreground">
              Balance: {wallet.balance}
            </p>
          </div>
          
          <button className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground py-3 rounded-full font-semibold mb-4">
            📱 Add to Apple Wallet
          </button>
          
          <button className="text-primary text-sm hover:underline">
            Want to keep your trophies forever?
          </button>
        </div>
      </div>
    </div>
  )
}