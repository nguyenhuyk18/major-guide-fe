import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function ProtectedRouterAdmin({ children }) {
    const isLogin = useSelector(state => state.authAdminReducer.isLogin);
    const loggedUser = useSelector(state => state.authAdminReducer.loggedUser)
    // console.log(isLogin);
    if (!isLogin) {
        return <Navigate to='/admin/login' ></Navigate>
    }

    if (loggedUser.role_name !== 'expert' && loggedUser.role_name !== 'admin') {
        return <Navigate to='/admin/login' ></Navigate>
    }

    return children
}
