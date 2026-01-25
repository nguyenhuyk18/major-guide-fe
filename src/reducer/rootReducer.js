import { combineReducers } from "redux";
import authAdminReducer from "./authAdminReducer";
import authClientReducer from "./clientAdminReducer";


const rootReducer = combineReducers(
    // đây là 1 object nó phải truyền vào 1 object 
    {
        authAdminReducer: authAdminReducer,
        authClientReducer: authClientReducer
    }
);

export default rootReducer