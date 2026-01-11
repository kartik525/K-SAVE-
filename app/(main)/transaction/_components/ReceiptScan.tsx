"use client"
import { scanReceipt } from '@/actions/transaction'
import { useFetch } from '@/app/hooks/useFetch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Camera, Loader } from 'lucide-react'
import React, { use, useEffect, useRef } from 'react'
import { toast } from 'sonner'

const ReceiptScan = ({ onScanComplete }: any) => {

    const fileRef = useRef<HTMLInputElement>(null)
    const { data: scanData, loading: scanReceiptLoading, error, fn: scanFn } = useFetch(scanReceipt)

    const handleReceiptScan = async (file: any) => {
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Image size should be less than 5MB")
            return
        }
        await scanFn(file)
    }

    useEffect(() => {
        if (scanData && !scanReceiptLoading) {
            onScanComplete(scanData)
            toast.success("Receipt Scanned Successfully")
        }

    }, [scanData, scanReceiptLoading])
    useEffect(() => {
        if (error) {
            toast.error(error?.message || "An error occurred")
        }
    }, [error])
    return (
        <div>
            <Input ref={fileRef} type="file" className='hidden' accept='image/*' capture="environment" onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                    handleReceiptScan(file)
                }

            }} />
            <Button className=' w-full h-10 bg-linear-to-br from-orange-500 via-pink-500 to-purple-500 animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white'
                onClick={() => {
                    fileRef.current?.click()
                }}
                disabled={scanReceiptLoading}
            >
                {scanReceiptLoading ? <><Loader className='mr-2 h-4 w-4 animate-spin' /><span>Scanning Image</span></> : <><Camera className='mr-2 h-4 w-4' />Scan Receipt With AI</>}</Button>
        </div>
    )
}

export default ReceiptScan