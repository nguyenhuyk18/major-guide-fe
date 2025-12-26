// import React from 'react';
import '../assets/css/Loading.css'
export default function Loading() {
    return (
        <div class="loading-container">
            <div class="spinner" style={{ margin: 'auto' }} >
                <div class="spinner-inner"></div>
                <div class="spinner-dot"></div>
            </div>
            <div class="loading-text">Đang tải...</div>
        </div>
    );
}
