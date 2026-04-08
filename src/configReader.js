const fs = require("fs")
const path = require("path")

const getConfig = () => {
    try {
        const file = fs.readFileSync("config.json", "utf-8")
        return JSON.parse(file)
    } catch(error){
        throw error
    }
}

const getOASFilePath = () => {
    if (getConfig().OASFilePath){
        return getConfig().OASFilePath
    } else {
        throw new Error("OAS file path not found")
    }
}

const getAuthentications = () => {
    return getConfig().authentications ?? {}
}

const getRequestBodyFilePaths = () => {
    if (!getConfig().requestBodyFilePaths){
        return {}
    }
    
    const requestBodyFilePaths = {}
    for (const key in getConfig().requestBodyFilePaths){
        const filePath = path.join(getConfig().requestBodyFilePaths[key])
        requestBodyFilePaths[key] = filePath
    }

    return requestBodyFilePaths
}

module.exports = { getConfig, getOASFilePath, getAuthentications, getRequestBodyFilePaths }