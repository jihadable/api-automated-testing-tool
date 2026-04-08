const Ajv = require("ajv")
const ajv = new Ajv()

const stripExamples = schema => {
    if (Array.isArray(schema)) {
        return schema.map(stripExamples)
    }

    if (schema && typeof schema === "object") {
        const result = {}
        for (const key in schema) {
            if (key === "example") continue
            result[key] = stripExamples(schema[key])
        }
        return result
    }

    return schema
}

const normalizeSchema = schema => {
    if (schema.type === "object") {
        return {
            ...schema,
            additionalProperties: false,
            required: Object.keys(schema.properties || {}),
        }
    }
    
    return schema
}

const getAssertion = (expected, actual) => {
    const assertion = {
        status: true,
        responseBodySchema: true
    }

    if (expected.status != actual.status){
        assertion.status = false
    }

    const contentType = Object.keys(expected.responseBody)[0]
    const rawSchema = expected.responseBody[contentType].schema
    const schema = normalizeSchema(stripExamples(rawSchema))

    const validate = ajv.compile(schema)
    const valid = validate(actual.responseBody)
    if (!valid){
        assertion.responseBodySchema = false
    }

    return assertion
}

module.exports = { stripExamples, normalizeSchema, getAssertion }