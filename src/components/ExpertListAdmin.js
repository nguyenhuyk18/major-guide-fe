// import React from 'react';
import ExpertListCard from './ExpertListCard';

export default function ExpertListAdmin(props) {

    const { expertList } = props;

    return (
        <>
            <div className="experts-grid">
                {expertList.map((expertInfo, inx) => <ExpertListCard key={inx} expertInfo={expertInfo.user} />)}
            </div>
        </>
    );
}
