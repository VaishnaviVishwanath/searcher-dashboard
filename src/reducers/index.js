import {combineReducers} from 'redux'
import {testContentReducer,questionAttempt,userDataReducer,indicesReducer} from './testReducers'

const rootReducer = combineReducers({
    userData:userDataReducer,
    indices:indicesReducer
})

export default rootReducer