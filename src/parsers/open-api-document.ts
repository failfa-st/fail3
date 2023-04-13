export type OpenApiDocument = {
	openapi: string;
	info: {
		title: string;
		version: string;
	};
	paths: Record<string, any>;
};

export type ExtractedData = {
	path: string;
	method: string;
	requestBody?: Record<string, any>;
	responses: Record<string, any>;
};
export function parseOpenApiDocument(document: OpenApiDocument): ExtractedData[] {
	const { paths } = document;
	const extractedData: ExtractedData[] = [];

	for (const path in paths) {
		if (Object.hasOwn(paths, path)) {
			for (const method in paths[path]) {
				if (Object.hasOwn(paths[path], method)) {
					const endpoint = paths[path][method];
					const { responses } = endpoint;
					const extractedResponses: Record<string, any> = {};

					for (const statusCode in responses) {
						if (Object.hasOwn(responses, statusCode)) {
							const response = responses[statusCode];
							const content = response.content?.["application/json"];
							const schema = content?.schema;

							if (schema) {
								extractedResponses[statusCode] = {
									description: response.description,
									properties: schema.properties,
								};
							}
						}
					}

					if (Object.keys(extractedResponses).length > 0) {
						let extractedRequestBody: Record<string, any> | undefined;

						if (endpoint.requestBody) {
							const content = endpoint.requestBody.content["application/json"];
							const { schema } = content;

							extractedRequestBody = {
								required: endpoint.requestBody.required,
								properties: schema.properties,
							};
						}

						extractedData.push({
							path,
							method,
							requestBody: extractedRequestBody,
							responses: extractedResponses,
						});
					}
				}
			}
		}
	}

	return extractedData;
}
