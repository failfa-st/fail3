import { trim } from "../index.ts";

describe("trim", () => {
	it("should return the same string when there is no leading or trailing whitespace", () => {
		const input = "hello";
		const expectedOutput = "hello";
		expect(trim(input)).toEqual(expectedOutput);
	});

	it("should trim leading and trailing whitespace from the input string", () => {
		const input = "   hello    ";
		const expectedOutput = "hello";
		expect(trim(input)).toEqual(expectedOutput);
	});

	it("should trim all whitespace when the input string contains only whitespace", () => {
		const input = "    ";
		const expectedOutput = "";
		expect(trim(input)).toEqual(expectedOutput);
	});

	it("should trim tabs and newlines in addition to spaces", () => {
		const input = "\n\t  hello\t\n   ";
		const expectedOutput = "hello";
		expect(trim(input)).toEqual(expectedOutput);
	});

	it("should return an empty string when the input is an empty string", () => {
		const input = "";
		const expectedOutput = "";
		expect(trim(input)).toEqual(expectedOutput);
	});
});
