import React, { useEffect, useState } from 'react';
import '../../../assets/css/CreateExpert.css'
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { getProvinceList, getWardByIdProvince } from '../../../services/user-access.api';
import { toast } from 'react-toastify';
import { createExpert } from '../../../services/authorizer.api';
import { Link, useNavigate } from 'react-router-dom';

export default function CreateExpert() {
    const navigate = useNavigate();

    const [provinceList, setProvinceList] = useState([]);
    const [wardList, setWardList] = useState([]);

    useEffect(() => {
        getProvince()
    }, [])

    const getProvince = async () => {
        try {
            const rs = await getProvinceList();
            setProvinceList(rs.data.data);
        } catch (error) {
            console.log(error);
            toast.error('Lỗi đã xảy ra !!');
        }
    }

    // const handleOnchangeProvince = async (e, formik) => {

    // }
    const formik = useFormik({
        // Khởi động giá trị cho thẻ nhập liệu
        initialValues: {
            lastname: '',
            firstname: '',
            email: '',
            sex: '',
            major: '',
            level: '',
            teachAt: '',
            information: '',
            username: '',
            password: '123',
            statusAccount: '',
            province_id: '',
            ward_id: '',
            price: 0
        },
        // Kiểm tra dữ liệu hợp lệ không
        validationSchema: Yup.object({
            lastname: Yup.string().required('Vui lòng nhập họ của chuyên gia !!'),
            firstname: Yup.string().required('Vui lòng nhập tên của chuyên gia !!'),
            email: Yup.string().email('Email không hợp lệ').required('Vui lòng nhập email !!'),
            sex: Yup.string().required('Vui lòng chọn giới tính !!'),
            major: Yup.string().required('Vui lòng nhập lĩnh vực chuyên môn !!'),
            level: Yup.string().required('Vui lòng chọn trình độ học vấn !!'),
            username: Yup.string().required('Vui lòng nhập tên đăng nhập !!'),
            statusAccount: Yup.string().required('Vui lòng chọn trạng thái hoạt động !!'),
            teachAt: Yup.string().required('Vui lòng nhập nơi giảng dạy , công tác !!'),
            information: Yup.string().required('Vui lòng nhập thông tin mô tả !!'),
            province_id: Yup.string().required('Vui lòng chọn tỉnh thành !!'),
            ward_id: Yup.string().required('Vui lòng chọn phường !!'),
            price: Yup.number().required('Vui lòng nhập giá tiền thuê !!')
        }),

        onSubmit: async values => {
            // console.log(values);
            const newData = {
                username: values.username,
                lastname: values.lastname,
                firstname: values.firstname,
                email: values.email,
                password: values.password,
                ward_id: values.ward_id,
                role_name: "expert",
                expertProfile: {
                    teachAt: values.teachAt,
                    information: values.information,
                    major: values.major,
                    level: values.level,
                    price: values.price
                },
                sex: values.sex,
                statusAccount: values.statusAccount,
            }

            try {
                await createExpert(newData);
                navigate('/admin/experts');
                toast.success('Đã thêm chuyên gia thành công !!');
            } catch (error) {
                navigate('/admin/experts');
                toast.error('Thêm chuyên gia thất bại !!');
            }


        },
    });

    return (
        <>
            <div className="create-expert">
                {/* Page Header */}
                <div className="page-header">
                    <div className="header-left">
                        <Link to={'/admin/experts'} style={{ textDecoration: 'none' }} className="btn-back">
                            <i className="bi bi-arrow-left me-2"></i>
                            Quay lại
                        </Link>
                        <div className="header-title-group">
                            <h1 className="page-title">Thêm chuyên gia mới</h1>
                            <p className="page-subtitle">Điền thông tin chi tiết để thêm chuyên gia vào hệ thống</p>
                        </div>
                    </div>
                </div>

                <div >
                    <form className="expert-form" onSubmit={formik.handleSubmit}>
                        <div className="form-section">
                            <div className="section-header">
                                <i className="bi bi-person-circle section-icon"></i>
                                <h2 className="section-title">Thông tin cá nhân</h2>
                            </div>

                            <div className="row g-3">
                                {/* Full Name */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Họ của chuyên gia <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name='lastname'
                                        className="form-control"
                                        placeholder="Nhập họ của chuyên gia"
                                        value={formik.values.lastname}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.errors.lastname && formik.touched.lastname && <div className="text-danger mt-2">{formik.errors.lastname}</div>}
                                </div>


                                <div className="col-md-6">
                                    <label className="form-label">
                                        Tên của chuyên gia <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name='firstname'
                                        className="form-control"
                                        placeholder="Nhập tên của chuyên gia"
                                        value={formik.values.firstname}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.errors.firstname && formik.touched.firstname && <div className="text-danger mt-2">{formik.errors.firstname}</div>}
                                </div>

                                {/* Email */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Email <span className="required">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name='email'
                                        className="form-control"
                                        placeholder="example@email.com"
                                        value={formik.values.email}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.errors.email && formik.touched.email && <div className="text-danger mt-2">{formik.errors.email}</div>}
                                </div>


                                {/* Gender */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Giới tính <span className="required">*</span>
                                    </label>
                                    <select className="form-control" name='sex' value={formik.values.sex} onChange={formik.handleChange} onBlur={formik.handleBlur}>
                                        <option value="">Chọn giới tính</option>
                                        <option value="male">Nam</option>
                                        <option value="female">Nữ</option>
                                        {/* <option value="other">Khác</option> */}
                                    </select>
                                    {formik.errors.sex && formik.touched.sex && <div className="text-danger mt-2">{formik.errors.sex}</div>}
                                </div>


                                {/* province */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Tỉnh thành của chuyên gia <span className="required">*</span>
                                    </label>
                                    <select className="form-control" name='province_id' value={formik.values.province_id} onChange={async (e) => {
                                        const val = e.target.value;


                                        if (!val) {
                                            setWardList([]);
                                            formik.setFieldValue("province_id", val);
                                            return;
                                        }

                                        try {
                                            const rs = await getWardByIdProvince(val);
                                            formik.setFieldValue("province_id", val);
                                            setWardList(rs.data.data);
                                        } catch (error) {
                                            toast.error('Server đang bận thử lại sau !!!')
                                        }
                                    }} onBlur={formik.handleBlur}>
                                        <option value="">-- Chọn tỉnh thành --</option>
                                        {provinceList.map(row => {
                                            return (<option value={row.id}>{row.name}</option>)
                                        })}
                                    </select>
                                    {formik.errors.province_id && formik.touched.province_id && <div className="text-danger mt-2">{formik.errors.province_id}</div>}
                                </div>


                                {/* ward */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Phường của chuyên gia <span className="required">*</span>
                                    </label>
                                    <select className="form-control" name='ward_id' value={formik.values.ward_id} onChange={formik.handleChange} onBlur={formik.handleBlur}>
                                        <option value="">-- Chọn phường --</option>
                                        {wardList.map(row => <option value={row.id}>{row.name}</option>)}
                                    </select>
                                    {formik.errors.ward_id && formik.touched.ward_id && <div className="text-danger mt-2">{formik.errors.ward_id}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Professional Information Section */}
                        <div className="form-section">
                            <div className="section-header">
                                <i className="bi bi-briefcase section-icon"></i>
                                <h2 className="section-title">Thông tin chuyên môn</h2>
                            </div>

                            <div className="row g-3">
                                {/* Specialization */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Lĩnh vực chuyên môn <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name='major'
                                        className="form-control"
                                        placeholder="Nhập chuyên ngành của chuyên gia"
                                        value={formik.values.major}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.errors.major && formik.touched.major && <div className="text-danger mt-2">{formik.errors.major}</div>}
                                </div>

                                {/* Degree */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Trình độ học vấn <span className="required">*</span>
                                    </label>
                                    <select className="form-control" name='level' value={formik.values.level} onChange={formik.handleChange} onBlur={formik.handleBlur}>
                                        <option value="">Chọn trình độ</option>
                                        <option value="bachelor">Cử nhân</option>
                                        <option value="master">Thạc sĩ</option>
                                        <option value="doctor">Tiến sĩ</option>
                                        <option value="professor">Giáo sư</option>
                                    </select>
                                    {formik.errors.level && formik.touched.level && <div className="text-danger mt-2">{formik.errors.level}</div>}
                                </div>

                                {/* Certification */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Đang giảng dạy tại
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Nhập nơi đang giảng dạy"
                                        name='teachAt'
                                        value={formik.values.teachAt}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.errors.teachAt && formik.touched.teachAt && <div className="text-danger mt-2">{formik.errors.teachAt}</div>}
                                </div>

                                {/* Phí  */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Phí tư vấn (VNĐ/Ca) <span className="required">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="500000"
                                        min="0"
                                        name='price'
                                        value={formik.values.price}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.errors.price && formik.touched.price && <div className="text-danger mt-2">{formik.errors.price}</div>}
                                </div>

                                {/* Bio */}
                                <div className="col-12">
                                    <label className="form-label">
                                        Giới thiệu bản thân
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        placeholder="Viết một đoạn giới thiệu ngắn về bản thân và kinh nghiệm làm việc..."
                                        name='information'
                                        value={formik.values.information}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    ></textarea>
                                    {formik.errors.information && formik.touched.information && <div className="text-danger mt-2">{formik.errors.information}</div>}
                                </div>

                            </div>
                        </div>

                        {/* Account Information Section */}
                        <div className="form-section">
                            <div className="section-header">
                                <i className="bi bi-shield-lock section-icon"></i>
                                <h2 className="section-title">Thông tin tài khoản</h2>
                            </div>

                            <div className="row g-3">
                                {/* Username */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Tên đăng nhập <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Tên đăng nhập duy nhất"
                                        name='username'
                                        value={formik.values.username}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.errors.username && formik.touched.username && <div className="text-danger mt-2">{formik.errors.username}</div>}
                                </div>

                                {/* Password */}
                                <input
                                    type="hidden"
                                    value={formik.values.password}
                                    className="form-control"
                                    placeholder="Nhập mật khẩu"
                                    name='password'
                                />

                                {/* Status */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Trạng thái hoạt động <span className="required">*</span>
                                    </label>
                                    <select className="form-control" name='statusAccount' value={formik.values.statusAccount} onChange={formik.handleChange} onBlur={formik.handleBlur}>
                                        <option value="">Chọn trạng thái</option>
                                        <option value="active">Sẵn sàng</option>
                                        <option value="busy">Đang bận</option>
                                        <option value="inactive">Ngừng hoạt động</option>
                                    </select>
                                    {formik.errors.statusAccount && formik.touched.statusAccount && <div className="text-danger mt-2">{formik.errors.statusAccount}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="form-actions">
                            <button type="button" className="btn-cancel">
                                Hủy bỏ
                            </button>
                            <button type="submit" className="btn-submit">
                                <i className="bi bi-check-lg me-2"></i>
                                Lưu chuyên gia
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
