import { getLastWords } from "./chunking";
describe("Get Last Words", ()=>{
		test('grabs last words of current chunk for overlap', ()=>{
			const text = "React Hooks are awesome";
			const maxLength = 10;
			const result = getLastWords(text,maxLength);
            expect(result).toBe("are awesome");
		})
	})