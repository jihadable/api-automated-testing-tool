const SwaggerParser = require("@apidevtools/swagger-parser");

const getOAS = async(oasFilePath) => {
    try {
        if (!oasFilePath.includes(".json") && !oasFilePath.includes(".yaml")){
            throw new Error("OAS file must have in json or yaml format")
        }

        const oas = await SwaggerParser.validate(oasFilePath)

        return await SwaggerParser.dereference(oas)
    } catch(error){
        throw error
    }
}

const getSecuritySchemas = oas => {
    if (!oas.components){
        return {}
    }

    const { components } = oas
    return components.securitySchemes
}

module.exports = { getOAS, getSecuritySchemas }