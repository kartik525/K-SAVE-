"use client"
import Link from 'next/link'
import React, { useEffect, useRef } from 'react'
import { Button } from './ui/button'
import Image from 'next/image'
import { el } from 'date-fns/locale'

const Hero = () => {
    const ImageRef = useRef(null)
    useEffect(() => {
        const imageElement: any = ImageRef.current;
        const handleScroll = () => {
            const scrollPosition = window.scrollY
            const scrollThreshold = 100
            if (scrollPosition > scrollThreshold) {
                imageElement.classList.add('scrolled')
            } else {
                imageElement.classList.remove('scrolled')
            }
        }
        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }

    }, [])
    return (
        <div className=' pb-20 px-4'>
            <div className='container mx-auto text-center '>
                <h1 className='text-5xl md:text-8xl  font-bold mb-4 gradient-title'>
                    Manage Your Finances <br /> Like a Pro
                </h1>
                <p className='text-xl text-gray-600 mb-2 max-w-2xl mx-auto'>
                    An AI-powered financial Management platform that helps you track, analyze, and optimize your finances.
                </p>
                <Link href={'/dashboard'}>
                    <Button size={'lg'} className='px-4 mt-4 cursor-pointer'>Get Started</Button>
                </Link>

            </div>
            <div className='hero-image-wrapper'>
                <div ref={ImageRef} className='hero-image'>
                    <Image src={'/banner.jpeg'} width={1280} height={720} alt='hero' className=' rounded-lg shadow-2xl mx-auto mt-8 border' />
                </div>
            </div>
        </div>
    )
}

export default Hero