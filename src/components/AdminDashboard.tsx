'use client'
import axios from 'axios';
import React, { useEffect, useState } from 'react'

const AdminDashboard = () => {
    const [loading, setLoading] = useState(false);

    const handleGetData = async () => {
        try {
            const { data } = await axios.get("/api/admin/dashboard");
            console.log(data);
        } catch (error) {
            console.log(error)
        }
    }
    useEffect(() => {
        handleGetData();
    }, [])
    return (
        <div className='min-h-screen bg-linear-to-br from-gray-100 to-gray-200'>AdminDashboard</div>
    )
}

export default AdminDashboard