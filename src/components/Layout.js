import React from 'react';
import Header from './Header';
import Footer from './Footer';
import AIChatWidget from './AIChatWidget';
import { Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
    const location = useLocation();
    const isVideoCall = location.pathname.startsWith('/video-call/');

    return (
        <>
            <Header />
            <Outlet />
            {!isVideoCall && <Footer />}
            {!isVideoCall && <AIChatWidget />}
        </>
    );
}
