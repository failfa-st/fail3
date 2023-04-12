/**
 * Generates an array of schedule times, based on a length and a delay between items.
 *
 * @param {number} length - The length of the array to generate.
 * @param {number} delay - The delay in milliseconds between each item. Default is 10 seconds.
 *
 * @returns {number[]} An array of schedule times, based on the length and delay.
 */
export function getSchedule(length: number, delay = 10_000) {
	const now = Date.now();
	return Array.from({ length }, (_, index) => now + delay + index * delay);
}

/**
 * Waits until the specified timestamp before resolving the Promise.
 *
 * @param {number} timestamp - The Unix timestamp to wait for.
 * @returns {Promise<void>} - A Promise that resolves when the specified timestamp is reached.
 */
export async function wait(timestamp) {
	const now = Date.now();
	const delay = timestamp - now;
	return new Promise(resolve => {
		setTimeout(resolve, delay);
	});
}
