import React, { Suspense } from 'react'
import DashboardPage from './page'
import { BarLoader } from 'react-spinners'

const DashboardLayout = () => {
    return (
        <div className='p-8'>
            <h1 className='text-6xl gradient-title font-bold mb-5'>
                Dashboard
            </h1>
            <Suspense fallback={<BarLoader className='mt-4' color="#6c47ff" width={'100%'} />}>
                <DashboardPage />
            </Suspense>
        </div>
    )
}

export default DashboardLayout