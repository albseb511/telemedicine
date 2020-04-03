import {
  EXECUTE_DATA_INITIATE,
  EXECUTE_DATA_SUCCESS,
  EXECUTE_DATA_FAILED,
  EXECUTE_DATA_CLEAR
} from "../actionType";

export const clearData = payload => {
  return {
    type: EXECUTE_DATA_CLEAR,
    key: payload.type
  };
};

let executeDataConfig = {
  SEND_PHONE_NUMBER: {
    url: `https://tele.coronasafe.in/api/authorize/otp/send`
  },
  SEND_OTP_CHECK: { url: "https://tele.coronasafe.in/api/authorize/otp/verify" },
  UPDATE_USER_DATA: {url: "https://tele.coronasafe.in/api/user/update"},
  FETCH_QUESTIONS: {url : "https://tele.coronasafe.in/api/questions/fetch"},
  SEND_ANSWERS:{ url : "https://tele.coronasafe.in/api/answers/submit"} ,
  GET_ALL_USERS: {url : "https://tele.coronasafe.in/api/user/all/get"},
  DISTRICT_LIST: {url : "https://api.care.coronasafe.in/api/v1/state/1/districts/"},
  LOCAL_BODY_LIST: {url: "https://api.care.coronasafe.in/api/v1/local_body/"}
};

export const executeData =  payload => {
  let url = executeDataConfig[payload.type].url;
  payload.key = `${payload.type}`;
  let headers = {
    "Content-Type": "application/json",
  };
  if(!payload.cookies) {
    headers['Access-Control-Allow-Origin'] = '*'
  }

  if(payload.token) {
    headers['x-access-token'] = payload.token
  }

  if (payload.headers) {
    headers = { ...payload.headers, ...headers };
  }

  return dispatch => {
    dispatch(
      executeDataInitiate({
        key: payload.key
      })
    );
    if (payload.method === "POST") {
      fetch(url, {
        method: payload.method,
        headers: headers,
        body: payload.req
      })
      .then( response => {
        Promise.resolve(response.json()).then((value) => {
            dispatch(
                executeDataSuccess({
                  key: payload.key,
                  data: value.data
                })
              );
            })
        })
        .catch(error => {
          dispatch(
            executeDataFailure({
              key: payload.key,
              error
            })
          );
        });
    } else if (payload.method === "GET") {
      let qp = "";

      if(payload.req) {
        Object.keys(payload.req).map(key => {
          if (qp.length > 0) {
            qp += "&";
          } 
            qp += `${key}=${payload.req[key]}`;
          
        });
        url = `${url}?${qp}`;
      }
     
      fetch(url, {
        method: payload.method,
        headers: headers
      })
        .then( response => {
            Promise.resolve(response.json()).then((value) => {
              if(value.data) {
                dispatch(
                  executeDataSuccess({
                    key: payload.key,
                    data: value.data
                  })
                );
              } else {
                dispatch(
                  executeDataSuccess({
                    key: payload.key,
                    data: value
                  })
                );
              }
               
                })
            })
          
        .catch(error => {
          dispatch(
            executeDataFailure({
              key: payload.key,
              error
            })
          );
        });
    }
  };
};

const executeDataInitiate = data => {
  return {
    type: EXECUTE_DATA_INITIATE,
    data
  };
};

const executeDataSuccess = data => {
  return {
    type: EXECUTE_DATA_SUCCESS,
    data: data
  };
};

const executeDataFailure = err => {
  return {
    type: EXECUTE_DATA_FAILED,
    data: err
  };
};
