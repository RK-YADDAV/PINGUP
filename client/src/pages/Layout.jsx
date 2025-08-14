import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { dummyUserData } from '../assets/assets'
import Loading from '../components/Loading'
import Sidebar from '../components/Sidebar' // Import your custom Sidebar component

const Layout = () => {
    const user = dummyUserData
    const [sidebarOpen, setSidebarOpen] = useState(false) // Changed to false to hide sidebar by default

    return user ? (
        <div className='w-full flex h-screen'>
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className='flex-1 bg-slate-50'>
                <Outlet />
            </div>
            {sidebarOpen ? 
                <X 
                    className='absolute top-3 right-3 p-2 z-50 bg-white rounded-md shadow w-10 h-10 text-gray-600 sm:hidden ' 
                    onClick={() => setSidebarOpen(false)} 
                />
             : 
                <Menu 
                    className='absolute top-3 left-3 p-2 z-50 bg-white rounded-md shadow-md w-10 h-10 text-gray-600 sm:hidden cursor-pointer'
                    onClick={() => setSidebarOpen(true)} 
                />
            }
        </div>
    ) : (
        <Loading/>
    )
}

export default Layout