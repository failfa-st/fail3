import { removeLeadingSpaces } from "../index.ts";

describe("removeLeadingSpaces", () => {
	it("should return the same string when there are no leading spaces", () => {
		const input = "hello";
		const expectedOutput = "hello";
		expect(removeLeadingSpaces(input)).toEqual(expectedOutput);
	});

	it("should remove leading spaces from the input string", () => {
		const input = "   hello";
		const expectedOutput = "hello";
		expect(removeLeadingSpaces(input)).toEqual(expectedOutput);
	});

	it("should remove leading tabs from the input string", () => {
		const input = "\t\thello";
		const expectedOutput = "hello";
		expect(removeLeadingSpaces(input)).toEqual(expectedOutput);
	});

	it("should replace leading spaces with the specified replacer string", () => {
		const input = "   hello";
		const expectedOutput = "_hello";
		expect(removeLeadingSpaces(input, "_")).toEqual(expectedOutput);
	});

	it("should replace leading tabs with the specified replacer string", () => {
		const input = "\t\thello";
		const expectedOutput = "_hello";
		expect(removeLeadingSpaces(input, "_")).toEqual(expectedOutput);
	});

	it("should remove leading spaces when the input string contains newlines", () => {
		const input = "  \n  hello";
		const expectedOutput = "\nhello";
		expect(removeLeadingSpaces(input)).toEqual(expectedOutput);
	});

	it("should replace leading spaces with the specified replacer string when the input string contains newlines", () => {
		const input = "  \n  hello";
		const expectedOutput = "_\n_hello";
		expect(removeLeadingSpaces(input, "_")).toEqual(expectedOutput);
	});

	it("should return an empty string when the input is an empty string", () => {
		const input = "";
		const expectedOutput = "";
		expect(removeLeadingSpaces(input)).toEqual(expectedOutput);
	});
});
