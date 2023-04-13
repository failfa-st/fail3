import type { ExtractedData, OpenApiDocument } from "../open-api-document.ts";
import { parseOpenApiDocument } from "../open-api-document.ts";

describe("parseOpenApiDocument", () => {
	const openApiDocument: OpenApiDocument = {
		openapi: "3.1.0",
		info: {
			title: "Test API",
			version: "0.0.1",
		},
		paths: {
			// Add any additional test paths here.
		},
	};

	test("should return an empty array for a document with no paths", () => {
		const result = parseOpenApiDocument(openApiDocument);
		expect(result).toEqual([]);
	});

	test("should extract data from a valid OpenAPI document", () => {
		const testPath = {
			"/test": {
				get: {
					summary: "Test endpoint",
					responses: {
						"200": {
							description: "Successful response",
							content: {
								"application/json": {
									schema: {
										type: "object",
										properties: {
											message: {
												type: "string",
											},
										},
									},
								},
							},
						},
					},
				},
			},
		};

		openApiDocument.paths = testPath;

		const expectedResult: ExtractedData[] = [
			{
				path: "/test",
				method: "get",
				responses: {
					"200": {
						description: "Successful response",
						properties: {
							message: {
								type: "string",
							},
						},
					},
				},
			},
		];

		const result = parseOpenApiDocument(openApiDocument);
		expect(result).toEqual(expectedResult);
	});

	// Add any additional test cases here.
});
