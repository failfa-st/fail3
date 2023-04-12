import { isSyntaxError } from "../index.ts";

describe("isSyntaxError", () => {
	it("should return true for an instance of SyntaxError", () => {
		const error = new SyntaxError("Invalid syntax");
		expect(isSyntaxError(error)).toBe(true);
	});

	it("should return false for an instance of TypeError", () => {
		const error = new TypeError("Invalid type");
		expect(isSyntaxError(error)).toBe(false);
	});

	it("should return false for an object that is not an error", () => {
		const object = { message: "Not an error" };
		expect(isSyntaxError(object)).toBe(false);
	});

	it("should return false for a string", () => {
		const string = "Not an error";
		expect(isSyntaxError(string)).toBe(false);
	});

	it("should return false for a number", () => {
		const number = 123;
		expect(isSyntaxError(number)).toBe(false);
	});

	it("should return false for null", () => {
		const nullValue = null;
		expect(isSyntaxError(nullValue)).toBe(false);
	});

	it("should return false for undefined", () => {
		const undefinedValue = undefined;
		expect(isSyntaxError(undefinedValue)).toBe(false);
	});
});
