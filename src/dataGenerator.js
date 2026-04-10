const { JSONSchemaFaker } = require("json-schema-faker")
const { getRequestBodyFilePaths } = require("./configReader")

JSONSchemaFaker.option({
    defaultInvalidTypeProduct: true,
    alwaysFakeOptionals: true,
    useExamplesValue: true,
    useDefaultValue: true
})
JSONSchemaFaker.format("binary", schema => {
    const mimetypes = schema.description.split(",").map(mimetype => mimetype.trim())

    const requestBodyFilePaths = getRequestBodyFilePaths()
    for (const mimetype of mimetypes){
        if (requestBodyFilePaths[mimetype]){
            return JSON.stringify({
                isFile: true,
                path: requestBodyFilePaths[mimetype]
            })
        }
    }

    throw new Error("File not found")
})

const getValidData = schema => JSONSchemaFaker.generate({...schema, additionalProperties: false})

const getInvalidData = schemaInput => {
    let schema = structuredClone(schemaInput)

    if (schema.type == "integer"){
        const choices = [
            {
                type: "string",
                example: "abc"
            },
            {
                type: "boolean",
                example: false
            }
        ]

        if (schema.minimum){
            choices.push({
                type: "integer",
                example: schema.minimum - 1
            })
        }
        if (schema.maximum){
            choices.push({
                type: "integer",
                example: schema.maximum + 1
            })
        }
        if (schema.multipleOf){
            choices.push({
                type: "integer",
                example: schema.multipleOf + 1
            })
        }

        schema = choices[Math.floor(Math.random() * choices.length)]
    } else if (schema.type == "number"){
        const choices = [
            {
                type: "string",
                example: "abc"
            },
            {
                type: "boolean",
                example: false
            }
        ]

        if (schema.minimum){
            choices.push({
                type: "integer",
                example: schema.minimum - 1
            })
        }
        if (schema.maximum){
            choices.push({
                type: "integer",
                example: schema.maximum + 1
            })
        }
        if (schema.multipleOf){
            choices.push({
                type: "integer",
                example: schema.multipleOf + 1
            })
        }

        schema = choices[Math.floor(Math.random() * choices.length)]
    } else if (schema.type == "string"){
        const choices = [
            {
                type: "integer",
                example: 1
            },
            {
                type: "number",
                example: .2
            },
            {
                type: "boolean",
                example: false
            }
        ]

        if (schema.minLength){
            const example = "a".repeat(schema.minLength - 1)
            choices.push({
                type: "string",
                example
            })
        }
        if (schema.maxLength){
            const example = "a".repeat(schema.maxLength + 1)
            choices.push({
                type: "string",
                example
            })
        }
        if (schema.enum){
            let example = ""
            if (schema.enum > 1){
                for (const val of schema.enum){
                    example += val
                }
            } else {
                example = schema.enum[0] + "a"
            }

            choices.push({
                type: "string",
                example
            })
        }

        schema = choices[Math.floor(Math.random() * choices.length)]
    } else if (schema.type == "boolean"){
        const choices = [
            {
                type: "integer",
                example: 1
            },
            {
                type: "number",
                example: .2
            },
            {
                type: "string",
                example: "abc"
            }
        ]

        schema = choices[Math.floor(Math.random() * choices.length)]
    } else if (schema.type == "object"){
        for (const key in schema.properties){
            schema.properties[key] = getInvalidData(schema.properties[key])
        }
    } else if (schema.type == "array"){
        const choices = [
            {
                type: "integer",
                example: 1
            },
            {
                type: "number",
                example: .2
            },
            {
                type: "string",
                example: "abc"
            },
            {
                type: "boolean",
                example: false
            }
        ]

        let index = Math.floor(Math.random() * choices.length)
        while (choices[index].type == schema.items.type){
            index = Math.floor(Math.random() * choices.length)
        }

        schema.items = choices[index]
    } else if (schema.oneOf || schema.anyOf){
        let choices = [
            {
                type: "integer",
                example: 1
            },
            {
                type: "number",
                example: .2
            },
            {
                type: "string",
                example: "abc"
            },
            {
                type: "boolean",
                example: false
            },
            {
                type: "object",
                example: {
                    foo: "bar"
                }
            },
            {
                type: "array",
                example: [0]
            }
        ]

        const types = schema.oneOf ? schema.oneOf : schema.anyOf
        for (const val of types){
            const { type } = val
            choices = choices.filter(choice => choice.type != type)
        }
        
        schema = choices[Math.floor(Math.random() * choices.length)]
    } else if (schema.not){
        schema = schema.not
    }

    return getValidData(schema)
}

module.exports = { getValidData, getInvalidData }

// const getComponents = oas => {
//     if (!oas.components){
//         return {}
//     }

//     const { components } = oas
//     const componentsResult = {}

//     // schemas
//     if (components.schemas){
//         for (const [key, value] of Object.entries(components.schemas)){
//             const componentKey = `#/components/schemas/${key}`
//             componentsResult[componentKey] = value
//         }
//     }

//     // parameters
//     if (components.parameters){
//         for (const [key, value] of Object.entries(components.parameters)){
//             const componentKey = `#/components/parameters/${key}`
//             componentsResult[componentKey] = value
//         }
//     }

//     // requestBodies
//     if (components.requestBodies){
//         for (const [key, value] of Object.entries(components.requestBodies)){
//             const componentKey = `#/components/requestBodies/${key}`
//             componentsResult[componentKey] = value
//         }
//     }

//     // responses
//     if (components.responses){
//         for (const [key, value] of Object.entries(components.responses)){
//             const componentKey = `#/components/responses/${key}`
//             componentsResult[componentKey] = value
//         }
//     }

//     return componentsResult
// }