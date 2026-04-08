const { stripExamples, normalizeSchema, getAssertion } = require("../assertion")

describe("assertion.js test", () => {
    const stringSchema = {
        type: "string",
        example: "Umar"
    }

    const numberSchema = {
        type: "number",
        example: 7.5
    }

    const integerSchema = {
        type: "integer",
        example: 21
    }

    const booleanSchema = {
        type: "boolean",
        example: false
    }

    const arraySchema = {
        type: "array",
        example: [2, 3.1, -4],
        items: {
            type: "number",
            example: 7
        }
    }

    const objectSchema = {
        type: "object",
        example: {
            name: "Umar",
            age: 21,
            gender: true
        },
        properties: {
            name: {
                type: "string",
                example: "Jihad"
            },
            age: {
                type: "number",
                example: 21
            },
            gender: {
                type: "boolean",
                example: true
            }
        }
    }

    test("stripExamples", () => {
        const stringStripExamples = stripExamples(stringSchema)
        const numberStripExamples = stripExamples(numberSchema)
        const integerStripExamples = stripExamples(integerSchema)
        const booleanStripExamples = stripExamples(booleanSchema)
        const arrayStripExamples = stripExamples(arraySchema)
        const objectStripExamples = stripExamples(objectSchema)

        expect(stringStripExamples).toEqual({
            type: "string"
        })
        expect(numberStripExamples).toEqual({
            type: "number"
        })
        expect(integerStripExamples).toEqual({
            type: "integer"
        })
        expect(booleanStripExamples).toEqual({
            type: "boolean"
        })
        expect(arrayStripExamples).toEqual({
            type: "array",
            items: {
                type: "number"
            }
        })
        expect(objectStripExamples).toEqual({
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
        })
    })

    test("normalizeSchema", () => {
        const normalObjectSchema = normalizeSchema(objectSchema)
        const normalNonObjectSchema = normalizeSchema(stringSchema)

        expect(normalObjectSchema).toEqual({
            type: "object",
            example: {
                name: "Umar",
                age: 21,
                gender: true
            },
            properties: {
                name: {
                    type: "string",
                    example: "Jihad"
                },
                age: {
                    type: "number",
                    example: 21
                },
                gender: {
                    type: "boolean",
                    example: true
                }
            },
            additionalProperties: false,
            required: ["name", "age", "gender"]
        })

        expect(normalNonObjectSchema).toEqual({
            type: "string",
            example: "Umar"
        })
    })

    test("getAssertion", () => {
        const successAssertion = {
            expected: {
                status: 400,
                responseBody: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                status: {
                                    type: "string",
                                    example: "failed"
                                },
                                message: {
                                    type: "string",
                                    example: "Invalid request body"
                                }
                            }
                        }
                    }
                }
            },
            actual: {
                status: 400,
                responseBody: {
                    status: "failed",
                    message: "Invalid request body"
                }
            }
        }
        const failStatusAssertion = {
            expected: {
                status: 401,
                responseBody: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                status: {
                                    type: "string",
                                    example: "failed"
                                },
                                message: {
                                    type: "string",
                                    example: "Unauthorized"
                                }
                            }
                        }
                    }
                }
            },
            actual: {
                status: 400,
                responseBody: {
                    status: "failed",
                    message: "Invalid request body"
                }
            }
        }
        const failResponseBodyAssertion = {
            expected: {
                status: 200,
                responseBody: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                status: {
                                    type: "string",
                                    example: "success"
                                }
                            }
                        }
                    }
                }
            },
            actual: {
                status: 200,
                responseBody: {
                    status: true
                }
            }
        }
        const failStatusAndResponseBodyAssertion = {
            expected: {
                status: 404,
                responseBody: {
                    "application/json": {
                        schema: {
                            type: "object",
                            properties: {
                                status: {
                                    type: "string",
                                    example: "failed"
                                },
                                message: {
                                    type: "string",
                                    example: "Student not found"
                                }
                            }
                        }
                    }
                }
            },
            actual: {
                status: 200,
                responseBody: {
                    status: "success",
                    data: {
                        "id": "e0cf5d52-cc35-474b-b15d-8a852de58593",
                        "name": "Umar Jihad",
                        "gender": true,
                        "age": 21,
                        "grade": 3.78,
                        "profile_picture_url": "https://qzmqpaplbvnotaexrerw.supabase.co/storage/v1/object/api_automated_testing_tool/394c9fa3-ed91-4a96-9d9a-91ca5234ec67.png"
                    }
                }
            }
        }

        const successAssertionResult = getAssertion(successAssertion.expected, successAssertion.actual)
        const failStatusAssertionResult = getAssertion(failStatusAssertion.expected, failStatusAssertion.actual)
        const failResponseBodyAssertionResult = getAssertion(failResponseBodyAssertion.expected, failResponseBodyAssertion.actual)
        const failStatusAndResponseBodyAssertionResult = getAssertion(failStatusAndResponseBodyAssertion.expected, failStatusAndResponseBodyAssertion.actual)

        expect(successAssertionResult).toEqual({
            status: true,
            responseBodySchema: true
        })
        expect(failStatusAssertionResult).toEqual({
            status: false,
            responseBodySchema: true
        })
        expect(failResponseBodyAssertionResult).toEqual({
            status: true,
            responseBodySchema: false
        })
        expect(failStatusAndResponseBodyAssertionResult).toEqual({
            status: false,
            responseBodySchema: false
        })
    })
})