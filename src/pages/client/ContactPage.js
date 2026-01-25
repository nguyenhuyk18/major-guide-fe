import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import '../../assets/css/ContactPage.css';

export default function ContactPage() {
    const [submitStatus, setSubmitStatus] = useState(null);

    const formik = useFormik({
        initialValues: {
            name: '',
            email: '',
            subject: '',
            message: ''
        },
        validationSchema: Yup.object({
            name: Yup.string()
                .trim()
                .required('Vui lòng nhập họ tên'),
            email: Yup.string()
                .email('Email không hợp lệ')
                .required('Vui lòng nhập email'),
            subject: Yup.string()
                .trim()
                .required('Vui lòng nhập chủ đề'),
            message: Yup.string()
                .trim()
                .required('Vui lòng nhập nội dung tin nhắn')
                .min(10, 'Nội dung tin nhắn phải có ít nhất 10 ký tự')
        }),
        onSubmit: async values => {
            setSubmitStatus(null);

            try {
                // Simulate API call - replace with actual API endpoint
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Success case
                setSubmitStatus('success');
                formik.resetForm();
            } catch (error) {
                setSubmitStatus('error');
            }
        },
    });

    return (
        <div className="client-contact-page">
            {/* Page Header */}
            <section className="client-contact-hero">
                <div className="container">
                    <div className="client-contact-hero-content">
                        <h1 className="client-contact-title">Liên hệ với chúng tôi</h1>
                        <p className="client-contact-subtitle">
                            Chúng tôi luôn sẵn sàng hỗ trợ bạn. Hãy gửi tin nhắn cho chúng tôi
                            và đội ngũ chuyên gia sẽ phản hồi trong thời gian sớm nhất.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="client-contact-section">
                <div className="container">
                    <div className="row g-4">
                        {/* Google Map */}
                        <div className="col-12 col-lg-6">
                            <div className="client-contact-map-card">
                                <div className="client-contact-map" style={{ height: '100%' }}>
                                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3827.169255561422!2d106.61446247493328!3d10.809678989341101!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752bef54e763fb%3A0xf52f4f3e082c5946!2zMTUgxJDGsOG7nW5nIFQ2LCBUw6J5IFRo4bqhbmgsIFTDom4gUGjDuiwgVGjDoG5oIHBo4buRIEjhu5MgQ2jDrSBNaW5oLCBWaeG7h3QgTmFt!5e1!3m2!1svi!2s!4v1769052017153!5m2!1svi!2s" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />

                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="col-12 col-lg-6">
                            <div className="client-contact-card">
                                <div className="client-contact-card-header">
                                    <h3 className="client-contact-card-title">Gửi tin nhắn</h3>
                                    <p className="client-contact-card-subtitle">
                                        Điền thông tin vào form bên dưới để liên hệ với chúng tôi
                                    </p>
                                </div>

                                <form className="client-contact-form" onSubmit={formik.handleSubmit}>
                                    {/* Name Field */}
                                    <div className="client-form-group">
                                        <label className="client-form-label">
                                            Họ tên <span className="client-required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Nhập họ tên của bạn"
                                            name="name"
                                            value={formik.values.name}
                                            onChange={formik.handleChange}
                                        />
                                        <div className="text-danger mt-2">{formik.touched.name && formik.errors.name}</div>
                                    </div>

                                    {/* Email Field */}
                                    <div className="client-form-group">
                                        <label className="client-form-label">
                                            Email <span className="client-required">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            placeholder="example@email.com"
                                            name="email"
                                            value={formik.values.email}
                                            onChange={formik.handleChange}
                                        />
                                        <div className="text-danger mt-2">{formik.touched.email && formik.errors.email}</div>
                                    </div>

                                    {/* Subject Field */}
                                    <div className="client-form-group">
                                        <label className="client-form-label">
                                            Chủ đề <span className="client-required">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Nhập chủ đề tin nhắn"
                                            name="subject"
                                            value={formik.values.subject}
                                            onChange={formik.handleChange}
                                        />
                                        <div className="text-danger mt-2">{formik.touched.subject && formik.errors.subject}</div>
                                    </div>

                                    {/* Message Field */}
                                    <div className="client-form-group">
                                        <label className="client-form-label">
                                            Nội dung tin nhắn <span className="client-required">*</span>
                                        </label>
                                        <textarea
                                            className="form-control"
                                            placeholder="Nhập nội dung tin nhắn của bạn..."
                                            rows="6"
                                            name="message"
                                            value={formik.values.message}
                                            onChange={formik.handleChange}
                                        ></textarea>
                                        <div className="text-danger mt-2">{formik.touched.message && formik.errors.message}</div>
                                    </div>

                                    {/* Submit Button */}
                                    <div className="client-form-actions">
                                        <button
                                            type="submit"
                                            className="client-btn-submit"
                                        >
                                            <i className="bi bi-send me-2"></i>
                                            Gửi tin nhắn
                                        </button>
                                    </div>

                                    {/* Success/Error Messages */}
                                    {submitStatus === 'success' && (
                                        <div className="client-form-success">
                                            <i className="bi bi-check-circle me-2"></i>
                                            Tin nhắn của bạn đã được gửi thành công! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
                                        </div>
                                    )}

                                    {submitStatus === 'error' && (
                                        <div className="client-form-error">
                                            <i className="bi bi-exclamation-triangle me-2"></i>
                                            Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
