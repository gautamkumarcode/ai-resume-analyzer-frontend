import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/brand.css";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "NextRole - AI Resume Analyzer & Job Matching",
	description: "AI-powered resume analysis and job matching platform",
	icons: {
		icon: "/icon.png",
		shortcut: "/icon.png",
		apple: "/icon.png",
	},
	manifest: "/site.webmanifest",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="icon" href="/icon.png" type="image/png" />
				<link rel="apple-touch-icon" href="/icon.png" />
			</head>
			<body className={inter.className}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
