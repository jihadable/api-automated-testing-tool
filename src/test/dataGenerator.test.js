const { getValidData, getInvalidData  } = require("../dataGenerator")

describe("dataGenerator.js test", () => {
    const stringSchema = {
        type: "string"
    }

    const numberSchema = {
        type: "number"    
    }

    const integerSchema = {
        type: "integer"    
    }

    const booleanSchema = {
        type: "boolean"    
    }

    const arraySchema = {
        type: "array",
        items: {
            type: "number"
        }    
    }

    const objectSchema = {
        type: "object",
        properties: {
            name: {
                type: "string"
            },
            age: {
                type: "number"
            },
            gender: {
                type: "boolean"
            }
        }
    }

    test("getValidData", () => {
        const stringValidData = getValidData(stringSchema)
        const numberValidData = getValidData(numberSchema)
        const integerValidData = getValidData(integerSchema)
        const booleanValidData = getValidData(booleanSchema)
        const arrayValidData = getValidData(arraySchema)
        const objectValidData = getValidData(objectSchema)

        expect(stringValidData).toEqual(expect.any(String))
        expect(numberValidData).toEqual(expect.any(Number))
        expect(integerValidData).toEqual(expect.any(Number))
        expect(booleanValidData).toEqual(expect.any(Boolean))
        expect(arrayValidData).toEqual(expect.any(Array))
        expect(objectValidData).toEqual(expect.any(Object))

        expect(arrayValidData[0]).toEqual(expect.any(Number))
        expect(objectValidData).toEqual(
            expect.objectContaining({
                name: expect.any(String),
                age: expect.any(Number),
                gender: expect.any(Boolean)
            })
        )
    })

    test("getInvalidData", () => {
        const stringInvalidData = getInvalidData(stringSchema)
        const numberInvalidData = getInvalidData(numberSchema)
        const integerInvalidData = getInvalidData(integerSchema)
        const booleanInvalidData = getInvalidData(booleanSchema)
        const arrayInvalidData = getInvalidData(arraySchema)
        const objectInvalidData = getInvalidData(objectSchema)

        expect(stringInvalidData).not.toEqual(expect.any(String))
        expect(numberInvalidData).not.toEqual(expect.any(Number))
        expect(integerInvalidData).not.toEqual(expect.any(Number))
        expect(booleanInvalidData).not.toEqual(expect.any(Boolean))
        
        expect(arrayInvalidData[0]).not.toEqual(expect.any(Number))
        expect(objectInvalidData.name).not.toEqual(expect.any(String))
        expect(objectInvalidData.age).not.toEqual(expect.any(Number))
        expect(objectInvalidData.gender).not.toEqual(expect.any(Boolean))
    })
})