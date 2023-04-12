import { dedent } from "../../utils/string.ts";
import { json } from "../index.ts";

describe("json", () => {
	it("should parse a valid JSON string", () => {
		const jsonString = `{"name": "John Doe", "age": 30}`;
		const expectedOutput = { name: "John Doe", age: 30 };
		expect(json(jsonString)).toEqual(expectedOutput);
	});

	it("should parse a JSON string with leading and trailing whitespace", () => {
		const jsonString = `  \n\t{"name": "John Doe", "age": 30}\n  \t`;
		const expectedOutput = { name: "John Doe", age: 30 };
		expect(json(jsonString)).toEqual(expectedOutput);
	});

	it("should extract and parse a JSON code block from a Markdown string", () => {
		const mdString = dedent`
			This is some text.

			\`\`\`json
			{"name": "John Doe", "age": 30}
			\`\`\`

			This is more text.
		`;
		const expectedOutput = { name: "John Doe", age: 30 };
		expect(json(mdString)).toEqual(expectedOutput);
	});

	it("should throw an error when parsing an invalid JSON string", () => {
		const invalidJsonString = `{"name": "John Doe", "age": }`;
		expect(() => json(invalidJsonString)).toThrow();
	});

	it("should throw an error when the input is not valid JSON or a JSON code block", () => {
		const invalidInput = "This is not valid JSON.";
		expect(() => json(invalidInput)).toThrow();
	});

	it("should throw an error when a non-JSON syntax error occurs", () => {
		const invalidJsonString = `{"name": "John Doe", "age": }`;
		expect(() => json(invalidJsonString)).toThrow();
	});

	it("should handle and recover from a JSON code block", () => {
		const mdString = dedent`
			\`\`\`json
			{"name": "John Doe", "age": 1}
			\`\`\`
		`;
		const expectedOutput = { name: "John Doe", age: 1 };
		expect(json(mdString)).toEqual(expectedOutput);
	});
});
