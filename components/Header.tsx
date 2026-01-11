import React from 'react'
import {
    ClerkProvider,
    SignInButton,
    SignUpButton,
    SignedIn,
    SignedOut,
    UserButton,
} from '@clerk/nextjs'
import Link from 'next/link'
import { Button } from './ui/button'
import { LayoutDashboard, PenBox } from 'lucide-react'
import { checkUser } from '@/lib/checkUser'

const Header = async () => {
    await checkUser()
    return (
        <div className=' fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b'>

            <nav className=' container mx-auto flex items-center justify-between p-4'>
                <Link href='/'>
                    <h1 className='text-2xl font-bold text-red-700'>K<span className='gradient-title'>-Save</span></h1>
                </Link>
                <div className='flex items-center space-x-2'>
                    <SignedIn>
                        <Link href={'/dashboard'}>
                            <Button variant={'outline'}>
                                <LayoutDashboard className='mr-2 h-4 w-4' />
                                <span className='hidden md:inline'>Dashboard</span>
                            </Button>
                        </Link>
                        <Link href={'/transaction/create'}>
                            <Button variant={'default'}>
                                <PenBox className='mr-2 h-4 w-4' />
                                <span className='hidden md:inline'>Add Transaction</span>
                            </Button>
                        </Link>
                    </SignedIn>
                    <SignedOut>
                        <SignInButton forceRedirectUrl={'/dashboard'}>
                            <Button variant={'outline'}>Sign In</Button>
                        </SignInButton>
                        {/* <SignUpButton>
                        <button className="bg-[#6c47ff] text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                            Sign Up
                        </button>
                    </SignUpButton> */}
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>

                </div>


            </nav>
        </div>
    )
}

export default Header