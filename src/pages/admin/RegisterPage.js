// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
import '../../assets/css/RegisterAdmin.css'
import RegisterScheduleAdmin from '../../components/RegisterScheduleAdmin';

export default function RegisterPage() {

    return (

        <div className="register-page">
            {/* Header Section */}
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="page-title mb-2">Lịch đăng ký tư vấn</h2>
                </div>
            </div>


            {/* Calendar Grid */}
            <RegisterScheduleAdmin />


        </div>

    );
}
