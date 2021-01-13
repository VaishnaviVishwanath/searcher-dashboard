import {actions} from '../constants'


export function userDataReducer(state=null,action){
    switch (action.type){
        case actions.SET_USER_DATA:
            return action.payload
        }
return state
}

export function indicesReducer(state=null,action){
    switch (action.type){
        case actions.SET_INDICES:
            return action.payload
        }
return state
}




// export function 