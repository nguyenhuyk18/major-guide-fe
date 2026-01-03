import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function ProtectedLoginAdmin({ children }) {
    const isLogin = useSelector(state => state.authAdminReducer.isLogin)

    if (isLogin) {
        return <Navigate to='/admin' ></Navigate>
    }

    return children
}
