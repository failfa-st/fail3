import { dedent } from "../../utils/string.ts";
import { extractMarkdownCodeBlock } from "../index.ts";

describe("extractMarkdownCodeBlock", () => {
	it("should extract the language and content of a code block with backticks", () => {
		const mdString = dedent`
			\`\`\`javascript
			const hello = 'world';
			console.log(hello);
			\`\`\`
		`.trim();
		const expectedOutput = {
			language: "javascript",
			content: "const hello = 'world';\nconsole.log(hello);\n",
		};
		expect(extractMarkdownCodeBlock(mdString)).toEqual(expectedOutput);
	});

	it("should extract the content of a code block with backticks when the language is not specified", () => {
		const mdString = dedent`
			This is some text.

			\`\`\`
			const hello = 'world';
			console.log(hello);
			\`\`\`

			This is more text.
		`;
		const expectedOutput = {
			language: undefined,
			content: "const hello = 'world';\nconsole.log(hello);\n",
		};
		expect(extractMarkdownCodeBlock(mdString)).toEqual(expectedOutput);
	});

	it("should extract the language and content of a code block with tildes", () => {
		const mdString = dedent`
			This is some text.

			\`\`\`typescript
			const hello: string = 'world';
			console.log(hello);
			\`\`\`

			This is more text.
		`;
		const expectedOutput = {
			language: "typescript",
			content: "const hello: string = 'world';\nconsole.log(hello);\n",
		};
		expect(extractMarkdownCodeBlock(mdString)).toEqual(expectedOutput);
	});

	it("should correctly extract a JSON code block surrounded by triple backticks", () => {
		const mdString = `\`\`\`json\n{"foo": 1}\n\`\`\``;
		const expectedOutput = { language: "json", content: '{"foo": 1}\n' };
		expect(extractMarkdownCodeBlock(mdString)).toEqual(expectedOutput);
	});

	it("should correctly extract a JSON code block surrounded by triple backticks with trailing whitespace", () => {
		const mdString = `\`\`\`json\n{"foo": 1}\n   \`\`\``;
		const expectedOutput = { language: "json", content: '{"foo": 1}\n   ' };
		expect(extractMarkdownCodeBlock(mdString)).toEqual(expectedOutput);
	});

	it("should correctly extract a JSON code block surrounded by triple backticks with leading whitespace", () => {
		const mdString = `   \`\`\`json\n{"foo": 1}\n\`\`\``;
		const expectedOutput = { language: "json", content: '{"foo": 1}\n' };
		expect(extractMarkdownCodeBlock(mdString)).toEqual(expectedOutput);
	});

	it("should correctly extract a JSON code block surrounded by double backticks with escaped backticks", () => {
		const mdString = `\\\`\`\`json\n{"foo": 1}\n\`\`\``;
		const expectedOutput = { language: "json", content: '{"foo": 1}\n' };
		expect(extractMarkdownCodeBlock(mdString)).toEqual(expectedOutput);
	});

	it("should return null if no code block is found", () => {
		const mdString = `
      This is some text.

      This is more text.
    `;
		const expectedOutput = null;
		expect(extractMarkdownCodeBlock(mdString)).toEqual(expectedOutput);
	});

	it("should return null if the input is an empty string", () => {
		const mdString = "";
		const expectedOutput = null;
		expect(extractMarkdownCodeBlock(mdString)).toEqual(expectedOutput);
	});
});
