const { getOASFilePath, getAuthentications } = require("../configReader")
const { getOAS, getSecuritySchemas } = require("../oasReader")
const { getScenarios } = require("../scenario")

describe("scenario.js test", () => {
    test("getScenarios", async() => {
        const OASFilePath = getOASFilePath()
        const authentications = getAuthentications()
        const OAS = await getOAS(OASFilePath)

        const scenarios = []
        for (const [path, methods] of Object.entries(OAS.paths)){
            for (const [method, operation] of Object.entries(methods)){
                const securitySchemas = getSecuritySchemas(OAS)
                const scenariosPerOperation = getScenarios(path, method, operation, authentications, securitySchemas)
                scenarios.push(...scenariosPerOperation)
            }
        }

        const firstScenario = scenarios[0]
        const lastScenario = scenarios[scenarios.length - 1]

        expect(firstScenario.id).toEqual(expect.any(String))
        expect(firstScenario.description).toEqual(expect.any(String))
        expect(firstScenario.request).toEqual(expect.any(Object))
        expect(firstScenario.expected).toEqual(expect.any(Object))

        expect(firstScenario.request).toEqual(
            expect.objectContaining({
                path: expect.any(String),
                method: expect.any(String),
                params: expect.any(Object),
                headers: expect.any(Object),
                auth: expect.any(Object),
                requestBody: expect.any(Object)
            })
        )
        expect(firstScenario.expected).toEqual(
            expect.objectContaining({
                status: expect.any(Number),
                responseBody: expect.any(Object)
            })
        )

        expect(lastScenario.id).toEqual(expect.any(String))
        expect(lastScenario.description).toEqual(expect.any(String))
        expect(lastScenario.request).toEqual(expect.any(Object))
        expect(lastScenario.expected).toEqual(expect.any(Object))

        expect(lastScenario.request).toEqual(
            expect.objectContaining({
                path: expect.any(String),
                method: expect.any(String),
                params: expect.any(Object),
                headers: expect.any(Object),
                auth: expect.any(Object),
                requestBody: expect.any(Object)
            })
        )
        expect(lastScenario.expected).toEqual(
            expect.objectContaining({
                status: expect.any(Number),
                responseBody: expect.any(Object)
            })
        )
    })
})