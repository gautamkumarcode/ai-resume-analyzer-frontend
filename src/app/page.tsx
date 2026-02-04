import { ArrowRight, Briefcase, FileText, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<header className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
				<nav className="container mx-auto px-6 py-4 flex justify-between items-center">
					<div className="flex items-center space-x-2">
						<Sparkles className="w-8 h-8" />
						<span className="text-xl font-bold">AI Resume Analyzer</span>
					</div>
					<div className="space-x-4">
						<Link href="/login" className="hover:underline">
							Login
						</Link>
						<Link
							href="/register"
							className="bg-white text-primary-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
							Get Started
						</Link>
					</div>
				</nav>

				<div className="container mx-auto px-6 py-20 text-center">
					<h1 className="text-5xl font-bold mb-6">
						Land Your Dream Job with AI-Powered Resume Analysis
					</h1>
					<p className="text-xl mb-8 max-w-2xl mx-auto text-primary-100">
						Upload your resume, get instant AI feedback, and match with jobs
						that fit your skills perfectly.
					</p>
					<Link
						href="/register"
						className="inline-flex items-center bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
						Start Free Analysis
						<ArrowRight className="ml-2 w-5 h-5" />
					</Link>
				</div>
			</header>

			{/* Features Section */}
			<section className="py-20 bg-gray-50">
				<div className="container mx-auto px-6">
					<h2 className="text-3xl font-bold text-center mb-12">
						Everything You Need to Succeed
					</h2>

					<div className="grid md:grid-cols-3 gap-8">
						<div className="card text-center">
							<div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<FileText className="w-8 h-8 text-primary-600" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Resume Analysis</h3>
							<p className="text-gray-600">
								Get detailed AI feedback on your resume including strengths,
								improvements, and keyword optimization.
							</p>
						</div>

						<div className="card text-center">
							<div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<Briefcase className="w-8 h-8 text-primary-600" />
							</div>
							<h3 className="text-xl font-semibold mb-2">Job Matching</h3>
							<p className="text-gray-600">
								Match your resume against job descriptions to see compatibility
								scores and get personalized recommendations.
							</p>
						</div>

						<div className="card text-center">
							<div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<Sparkles className="w-8 h-8 text-primary-600" />
							</div>
							<h3 className="text-xl font-semibold mb-2">AI Recommendations</h3>
							<p className="text-gray-600">
								Receive tailored suggestions to improve your resume and increase
								your chances of landing interviews.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20 bg-primary-600 text-white">
				<div className="container mx-auto px-6 text-center">
					<h2 className="text-3xl font-bold mb-4">
						Ready to Optimize Your Resume?
					</h2>
					<p className="text-xl mb-8 text-primary-100">
						Join thousands of job seekers who have improved their resumes with
						AI
					</p>
					<Link
						href="/register"
						className="inline-flex items-center bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors">
						Get Started for Free
						<ArrowRight className="ml-2 w-5 h-5" />
					</Link>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-gray-900 text-gray-400 py-8">
				<div className="container mx-auto px-6 text-center">
					<p>&copy; 2024 AI Resume Analyzer. All rights reserved.</p>
				</div>
			</footer>
		</div>
	);
}
