import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function ProtectedLoginAdmin({ children }) {
    const isLogin = useSelector(state => state.authAdminReducer.isLogin)
    const loggedUser = useSelector(state => state.authAdminReducer.loggedUser)
    if (isLogin && (loggedUser.role_name === 'admin' || loggedUser.role_name === 'expert')) {
        return <Navigate to='/admin' ></Navigate>
    }

    return children;
}
