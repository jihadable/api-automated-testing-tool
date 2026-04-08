const { getConfig, getOASFilePath, getAuthentications, getRequestBodyFilePaths } = require("../configReader")

describe("configReader.js test", () => {
    test("getConfig", () => {
        const config = getConfig()

        expect(config).toEqual({
            "OASFilePath": "./openapi.json",
            "authentications": {
                "basicAuth": {
                    "username": "jihadable",
                    "password": "secret1234"
                },
                "bearerAuth": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5OGZmNzFlLWYyZDctNDVmZC05ZjIzLTI3ZGRlYjcxMzgwZSIsImlhdCI6MTc2ODc4OTI5MiwiZXhwIjoxNzcxMzgxMjkyfQ.ASQTly55sK1Gg_1ZA6oxkvstjeH4RgVwmNSVZ_TovKE",
                "apiKeyAuthInHeader": {
                    "X-API-KEY": "secret1234"
                },
                "apiKeyAuthInCookie": {
                    "X-API-KEY": "secret1234"
                },
                "apiKeyAuthInQuery": {
                    "api-key": "secret1234"
                }
            },
            "requestBodyFilePaths": {
                "image/png": "./images.png",
                "image/jpeg": "./images.jpg"
            }
        })
    })

    test("getOASFilePath", () => {
        const OASFilePath = getOASFilePath()

        expect(OASFilePath).toEqual("./openapi.json")
    })

    test("getAuthentications", () => {
        const authentications = getAuthentications()

        expect(authentications).toEqual({
            "basicAuth": {
                "username": "jihadable",
                "password": "secret1234"
            },
            "bearerAuth": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5OGZmNzFlLWYyZDctNDVmZC05ZjIzLTI3ZGRlYjcxMzgwZSIsImlhdCI6MTc2ODc4OTI5MiwiZXhwIjoxNzcxMzgxMjkyfQ.ASQTly55sK1Gg_1ZA6oxkvstjeH4RgVwmNSVZ_TovKE",
            "apiKeyAuthInHeader": {
                "X-API-KEY": "secret1234"
            },
            "apiKeyAuthInCookie": {
                "X-API-KEY": "secret1234"
            },
            "apiKeyAuthInQuery": {
                "api-key": "secret1234"
            }
        })
    })

    test("getRequestBodyFilePaths", () => {
        const requestBodyFilePaths = getRequestBodyFilePaths()

        expect(requestBodyFilePaths).toEqual({
            "image/png": "images.png",
            "image/jpeg": "images.jpg"
        })
    })
})