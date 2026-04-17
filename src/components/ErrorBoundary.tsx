"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error("ErrorBoundary caught:", error, info);
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null });
	};

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) return this.props.fallback;

			return (
				<div className="min-h-[400px] flex items-center justify-center p-8">
					<div className="text-center max-w-md">
						<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<AlertTriangle className="w-8 h-8 text-red-600" />
						</div>
						<h2 className="text-xl font-semibold text-gray-900 mb-2">
							Something went wrong
						</h2>
						<p className="text-gray-500 mb-6 text-sm">
							{this.state.error?.message ?? "An unexpected error occurred."}
						</p>
						<button
							onClick={this.handleReset}
							className="btn-primary inline-flex items-center">
							<RefreshCw className="w-4 h-4 mr-2" />
							Try again
						</button>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
