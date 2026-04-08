const axios = require("axios")
const FormData = require("form-data")
const fs = require('fs')

const getRequestBody = requestBody => {
    let data = null
    const requestBodies = Object.entries(requestBody)   
    if (requestBodies.length){
        const [mediaType, requestBodyValue] = requestBodies[0]
        if (mediaType == "application/json"){
            data = requestBodyValue
        } else if (mediaType == "multipart/form-data"){
            data = new FormData()
            for (let [field, value] of Object.entries(requestBodyValue)){
                if (typeof value === "string") {
                    try {
                        const obj = JSON.parse(value)
                        if (obj.isFile && obj.path) {
                            data.append(field, fs.createReadStream(obj.path))
                            continue
                        }
                    } catch {}
                }

                data.append(field, String(value))
            }
        }
    }

    return data
}

const runner = async({
    baseURL,
    path,
    method,
    params,
    headers,
    auth,
    requestBody
}) => {
    const data = getRequestBody(requestBody)

    if (data instanceof FormData) {
        headers = {
            ...headers,
            ...data.getHeaders()
        }
    }

    const response = await axios({
        baseURL,
        url: path,
        method,
        auth,
        params,
        headers,
        data,
        validateStatus: () => true // jangan lempar error kalau bukan 2xx
    })

    return response
}

module.exports = { getRequestBody, runner }