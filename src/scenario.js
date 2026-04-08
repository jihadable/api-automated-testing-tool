const { getValidData, getInvalidData } = require("./dataGenerator")

const getScenarios = (path, method, operation, authentications, securitySchemas) => {
    const scenarios = [];

    // Helper function untuk replace path parameters
    const replacePath = (path, params) => {
        let newPath = path;
        for (const [key, value] of Object.entries(params)) {
            newPath = newPath.replace(`{${key}}`, value);
        }
        return newPath;
    };

    // Helper function untuk extract security requirements
    const getSecurityForOperation = (operation, authentications) => {
        const security = operation.security || [];
        let securitySchema = {}
        let authResult = {};
        let headersResult = {};
        let queryResult = {};
        let authType = null; // Track jenis auth yang digunakan

        if (security.length > 0) {
            const securityType = security[0];
            const schemeName = Object.keys(securityType)[0];
            securitySchema = securitySchemas[schemeName]
            const authConfig = authentications[schemeName];

            if (authConfig) {
                // Deteksi jenis authentication
                if (securitySchema.type == "http" && securitySchema.scheme == "basic"){
                    // Basic Auth
                    authResult = {
                        username: authConfig.username,
                        password: authConfig.password
                    };
                    authType = 'basic';
                }
                if (securitySchema.type == "http" && securitySchema.scheme == "bearer"){
                    // Bearer Token
                    headersResult.Authorization = authConfig;
                    authType = 'bearer';
                }
                if (securitySchema.type == "apiKey") {
                    // API Key
                    const { name } = securitySchema
                    if (securitySchema.in == "header"){
                        headersResult[name] = authConfig[name];
                    } else if (securitySchema.in == "query"){
                        queryResult[name] = authConfig[name]
                    } else if (securitySchema.in == "cookie"){
                        let cookieValue = Object.entries(authConfig).map(([key, value]) => `${key}=${value}`).join("; ")
                        headersResult["Cookie"] = cookieValue
                    }
                    authType = 'apiKey';
                }
            }
        }

        return { securitySchema, auth: authResult, headers: headersResult, query: queryResult, authType };
    };

    // Helper function untuk check apakah status code ada di responses
    const hasResponseCode = (code) => {
        return operation.responses && operation.responses[code.toString()] !== undefined;
    };

    // Extract parameters
    const parameters = operation.parameters || [];
    const pathParams = parameters.filter(p => p.in === 'path');
    const queryParams = parameters.filter(p => p.in === 'query');
    const headerParams = parameters.filter(p => p.in === 'header');

    // Extract request body
    const requestBody = operation.requestBody;

    // Extract expected responses
    const responses = operation.responses || {};

    // Determine success status code (2xx)
    let successStatus = null;
    for (const code of ['200', '201', '202', '204']) {
        if (hasResponseCode(code)) {
            successStatus = parseInt(code);
            break;
        }
    }

    // ===== Generate valid data untuk reuse =====
    const validPathParams = {};
    pathParams.forEach(param => {
        validPathParams[param.name] = getValidData(param.schema);
    });

    const validQueryParams = {};
    queryParams.forEach(param => {
        validQueryParams[param.name] = getValidData(param.schema);
    });

    const validHeaderParams = {};
    headerParams.forEach(param => {
        validHeaderParams[param.name] = getValidData(param.schema);
    });

    let validRequestBody = {};
    if (requestBody) {
        const contentType = Object.keys(requestBody.content)[0];
        const schema = requestBody.content[contentType].schema;
        validRequestBody[contentType] = getValidData(schema);
    }

    const { securitySchema, auth, headers, query, authType } = getSecurityForOperation(operation, authentications);

    // ===== SKENARIO 1: Happy Path (Valid Request) =====
    if (successStatus) {
        const expectedResponseBody = {}
        const contentType = Object.keys(responses[successStatus].content)[0];
        expectedResponseBody[contentType] = responses[successStatus].content[contentType];

        scenarios.push({
            id: `${path}_${method}_Valid_Request_(Happy_Path)`,
            description: `Valid Request (Happy Path)`,
            request: {
                path: replacePath(path, validPathParams),
                method: method.toUpperCase(),
                params: {...query, ...validQueryParams},
                headers: { ...headers, ...validHeaderParams },
                auth: Object.keys(auth).length > 0 ? auth : null,
                requestBody: validRequestBody
            },
            expected: {
                status: successStatus,
                responseBody: expectedResponseBody
            }
        });
    }

    // ===== SKENARIO 2: Invalid Query Parameters =====
    // Hanya generate jika ada 400 di responses
    if (hasResponseCode(400)) {
        const expectedResponseBody = {}
        const contentType = Object.keys(responses["400"].content)[0];
        expectedResponseBody[contentType] = responses["400"].content[contentType];
        
        queryParams.forEach(param => {
            const invalidQueryParams = { ...validQueryParams };
            invalidQueryParams[param.name] = getInvalidData(param.schema);

            scenarios.push({
                id: `${path}_${method}_Invalid_query_param:_${param.name}`,
                description: `Invalid query param: ${param.name}`,
                request: {
                    path: replacePath(path, validPathParams),
                    method: method.toUpperCase(),
                    params: invalidQueryParams,
                    headers: { ...headers, ...validHeaderParams },
                    auth: Object.keys(auth).length > 0 ? auth : null,
                    requestBody: validRequestBody,
                },
                expected: {
                    status: 400,
                    responseBody: expectedResponseBody,
                }
            });
        });
    }

    // ===== SKENARIO 3: Invalid Request Body =====
    // Hanya generate jika ada 400 di responses
    if (requestBody && hasResponseCode(400)) {
        const requestBodyContentType = Object.keys(requestBody.content)[0];
        const schema = requestBody.content[requestBodyContentType].schema;

        const expectedResponseBody = {}
        const responseBodyContentType = Object.keys(responses["400"].content)[0];
        expectedResponseBody[responseBodyContentType] = responses["400"].content[responseBodyContentType];

        // Test dengan seluruh body invalid
        scenarios.push({
            id: `${path}_${method}_Invalid_request_body_(entire)`,
            description: `Invalid request body (entire)`,
            request: {
                path: replacePath(path, validPathParams),
                method: method.toUpperCase(),
                params: validQueryParams,
                headers: { ...headers, ...validHeaderParams },
                auth: Object.keys(auth).length > 0 ? auth : null,
                requestBody: { [requestBodyContentType]: getInvalidData(schema) }
            },
            expected: {
                status: 400,
                responseBody: expectedResponseBody
            }
        });

        // Test setiap field dalam body
        if (schema.properties) {
            for (const [fieldName, fieldSchema] of Object.entries(schema.properties)) {
                const invalidBody = getValidData(schema);
                invalidBody[fieldName] = getInvalidData(fieldSchema);

                scenarios.push({
                    id: `${path}_${method}_Invalid_field_in_body:_${fieldName}`,
                    description: `Invalid field in body: ${fieldName}`,
                    request: {
                        path: replacePath(path, validPathParams),
                        method: method.toUpperCase(),
                        params: validQueryParams,
                        headers: { ...headers, ...validHeaderParams },
                        auth: Object.keys(auth).length > 0 ? auth : null,
                        requestBody: { [requestBodyContentType]: invalidBody }
                    },
                    expected: {
                        status: 400,
                        responseBody: expectedResponseBody
                    }
                });
            }
        }
    }

    // ===== SKENARIO 4: Missing/Invalid Authentication =====
    // Hanya generate jika ada 401 atau 403 di responses
    if (operation.security && (hasResponseCode(401) || hasResponseCode(403))) {
        const expectedAuthStatus = hasResponseCode(401) ? 401 : 403;
        const expectedResponseBody = responses[String(expectedAuthStatus)]?.content;

        // Missing authentication
        scenarios.push({
            id: `${path}_${method}_Missing_authentication`,
            description: `Missing authentication`,
            request: {
                path: replacePath(path, validPathParams),
                method: method.toUpperCase(),
                params: validQueryParams,
                headers: validHeaderParams, // No auth headers
                auth: null,
                requestBody: validRequestBody,
            },
            expected: {
                status: expectedAuthStatus,
                responseBody: expectedResponseBody
            }
        });

        // Invalid authentication
        let invalidAuth = null;
        let invalidHeaders = { ...validHeaderParams };
        let invalidQueryParams = {...validQueryParams}

        if (authType == "basic") {
            // Basic Auth - gunakan kredensial invalid
            invalidAuth = { username: 'invalid_user', password: 'invalid_password' };
        } else if (authType == "bearer") {
            // Bearer Token - gunakan token invalid
            invalidHeaders = { ...validHeaderParams, Authorization: 'Bearer invalid_token_12345' };
        } else if (authType == "apiKey") {
            // API Key - gunakan key invalid

            let invalidAPIKey = 'invalid_api_key_12345'
            if (securitySchema.in == "header"){
                invalidHeaders[`${securitySchema.name}`] = invalidAPIKey
            } else if (securitySchema.in == "query"){
                invalidQueryParams[`${securitySchema.name}`] = invalidAPIKey
            } else if (securitySchema.in == "cookie"){
                invalidHeaders["Cookie"] = invalidAPIKey
            }
        }

        scenarios.push({
            id: `${path}_${method}_Invalid_authentication`,
            description: `Invalid authentication`,
            request: {
                path: replacePath(path, validPathParams),
                method: method.toUpperCase(),
                params: invalidQueryParams,
                headers: invalidHeaders,
                auth: invalidAuth,
                requestBody: validRequestBody,
            },
            expected: {
                status: expectedAuthStatus,
                responseBody: expectedResponseBody
            }
        });
    }

    // ===== SKENARIO 5: Resource Not Found =====
    // Hanya generate jika ada 404 di responses DAN ada path parameter
    if (hasResponseCode(404) && pathParams.length > 0) {
        const expectedResponseBody = {}
        const contentType = Object.keys(responses["404"].content)[0];
        expectedResponseBody[contentType] = responses["404"].content[contentType];

        const notFoundPathParams = { ...validPathParams };
        const idParam = pathParams.find(p => p.name === 'id' || p.name.includes('id'));
        
        if (idParam) {
            notFoundPathParams[idParam.name] = '00000000-0000-0000-0000-000000000000';

            scenarios.push({
                id: `${path}_${method}_Resource_not_found`,
                description: `Resource not found`,
                request: {
                    path: replacePath(path, notFoundPathParams),
                    method: method.toUpperCase(),
                    params: validQueryParams,
                    headers: { ...headers, ...validHeaderParams },
                    auth: Object.keys(auth).length > 0 ? auth : null,
                    requestBody: validRequestBody
                },
                expected: {
                    status: 404,
                    responseBody: expectedResponseBody
                }
            });
        }
    }

    // ===== SKENARIO 6: Missing Required Fields =====
    // Hanya generate jika ada 400 di responses DAN ada required fields
    if (requestBody && hasResponseCode(400)) {
        const requestBodycontentType = Object.keys(requestBody.content)[0];
        const schema = requestBody.content[requestBodycontentType].schema;

        const expectedResponseBody = {}
        const responseBodycontentType = Object.keys(responses["400"].content)[0];
        expectedResponseBody[responseBodycontentType] = responses["400"].content[responseBodycontentType];
        
        if (schema.required && schema.required.length > 0) {
            schema.required.forEach(requiredField => {
                const bodyWithMissingField = getValidData(schema);
                delete bodyWithMissingField[requiredField];

                scenarios.push({
                    id: `${path}_${method}_Missing_required_field:_${requiredField}`,
                    description: `Missing required field: ${requiredField}`,
                    request: {
                        path: replacePath(path, validPathParams),
                        method: method.toUpperCase(),
                        params: validQueryParams,
                        headers: { ...headers, ...validHeaderParams },
                        auth: Object.keys(auth).length > 0 ? auth : null,
                        requestBody: { [requestBodycontentType]: bodyWithMissingField }
                    },
                    expected: {
                        status: 400,
                        responseBody: expectedResponseBody
                    }
                });
            });
        }
    }

    return scenarios;
};

module.exports = { getScenarios }