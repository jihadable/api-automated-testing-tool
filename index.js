const { getOASFilePath, getAuthentications } = require("./src/configReader");
const { getOAS, getSecuritySchemas } = require("./src/oasReader");
const { reporter } = require("./src/reporter");
const { runner } = require("./src/runner");
const { getAssertion } = require("./src/assertion")
const { getScenarios } = require("./src/scenario");

async function main(){
    try {
        const startTime = Date.now()

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

        const scenarioPromises = scenarios.map(async(scenario) => {
            const { request, expected } = scenario
            const response = await runner({ ...request, baseURL })

            const actual = {
                status: response.status,
                responseBody: response.data
            }

            const assertion = getAssertion(expected, actual)

            return {
                ...scenario,
                actual,
                assertion
            }
        })

        const result = await Promise.all(scenarioPromises)

        const endTime = Date.now()
        const totalExecutionTime = endTime - startTime

        reporter(result, totalExecutionTime)
    } catch(error){
        console.error(error)
    }
}

main()