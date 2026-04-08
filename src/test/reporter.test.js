const { reporter } = require("../reporter")

describe("reporter.js test", () => {
    test("reporter", () => {
        const result = [
            {
                description: 'Success',
                request: {
                    path: '/students',
                    method: 'POST'
                },
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
                },
                assertion: {
                    status: true,
                    responseBodySchema: true
                }
            },
            {
                description: 'Status fail',
                request: {
                    path: '/students',
                    method: 'POST'
                },
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
                },
                assertion: {
                    status: false,
                    responseBodySchema: true
                }
            },
            {
                description: 'Response body fail',
                request: {
                    path: '/students/b4b70372-9bfd-4ff9-b203-377633506bbf',
                    method: 'DELETE'
                },
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
                },
                assertion: {
                    status: true,
                    responseBodySchema: false
                }
            },
            {
                description: 'Status and response body fail',
                request: {
                    path: '/students/b4b70372-9bfd-4ff9-b203-377633506bbf',
                    method: 'PUT'
                },
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
                },
                assertion: {
                    status: false,
                    responseBodySchema: false
                }
            }
        ]

        reporter(result)
    })
})