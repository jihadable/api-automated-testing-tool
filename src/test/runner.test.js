const { getOASFilePath, getAuthentications } = require("../configReader")
const { getOAS, getSecuritySchemas } = require("../oasReader")
const { getRequestBody, runner } = require("../runner")
const { getScenarios } = require("../scenario")

describe("runner.js test", () => {
    test("getRequestBody", () => {
        const objectRequestBody = {
            "application/json": {
                name: "Aisyah",
                gender: false,
                age: 20,
                grade: 3.81
            }
        }

        const objectData = getRequestBody(objectRequestBody)

        expect(objectData.name).toEqual("Aisyah")
        expect(objectData.gender).toEqual(false)
        expect(objectData.age).toEqual(20)
        expect(objectData.grade).toEqual(3.81)
    })

    test("runner", async() => {
        const OASFilePath = getOASFilePath()
        const authentications = getAuthentications()
        const OAS = await getOAS(OASFilePath)
        const baseURL = OAS.servers[0].url

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

        const firstScenarioResponse = await runner({ ...firstScenario.request, baseURL })
        const lastScenarioResponse = await runner({ ...lastScenario.request, baseURL })

        expect(firstScenarioResponse).toHaveProperty("status")
        expect(firstScenarioResponse).toHaveProperty("data")

        expect(lastScenarioResponse).toHaveProperty("status")
        expect(lastScenarioResponse).toHaveProperty("data")
    })
})