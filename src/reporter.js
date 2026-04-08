const chalk = require("chalk").default

const methodsInHex = {
    "GET": "#6ddd99",
    "POST": "#ffe47e",
    "PUT": "#75aff6",
    "PATCH": "#c1a8e0",
    "DELETE": "#f79a8f"
}

const reporter = (result, totalExecutionTime) => {
    const totalScenario = result.length
 
    console.log(chalk.bold("Test results report"))
    console.log(chalk.bold(`Running ${totalScenario} scenarios\n`))
    
    let failedTest = 0
    result.forEach(({ description, request, expected, actual, assertion }) => {
        const { method, path } = request
        const { status, responseBodySchema } = assertion
        const passed = status && responseBodySchema

        console.log(`${chalk.hex(methodsInHex[method])(method)} ${path} - ${description} ${passed ? "✅" : "❌"}`)

        if (!passed){
            if (!status){
                console.log(`Expected status: ${expected.status}`)
                console.log(`Actual status: ${actual.status}\n`)
            }
            if (!responseBodySchema){
                const contentType = Object.keys(expected.responseBody)[0]
                console.log("Expected response body:")
                console.log(JSON.stringify(expected.responseBody[contentType].schema, null, 2))
                console.log("Actual response body:")
                console.log(JSON.stringify(actual.responseBody, null, 2), "\n")
            }

            failedTest++
        }
    })

    console.log(chalk.bold.green(`\nPassed`) + ` ✅: ${totalScenario - failedTest}`)
    console.log(chalk.bold.red(`Failed`) + ` ❌: ${failedTest}\n`)

    console.log(`Time: ${totalExecutionTime} ms`)
}

module.exports = { reporter }