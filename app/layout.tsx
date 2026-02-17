import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
	title: 'Mini RAG Chat',
	description: 'RAG chatbot with document upload',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<head>
				<link rel='text/stylesheet' href='https://library.ucsd.edu/_resources/css/structured-content/global-structured-styles.css'/>
			</head>
			<body>
				<main className='pt-16'>{children}</main>
			</body>
		</html>
	);
}
