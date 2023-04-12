import { removeNewlines } from "../index.ts";

describe("removeNewlines", () => {
	it("should return the same string when there are no newlines", () => {
		const input = "hello";
		const expectedOutput = "hello";
		expect(removeNewlines(input)).toEqual(expectedOutput);
	});

	it("should remove a single newline from the input string", () => {
		const input = "hello\nworld";
		const expectedOutput = "hello world";
		expect(removeNewlines(input)).toEqual(expectedOutput);
	});

	it("should remove multiple newlines from the input string", () => {
		const input = "hello\n\n\nworld";
		const expectedOutput = "hello world";
		expect(removeNewlines(input)).toEqual(expectedOutput);
	});

	it("should replace newlines with the specified replacer string", () => {
		const input = "hello\nworld";
		const expectedOutput = "hello_world";
		expect(removeNewlines(input, "_")).toEqual(expectedOutput);
	});

	it("should remove newlines at the beginning of the input string", () => {
		const input = "\n\nhello\nworld";
		const expectedOutput = "hello world";
		expect(removeNewlines(input)).toEqual(expectedOutput);
	});

	it("should remove newlines at the end of the input string", () => {
		const input = "hello\nworld\n\n\n";
		const expectedOutput = "hello world";
		expect(removeNewlines(input)).toEqual(expectedOutput);
	});

	it("should replace newlines at the beginning of the input string with the specified replacer string", () => {
		const input = "\n\nhello\nworld";
		const expectedOutput = "hello_world";
		expect(removeNewlines(input, "_")).toEqual(expectedOutput);
	});

	it("should replace newlines at the end of the input string with the specified replacer string", () => {
		const input = "hello\nworld\n\n\n";
		const expectedOutput = "hello_world";
		expect(removeNewlines(input, "_")).toEqual(expectedOutput);
	});

	it("should return an empty string when the input is an empty string", () => {
		const input = "";
		const expectedOutput = "";
		expect(removeNewlines(input)).toEqual(expectedOutput);
	});
});
