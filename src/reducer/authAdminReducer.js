import { LOGIN_ADMIN, LOGOUT_ADMIN, UPDATED_LOGGED_USER_ADMIN } from "../constants/AuthAdminConstant";

const initialState = JSON.parse(localStorage.getItem('authAdminInfo') || "{}");

const authAdminReducer = (state = initialState, action) => {
    // switch
    switch (action.type) {
        case LOGIN_ADMIN:
            {
                const new_state = {
                    isLogin: true,
                    access_token: action.payload.access_token,
                    loggedUser: action.payload.loggedUser
                }
                localStorage.setItem('authAdminInfo', JSON.stringify(new_state));
                return new_state;
            }

        case LOGOUT_ADMIN:
            {
                const new_state = {
                    isLogin: false,
                    // access_token: action.payload.access_token,
                    // loggedUser: action.payload.loggedUser
                }
                localStorage.setItem('authAdminInfo', JSON.stringify(new_state));
                return new_state;
            }

        case UPDATED_LOGGED_USER_ADMIN:
            {
                const new_state = {
                    ...state,
                    loggedUser: action.payload.loggedUser
                }
                localStorage.setItem('authAdminInfo', JSON.stringify(new_state));
                return new_state;
            }

        default:
            return state
    }
}

export default authAdminReducer