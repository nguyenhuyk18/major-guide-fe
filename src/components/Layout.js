import React from 'react';
import Header from './Header';
import Footer from './Footer';
import AIChatWidget from './AIChatWidget';
import { Outlet } from 'react-router-dom';

export default function Layout() {
    return (
        <>
            <Header />
            <Outlet />
            <Footer />
            <AIChatWidget />
        </>
    );
}
