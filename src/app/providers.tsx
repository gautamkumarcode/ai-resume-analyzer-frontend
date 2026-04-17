"use client";

import { AuthProvider } from "@/lib/auth-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "react-hot-toast";

export function Providers({ children }: { children: React.ReactNode }) {
	const [queryClient] = useState(
		() =>
			new QueryClient({
				defaultOptions: {
					queries: {
						staleTime: 60 * 1000,
						refetchOnWindowFocus: false,
						retry: 1,
					},
				},
			}),
	);

	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				{children}
				<Toaster
					position="top-right"
					toastOptions={{
						duration: 4000,
						style: {
							borderRadius: "10px",
							fontSize: "14px",
						},
					}}
				/>
			</AuthProvider>
		</QueryClientProvider>
	);
}
