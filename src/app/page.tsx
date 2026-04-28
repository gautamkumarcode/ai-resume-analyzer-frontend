import GuestGuard from "@/components/GuestGuard";
import Navbar from "@/components/Navbar";
import {
	ArrowRight,
	BarChart3,
	Briefcase,
	CheckCircle,
	FileText,
	TrendingUp,
	Upload,
	Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// ── Data ──────────────────────────────────────────────────────────────────

const FEATURES = [
	{
		icon: FileText,
		color: "bg-blue-100 text-blue-600",
		title: "AI Resume Analysis",
		description:
			"Upload your resume and get instant, detailed feedback — strengths, improvements, keyword gaps, and an overall score powered by Gemini AI.",
	},
	{
		icon: Briefcase,
		color: "bg-green-100 text-green-600",
		title: "Job Board",
		description:
			"Recruiters post real job listings with full details. Candidates browse, filter by type, and find roles that match their skills.",
	},
	{
		icon: TrendingUp,
		color: "bg-purple-100 text-purple-600",
		title: "Smart Job Matching",
		description:
			"Match your resume against any job description. Get a compatibility score, matched/missing skills, and personalised recommendations.",
	},
	{
		icon: BarChart3,
		color: "bg-orange-100 text-orange-600",
		title: "Match Analytics",
		description:
			"Track all your matches in one place. Filter by score, expand details, and see exactly what to improve to land the interview.",
	},
	{
		icon: Zap,
		color: "bg-yellow-100 text-yellow-600",
		title: "Role-Based Access",
		description:
			"Two distinct experiences — candidates analyse resumes and match with jobs, recruiters post and manage listings.",
	},
	{
		icon: CheckCircle,
		color: "bg-teal-100 text-teal-600",
		title: "Instant Feedback",
		description:
			"No waiting. AI analysis runs on upload. Re-analyse any time to track your progress as you improve your resume.",
	},
];

const STEPS = [
	{
		step: "01",
		role: "Candidate",
		title: "Upload your resume",
		description:
			"Drop a PDF or DOCX. Our AI parses it instantly and gives you a detailed score with actionable feedback.",
		icon: Upload,
		color: "bg-blue-600",
	},
	{
		step: "02",
		role: "Candidate",
		title: "Browse & match jobs",
		description:
			"Pick any job from the board and run an AI match. See your compatibility score, skill gaps, and what to fix.",
		icon: TrendingUp,
		color: "bg-purple-600",
	},
	{
		step: "03",
		role: "Recruiter",
		title: "Post job listings",
		description:
			"Create detailed job posts with requirements, skills, and salary. Your listings are instantly visible to all candidates.",
		icon: Briefcase,
		color: "bg-green-600",
	},
];

const STATS = [
	{ value: "AI-Powered", label: "Resume scoring" },
	{ value: "2 Roles", label: "Candidate & Recruiter" },
	{ value: "Instant", label: "Analysis on upload" },
	{ value: "100%", label: "Free to get started" },
];

// ── Page ──────────────────────────────────────────────────────────────────

export default function HomePage() {
	return (
		<GuestGuard>
			<Navbar />
			<div className="min-h-screen bg-white">
				{/* ── Hero ── */}
				<section className="relative overflow-hidden bg-brand-gradient text-white">
					{/* Decorative blobs */}
					<div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />
					<div className="absolute -bottom-32 -left-16 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

					<div className="relative container mx-auto px-6 py-24 lg:py-32 text-center">
						{/* Badge */}
						<div className="inline-flex items-center space-x-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
							<div className="w-4 h-4 bg-yellow-300 rounded-full flex items-center justify-center">
								<span className="text-xs">✨</span>
							</div>
							<span>Powered by Google Gemini AI</span>
						</div>

						<h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 max-w-4xl mx-auto">
							Land your dream job with{" "}
							<span className="text-yellow-300">AI-powered</span> resume
							analysis
						</h1>

						<p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto mb-10 leading-relaxed">
							Upload your resume, get instant AI feedback, match with real job
							listings, and know exactly what to improve — all in one platform.
						</p>

						<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
							<Link
								href="/register"
								className="btn-brand inline-flex items-center px-8 py-3.5 rounded-xl font-semibold text-base shadow-lg">
								Start for free
								<ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
							</Link>
							<Link
								href="/login"
								className="inline-flex items-center text-white border border-white/30 px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-white/10 transition-colors">
								Sign in
							</Link>
						</div>

						{/* Stats row */}
						<div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
							{STATS.map((s) => (
								<div key={s.label} className="text-center">
									<p className="text-2xl font-bold text-white">{s.value}</p>
									<p className="text-sm text-primary-200 mt-1">{s.label}</p>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* ── Features ── */}
				<section id="features" className="py-20 bg-gray-50">
					<div className="container mx-auto px-6">
						<div className="text-center mb-14">
							<h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
								Everything you need to succeed
							</h2>
							<p className="text-gray-500 max-w-xl mx-auto text-lg">
								One platform for job seekers and recruiters — built around AI
								that actually helps.
							</p>
						</div>

						<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{FEATURES.map((f) => {
								const Icon = f.icon;
								return (
									<div
										key={f.title}
										className="card hover:shadow-md transition-shadow group">
										<div
											className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}
											aria-hidden="true">
											<Icon className="w-6 h-6" />
										</div>
										<h3 className="text-lg font-semibold text-gray-900 mb-2">
											{f.title}
										</h3>
										<p className="text-gray-500 text-sm leading-relaxed">
											{f.description}
										</p>
									</div>
								);
							})}
						</div>
					</div>
				</section>

				{/* ── How it works ── */}
				<section id="how-it-works" className="py-20 bg-white">
					<div className="container mx-auto px-6">
						<div className="text-center mb-14">
							<h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
								How it works
							</h2>
							<p className="text-gray-500 max-w-xl mx-auto text-lg">
								Get up and running in minutes — whether you&apos;re a job seeker
								or a recruiter.
							</p>
						</div>

						<div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
							{STEPS.map((s, i) => {
								const Icon = s.icon;
								return (
									<div key={s.step} className="relative text-center">
										{/* Connector line */}
										{i < STEPS.length - 1 && (
											<div className="hidden md:block absolute top-10 left-[calc(50%+2.5rem)] w-[calc(100%-5rem)] h-px bg-gray-200" />
										)}

										<div
											className={`w-20 h-20 rounded-2xl ${s.color} flex items-center justify-center mx-auto mb-5 shadow-lg`}
											aria-hidden="true">
											<Icon className="w-9 h-9 text-white" />
										</div>

										<span className="inline-block text-xs font-bold text-gray-400 tracking-widest uppercase mb-2">
											Step {s.step} · {s.role}
										</span>
										<h3 className="text-xl font-semibold text-gray-900 mb-3">
											{s.title}
										</h3>
										<p className="text-gray-500 text-sm leading-relaxed">
											{s.description}
										</p>
									</div>
								);
							})}
						</div>
					</div>
				</section>

				{/* ── Role split CTA ── */}
				<section className="py-20 bg-gray-50">
					<div className="container mx-auto px-6">
						<div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
							{/* Candidate */}
							<div className="bg-gradient-to-br from-blue-600 to-primary-700 rounded-2xl p-8 text-white">
								<div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-5">
									<FileText className="w-6 h-6 text-white" aria-hidden="true" />
								</div>
								<h3 className="text-2xl font-bold mb-3">For Job Seekers</h3>
								<ul className="space-y-2 text-blue-100 text-sm mb-6">
									{[
										"Upload PDF or DOCX resume",
										"Get AI score & detailed feedback",
										"Browse real job listings",
										"Match resume to jobs instantly",
										"Track all your match results",
									].map((item) => (
										<li key={item} className="flex items-center space-x-2">
											<CheckCircle
												className="w-4 h-4 text-blue-300 flex-shrink-0"
												aria-hidden="true"
											/>
											<span>{item}</span>
										</li>
									))}
								</ul>
								<Link
									href="/register"
									className="inline-flex items-center bg-white text-primary-700 px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors">
									Start as Candidate
									<ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
								</Link>
							</div>

							{/* Recruiter */}
							<div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-8 text-white">
								<div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-5">
									<Briefcase
										className="w-6 h-6 text-white"
										aria-hidden="true"
									/>
								</div>
								<h3 className="text-2xl font-bold mb-3">For Recruiters</h3>
								<ul className="space-y-2 text-green-100 text-sm mb-6">
									{[
										"Post detailed job listings",
										"Add requirements & skills",
										"Include salary ranges",
										"Manage all your listings",
										"Reach all platform candidates",
									].map((item) => (
										<li key={item} className="flex items-center space-x-2">
											<CheckCircle
												className="w-4 h-4 text-green-300 flex-shrink-0"
												aria-hidden="true"
											/>
											<span>{item}</span>
										</li>
									))}
								</ul>
								<Link
									href="/register"
									className="inline-flex items-center bg-white text-green-700 px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-green-50 transition-colors">
									Start as Recruiter
									<ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
								</Link>
							</div>
						</div>
					</div>
				</section>

				{/* ── Final CTA ── */}
				<section className="py-20 bg-primary-600 text-white">
					<div className="container mx-auto px-6 text-center">
						<h2 className="text-3xl sm:text-4xl font-bold mb-4">
							Ready to get started?
						</h2>
						<p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
							Join candidates and recruiters already using NextRole to make
							smarter hiring decisions.
						</p>
						<Link
							href="/register"
							className="inline-flex items-center bg-white text-primary-700 px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-gray-50 transition-colors shadow-lg">
							Create free account
							<ArrowRight className="ml-2 w-5 h-5" aria-hidden="true" />
						</Link>
					</div>
				</section>

				{/* ── Footer ── */}
				<footer className="bg-gray-900 text-gray-400 py-10">
					<div className="container mx-auto px-6">
						<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
							<Link href="/" className="flex items-center">
								<Image
									src="/logo.png"
									alt="NextRole"
									width={120}
									height={40}
									className="object-contain h-8 w-auto"
								/>
							</Link>
							<p className="text-sm">
								&copy; {new Date().getFullYear()} NextRole. All rights reserved.
							</p>
							<div className="flex items-center space-x-6 text-sm">
								<Link
									href="/login"
									className="hover:text-white transition-colors">
									Sign in
								</Link>
								<Link
									href="/register"
									className="hover:text-white transition-colors">
									Register
								</Link>
							</div>
						</div>
					</div>
				</footer>
			</div>
		</GuestGuard>
	);
}
