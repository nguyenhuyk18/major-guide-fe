import { combineReducers } from "redux";
import authAdminReducer from "./authAdminReducer";


const rootReducer = combineReducers(
    // đây là 1 object nó phải truyền vào 1 object 
    {
        authAdminReducer: authAdminReducer,
    }
);

export default rootReducer