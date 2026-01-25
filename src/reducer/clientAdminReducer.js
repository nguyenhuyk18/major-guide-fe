import { LOGIN, LOGOUT, UPDATE_LOGGED_USER } from "../constants/AuthConstant";

const initialState = JSON.parse(localStorage.getItem('authInfo') || "{}");

const authClientReducer = (state = initialState, action) => {
    // switch
    switch (action.type) {
        case LOGIN:
            {
                const new_state = {
                    isLogin: true,
                    access_token: action.payload.access_token,
                    loggedUser: action.payload.loggedUser
                }
                localStorage.setItem('authInfo', JSON.stringify(new_state));
                return new_state;
            }

        case LOGOUT:
            {
                const new_state = {
                    isLogin: false,
                    // access_token: action.payload.access_token,
                    // loggedUser: action.payload.loggedUser
                }
                localStorage.setItem('authInfo', JSON.stringify(new_state));
                return new_state;
            }

        case UPDATE_LOGGED_USER:
            {
                const new_state = {
                    ...state,
                    loggedUser: action.payload.loggedUser
                }
                localStorage.setItem('authInfo', JSON.stringify(new_state));
                return new_state;
            }

        default:
            return state
    }
}

export default authClientReducer