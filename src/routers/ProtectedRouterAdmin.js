import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function ProtectedRouterAdmin({ children }) {
    const isLogin = useSelector(state => state.authAdminReducer.isLogin)
    // console.log(isLogin);
    if (!isLogin) {
        return <Navigate to='/admin/login' ></Navigate>
    }

    return children
}
