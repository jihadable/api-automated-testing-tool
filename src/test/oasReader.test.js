const { getOASFilePath } = require("../configReader")
const { getOAS, getSecuritySchemas } = require("../oasReader")

describe("oasReader.js test", () => {
    test("getOAS test", async() => {
        const OASFilePath = getOASFilePath()
        const OAS = await getOAS(OASFilePath)

        expect(OAS).toHaveProperty("openapi")
        expect(OAS).toHaveProperty("info")
        expect(OAS).toHaveProperty("servers")
        expect(OAS).toHaveProperty("tags")
        expect(OAS).toHaveProperty("components")
        expect(OAS).toHaveProperty("paths")

        expect(OAS.info.title).toEqual("Students REST API")
    })

    test("getSecuritySchemas", async() => {
        const OASFilePath = getOASFilePath()
        const OAS = await getOAS(OASFilePath)
        const securitySchemes = getSecuritySchemas(OAS)

        expect(securitySchemes).toEqual({
            "basicAuth": {
                "type": "http",
                "scheme": "basic"
            },
            "bearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT"
            },
            "apiKeyAuthInHeader": {
                "type": "apiKey",
                "in": "header",
                "name": "X-API-KEY"
            },
            "apiKeyAuthInCookie": {
                "type": "apiKey",
                "in": "cookie",
                "name": "X-API-KEY"
            },
            "apiKeyAuthInQuery": {
                "type": "apiKey",
                "in": "query",
                "name": "api-key"
            }
        })
    })
})