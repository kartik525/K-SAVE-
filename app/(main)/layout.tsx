import React from 'react'

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className='container mt-28'>{children}</div>
    )
}

export default MainLayout