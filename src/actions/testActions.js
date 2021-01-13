/*This is an action creator, which is returning an action, an action is nothing but an object
 * with fields type and payload */
import {testContent} from '../Data'
import {actions} from '../constants'
export function setIndices(indices){
    return {
        type:actions.SET_INDICES,
        payload:indices
    }
}


export function setUserData(data){
    return {
        type:actions.SET_USER_DATA,
        payload:data
    }
}