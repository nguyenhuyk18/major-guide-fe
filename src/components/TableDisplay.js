import React from 'react';
import PaginationAdmin from './PaginationAdmin';
import '../assets/css/TableComponent.css'

export default function TableDisplay(props) {



    const { listData, totalPage, handleChangeNextPage, currentPage, handleChangePrevious } = props;



    return (
        <>
            <div className="table-container">
                <div className="table-responsive">
                    <table className="consultation-table">
                        <thead>
                            <tr>
                                {
                                    Object.keys(listData[0]).map(row => <th>{row}</th>)
                                }
                                <th>Hành Động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {listData.map(row =>
                                <tr>
                                    {Object.values(row).map(row1 => {
                                        return <td>
                                            {row1}
                                        </td>
                                    })}
                                    <td>
                                        <button className="btn-action" title="Xem chi tiết">
                                            <i className="bi bi-eye"></i>
                                        </button>
                                    </td>
                                </tr>)}

                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <PaginationAdmin handleChangePrevious={handleChangePrevious} totalPage={totalPage} currentPage={currentPage} handleChangeNextPage={handleChangeNextPage} />

            </div>
        </>
    );
}
