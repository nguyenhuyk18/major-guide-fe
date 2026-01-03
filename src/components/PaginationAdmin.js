import React from 'react';

export default function PaginationAdmin(props) {
    const { totalPage, currentPage, handleChangeNextPage, handleChangePrevious } = props;

    // console.log(currentPage, '  ', totalPage)

    return (
        <>
            <div className="table-footer">
                <div className="pagination-info">
                    Hiển thị trang <strong>{currentPage}</strong> trong tổng số <strong>{totalPage}</strong> trang
                </div>
                <div className="pagination-controls">
                    <button className="btn-pagination" onClick={handleChangePrevious} disabled={Number(currentPage) === 1 ? true : false}  >Trước</button>
                    <button className="btn-pagination" disabled={Number(currentPage) === totalPage ? true : false} onClick={handleChangeNextPage}  >Sau</button>
                </div>
            </div>
        </>
    );
}
