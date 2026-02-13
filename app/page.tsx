'use client';

import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { text } from 'stream/consumers';
export default function Home() {
	const [input, setInput] = useState('');
	const [messages, setMessages] = useState<
		Array<{
			id: string;
			role: 'user' | 'assistant';
			content: string;
		}>
	>([]);
	const [isStreaming, setIsStreaming] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	
	// Auto-scroll to bottom of messages
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);
	
	const handleChatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!input.trim() || isStreaming) return;
		
		const userInput = input;
		setInput('');
		
		// Add user message to UI
		const userMessage = {
			id: uuidv4(),
			role: 'user' as const,
			content: userInput,
		};
		
		setMessages((prev) => [...prev, userMessage]);
		
		// Build messages array including current input for API
		const currentMessages = [
			...messages,
			{ role: 'user' as const, content: userInput },
		];
		
		try {
			// Step 1: Select agent and get summarized query
			const agentResponse = await fetch('/api/select-agent', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: currentMessages }),
			});
			
			const { agent, query, offTopic } = await agentResponse.json();
			if (offTopic) {
				const assistantMessageId = uuidv4();
				setMessages((prev) => [
					...prev,
					{
						id: assistantMessageId,
						role: 'assistant',
						content: `This message is too off topic for me to meaningfully enage. Stick to topics related to article or linkined post generation.`,
					},
				]);
				return;
			}
			// Step 2: Make direct API call
			setIsStreaming(true);
			const response = await fetch('/api/chat', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					messages: currentMessages,
					agent,
					query,
				}),
			});
			
			if (!response.ok) {
				console.error('Error from chat API:', await response.text());
				return;
			}
			// Create a new assistant message
			const assistantMessageId = uuidv4();
			setMessages((prev) => [
				...prev,
				{
					id: assistantMessageId,
					role: 'assistant',
					content: '',
				},
			]);
			
			// Get the response stream and process it
			const reader = response.body?.getReader();
			const decoder = new TextDecoder();
			let assistantResponse = '';
			
			if (reader) {
				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					
					const chunk = decoder.decode(value);
					assistantResponse += chunk;
					// Update the assistant message with the accumulated response
					setMessages((prev) =>
						prev.map((msg) =>
							msg.id === assistantMessageId
					? { ...msg, content: assistantResponse }
					: msg
				)
			);
		}
	}
	console.log("Response!",assistantResponse)
} catch (error) {
	console.error('Error in chat:', error);
} finally {
	setIsStreaming(false);
}
};

return (
	<div className='min-h-screen p-8 max-w-4xl mx-auto'>
			<h1 className='text-3xl font-bold mb-8'>Triton Lib-Assitant</h1>


			{/* Chat Section */}
			<div className='border rounded p-4 '>

				<div className='h-96 overflow-y-auto mb-4 space-y-4'>
					{messages.map((message) => (
						<div
						key={message.id}
						className={`p-3 rounded ${message.role === 'user'
							? 'bg-blue-100 ml-8'
							: 'bg-gray-100 mr-8'
						}`}
						>
							<p className='font-semibold mb-1'>
								{message.role === 'user' ? 'You' : 'AI Assistant'}
							</p>
							<div className='whitespace-pre-wrap'>
								<Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
							</div>
						</div>
					))}
					{isStreaming && !messages[messages.length - 1]?.content && (
						<div className='p-3 rounded bg-gray-100 mr-8'>
							<p className='text-gray-500'>Thinking...</p>
						</div>
					)}
					<div ref={messagesEndRef} />
				</div>

				<form onSubmit={handleChatSubmit} className='flex gap-2'>
					<input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder='Ask me anything about the Library&apos;s services or share your research question...'
						className='flex-1 p-2 border rounded'
						disabled={isStreaming}
						/>
					<button
						type='submit'
						disabled={isStreaming || !input.trim()}
						className='px-6 py-2 bg-green-600 text-black rounded disabled:bg-gray-400'
						>
						{isStreaming ? 'Sending...' : 'Send'}
					</button>
				</form>
			</div>
		</div>
	);
}