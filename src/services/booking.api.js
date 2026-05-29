import { instanceCallApi } from './api.setting';


const holdSlotBooking = async (data) => {

    const rs = await instanceCallApi.post(`/api/v2/book`,
        JSON.stringify(data),
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
    return rs;
}

const getAllBooking = async (id_member) => {
    const rs = await instanceCallApi.get(`/api/v2/book/my-bookings/${id_member}`);
    return rs;

}

export { holdSlotBooking , getAllBooking }
