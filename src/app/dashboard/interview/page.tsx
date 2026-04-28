"use client";

import RoleGuard from "@/components/RoleGuard";
import { useResumes } from "@/hooks/useResume";
import api from "@/lib/api";
import { interviewService } from "@/services/interview.service";
import { ApiResponse, Interview, Job, Resume } from "@/types";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CheckCircle, Loader2, MicOff, Phone, PhoneOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

// ── Types ─────────────────────────────────────────────────────────────────
type ConvMessage = { role: "assistant" | "user"; text: string };
type CallState =
	| "idle"
	| "connecting"
	| "active"
	| "thinking"
	| "speaking"
	| "ended";

// ── TTS hook — ElevenLabs (human voice) with browser fallback ─────────────
const FEMALE_VOICE_NAMES = [
	"Google US English",
	"Google UK English Female",
	"Samantha",
	"Karen",
	"Microsoft Jenny",
	"Microsoft Aria",
	"Microsoft Zira",
];

function getBrowserFemaleVoice(): SpeechSynthesisVoice | null {
	const voices = window.speechSynthesis.getVoices();
	for (const name of FEMALE_VOICE_NAMES) {
		const v = voices.find((v) => v.name === name || v.name.includes(name));
		if (v) return v;
	}
	const femaleKw = [
		"female",
		"woman",
		"zira",
		"jenny",
		"aria",
		"samantha",
		"karen",
	];
	return (
		voices.find(
			(v) =>
				v.lang.startsWith("en") &&
				femaleKw.some((k) => v.name.toLowerCase().includes(k)),
		) ??
		voices.find((v) => v.lang.startsWith("en-US")) ??
		null
	);
}

function useTTS() {
	const [speaking, setSpeaking] = useState(false);
	const [voiceReady, setVoiceReady] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	useEffect(() => {
		const load = () => {
			if (window.speechSynthesis.getVoices().length > 0) setVoiceReady(true);
		};
		load();
		window.speechSynthesis.addEventListener("voiceschanged", load);
		return () =>
			window.speechSynthesis.removeEventListener("voiceschanged", load);
	}, []);

	// ElevenLabs via backend proxy — returns true if successful
	const speakElevenLabs = useCallback(
		async (text: string): Promise<boolean> => {
			try {
				const token =
					typeof window !== "undefined" ? localStorage.getItem("token") : null;
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/interviews/tts`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							...(token ? { Authorization: `Bearer ${token}` } : {}),
						},
						body: JSON.stringify({ text }),
					},
				);
				if (!res.ok || res.headers.get("content-type")?.includes("json"))
					return false;
				const blob = await res.blob();
				const url = URL.createObjectURL(blob);
				return new Promise((resolve) => {
					const audio = new Audio(url);
					audioRef.current = audio;
					audio.onplay = () => setSpeaking(true);
					audio.onended = () => {
						setSpeaking(false);
						URL.revokeObjectURL(url);
						resolve(true);
					};
					audio.onerror = () => {
						setSpeaking(false);
						URL.revokeObjectURL(url);
						resolve(false);
					};
					audio.play().catch(() => resolve(false));
				});
			} catch {
				return false;
			}
		},
		[],
	);

	// Browser SpeechSynthesis fallback
	const speakBrowser = useCallback((text: string): Promise<void> => {
		return new Promise((resolve) => {
			window.speechSynthesis.cancel();
			const utter = new SpeechSynthesisUtterance(text);
			utter.rate = 0.88;
			utter.pitch = 1.1;
			utter.volume = 1;
			const voice = getBrowserFemaleVoice();
			if (voice) utter.voice = voice;
			utter.onstart = () => setSpeaking(true);
			utter.onend = () => {
				setSpeaking(false);
				resolve();
			};
			utter.onerror = () => {
				setSpeaking(false);
				resolve();
			};
			window.speechSynthesis.speak(utter);
		});
	}, []);

	const speak = useCallback(
		async (text: string): Promise<void> => {
			const success = await speakElevenLabs(text);
			if (!success) await speakBrowser(text);
		},
		[speakElevenLabs, speakBrowser],
	);

	const cancel = useCallback(() => {
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.currentTime = 0;
		}
		window.speechSynthesis.cancel();
		setSpeaking(false);
	}, []);

	return { speak, cancel, speaking, voiceReady };
}

// ── STT hook with silence detection ──────────────────────────────────────
declare global {
	interface Window {
		SpeechRecognition: any;
		webkitSpeechRecognition: any;
	}
}

function useSTT(onFinalTranscript: (text: string) => void) {
	const recRef = useRef<any>(null);
	const [listening, setListening] = useState(false);
	const [interim, setInterim] = useState("");
	const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const finalBuffer = useRef("");
	const shouldListenRef = useRef(false); // true = keep listening
	const callbackRef = useRef(onFinalTranscript);
	const processingRef = useRef(false); // true = answer being processed, don't restart

	// Always keep callback ref fresh — no stale closure
	useEffect(() => {
		callbackRef.current = onFinalTranscript;
	}, [onFinalTranscript]);

	const supported =
		typeof window !== "undefined" &&
		("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

	const clearSilenceTimer = () => {
		if (silenceTimer.current) {
			clearTimeout(silenceTimer.current);
			silenceTimer.current = null;
		}
	};

	const startRecognition = useCallback(() => {
		if (!supported) return;
		const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
		const rec = new SR();
		rec.continuous = true;
		rec.interimResults = true;
		rec.lang = "en-US";
		rec.maxAlternatives = 1;

		rec.onstart = () => {
			setListening(true);
			finalBuffer.current = "";
			setInterim("");
		};

		rec.onresult = (e: any) => {
			if (processingRef.current) return;
			let interimText = "";
			for (let i = e.resultIndex; i < e.results.length; i++) {
				const t = e.results[i][0].transcript;
				if (e.results[i].isFinal) {
					finalBuffer.current += t + " ";
				} else {
					interimText += t;
				}
			}
			setInterim(finalBuffer.current + interimText);

			// Reset silence timer on every speech event
			clearSilenceTimer();
			silenceTimer.current = setTimeout(() => {
				const text = finalBuffer.current.trim();
				if (text && shouldListenRef.current && !processingRef.current) {
					processingRef.current = true;
					finalBuffer.current = "";
					setInterim("");
					rec.stop(); // stop before calling callback
					callbackRef.current(text);
				}
			}, 1800); // 1.8s silence = done speaking
		};

		rec.onend = () => {
			setListening(false);
			// Auto-restart if we should still be listening and not processing
			if (shouldListenRef.current && !processingRef.current) {
				setTimeout(() => {
					if (shouldListenRef.current && !processingRef.current) {
						startRecognition();
					}
				}, 200);
			}
		};

		rec.onerror = (e: any) => {
			if (e.error === "aborted" || e.error === "no-speech") return; // expected
			console.error("STT error:", e.error);
			setListening(false);
		};

		recRef.current = rec;
		try {
			rec.start();
		} catch {
			/* already started */
		}
	}, [supported]);

	const start = useCallback(() => {
		if (!supported) return;
		shouldListenRef.current = true;
		processingRef.current = false;
		finalBuffer.current = "";
		setInterim("");
		startRecognition();
	}, [supported, startRecognition]);

	// Called after answer is processed — re-enable listening
	const resume = useCallback(() => {
		processingRef.current = false;
		if (shouldListenRef.current) {
			setTimeout(() => startRecognition(), 300);
		}
	}, [startRecognition]);

	const stop = useCallback(() => {
		shouldListenRef.current = false;
		processingRef.current = false;
		clearSilenceTimer();
		recRef.current?.stop();
		setListening(false);
		setInterim("");
		finalBuffer.current = "";
	}, []);

	return { start, stop, resume, listening, interim, supported };
}

// ── Gemini conversational API call ────────────────────────────────────────
async function askGemini(
	systemPrompt: string,
	history: ConvMessage[],
	userMessage: string,
): Promise<string> {
	const res = await api.post<ApiResponse<{ reply: string }>>(
		"/interviews/chat",
		{
			systemPrompt,
			history,
			userMessage,
		},
	);
	return res.data.data!.reply;
}

// ── Page wrapper ──────────────────────────────────────────────────────────
export default function InterviewPage() {
	return (
		<RoleGuard role="candidate">
			<InterviewContent />
		</RoleGuard>
	);
}

// ── Main content ──────────────────────────────────────────────────────────
function InterviewContent() {
	const [callState, setCallState] = useState<CallState>("idle");
	const [selectedJobId, setSelectedJobId] = useState("");
	const [selectedResumeId, setSelectedResumeId] = useState("");
	const [messages, setMessages] = useState<ConvMessage[]>([]);
	const [interview, setInterview] = useState<Interview | null>(null);
	const [result, setResult] = useState<Interview | null>(null);
	const [systemPrompt, setSystemPrompt] = useState("");
	const [answeredCount, setAnsweredCount] = useState(0);
	const MAX_QUESTIONS = 5;

	const { data: resumes } = useResumes({ enabled: true });
	const { data: jobsData } = useQuery({
		queryKey: ["jobs"],
		queryFn: async () => {
			const res = await api.get<ApiResponse<{ jobs: Job[] }>>("/jobs");
			return res.data.data!.jobs;
		},
	});

	const tts = useTTS();
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const conversationRef = useRef<ConvMessage[]>([]);
	const answeredCountRef = useRef(0);
	const systemPromptRef = useRef("");
	const callStateRef = useRef<CallState>("idle");
	const interviewRef = useRef<Interview | null>(null);

	// Keep refs in sync with state
	useEffect(() => {
		conversationRef.current = messages;
	}, [messages]);
	useEffect(() => {
		systemPromptRef.current = systemPrompt;
	}, [systemPrompt]);
	useEffect(() => {
		callStateRef.current = callState;
	}, [callState]);
	useEffect(() => {
		interviewRef.current = interview;
	}, [interview]);

	// Auto-scroll chat
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Forward-declare sttControls ref so handleUserAnswer can call it
	const sttStartRef = useRef<() => void>(() => {});

	// ── Handle user answer ──
	const handleUserAnswer = useCallback(
		async (text: string) => {
			if (callStateRef.current !== "active") return;

			const userMsg: ConvMessage = { role: "user", text };
			const updatedHistory = [...conversationRef.current, userMsg];
			setMessages(updatedHistory);

			const newAnswered = answeredCountRef.current + 1;
			answeredCountRef.current = newAnswered;
			setAnsweredCount(newAnswered);
			setCallState("thinking");
			callStateRef.current = "thinking";

			try {
				const isLast = newAnswered >= MAX_QUESTIONS;
				const reply = await askGemini(
					systemPromptRef.current,
					updatedHistory,
					text,
				);
				const assistantMsg: ConvMessage = { role: "assistant", text: reply };
				const finalHistory = [...updatedHistory, assistantMsg];
				setMessages(finalHistory);

				setCallState("speaking");
				callStateRef.current = "speaking";
				await tts.speak(reply);

				const isDone =
					isLast ||
					reply.toLowerCase().includes("thank you for your time") ||
					reply.toLowerCase().includes("interview is complete");

				if (isDone) {
					setCallState("ended");
					callStateRef.current = "ended";
					submitInterviewRef.current(finalHistory);
				} else {
					setCallState("active");
					callStateRef.current = "active";
					sttControls.resume();
				}
			} catch (err) {
				console.error(err);
				toast.error("Connection issue. Please try again.");
				setCallState("active");
				callStateRef.current = "active";
				sttControls.resume();
			}
		},
		[tts],
	); // eslint-disable-line

	const sttControls = useSTT(handleUserAnswer);

	// Wire up the forward ref
	useEffect(() => {
		sttStartRef.current = sttControls.resume;
	}, [sttControls.resume]);

	// ── Submit for evaluation (stable ref) ──
	const submitInterviewRef = useRef(async (history: ConvMessage[]) => {});
	useEffect(() => {
		submitInterviewRef.current = async (history: ConvMessage[]) => {
			const iv = interviewRef.current;
			if (!iv) return;
			try {
				const userMsgs = history.filter((m) => m.role === "user");
				const qaPairs = iv.answers.map((a, i) => ({
					question: a.question,
					answer: userMsgs[i]?.text ?? "",
				}));
				const evaluated = await interviewService.submitInterview(
					iv._id,
					qaPairs,
				);
				setResult(evaluated);
			} catch (err) {
				console.error("Failed to evaluate:", err);
			}
		};
	}, []);
	const startMutation = useMutation({
		mutationFn: () =>
			interviewService.startInterview(selectedJobId, selectedResumeId),
		onSuccess: async (data) => {
			setInterview(data);
			interviewRef.current = data;
			answeredCountRef.current = 0;
			setAnsweredCount(0);

			const job = jobsData?.find((j: Job) => j._id === selectedJobId);
			const resume = resumes?.find((r: Resume) => r._id === selectedResumeId);

			const questions = data.answers
				.map((a, i) => `${i + 1}. ${a.question}`)
				.join("\n");
			const prompt = `You are Alex, a professional AI interviewer conducting a real-time voice interview for the position of ${job?.title ?? "the role"} at ${job?.company ?? "the company"}.

Candidate resume summary: ${resume?.fileName ?? "provided resume"}

You have these ${MAX_QUESTIONS} questions prepared:
${questions}

RULES:
- Ask ONE question at a time, in order
- Keep responses SHORT (1-2 sentences max)
- After the candidate answers, give brief acknowledgment (5-10 words), then ask the next question
- After all ${MAX_QUESTIONS} questions, say "Thank you for your time. The interview is complete." and nothing else
- Be warm, professional, and encouraging
- Do NOT repeat questions already asked
- Start by greeting the candidate and asking question 1`;

			setSystemPrompt(prompt);
			systemPromptRef.current = prompt;
			setCallState("speaking");
			callStateRef.current = "speaking";

			const greeting = `Hello! I'm Alex, your AI interviewer today. I'll be asking you ${MAX_QUESTIONS} questions. Just speak naturally after each question — I'll listen automatically. Let's begin. ${data.answers[0]?.question}`;

			const firstMsg: ConvMessage = { role: "assistant", text: greeting };
			setMessages([firstMsg]);
			conversationRef.current = [firstMsg];

			await tts.speak(greeting);
			setCallState("active");
			callStateRef.current = "active";
			sttControls.start();
		},
		onError: (e: any) => {
			toast.error(e.response?.data?.message || "Failed to start interview");
			setCallState("idle");
		},
	});

	// ── End call manually ──
	const endCall = () => {
		tts.cancel();
		sttControls.stop();
		setCallState("ended");
		callStateRef.current = "ended";
		if (interviewRef.current && conversationRef.current.length > 1) {
			submitInterviewRef.current(conversationRef.current);
		}
	};

	// ── Fit level colors ──
	const fitColors: Record<string, string> = {
		excellent: "bg-green-100 text-green-700",
		good: "bg-blue-100 text-blue-700",
		average: "bg-yellow-100 text-yellow-700",
		poor: "bg-red-100 text-red-700",
	};

	// ── Setup screen ──────────────────────────────────────────────────────
	if (callState === "idle") {
		return (
			<div className="max-w-xl mx-auto space-y-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">
						AI Voice Interview
					</h1>
					<p className="mt-1 text-gray-600">
						Fully conversational — the AI interviewer speaks, you answer
						naturally. No buttons needed.
					</p>
				</div>

				<div className="bg-primary-50 border border-primary-200 rounded-xl p-4 text-sm text-primary-800 space-y-2">
					<p className="font-semibold">How it works</p>
					<ul className="space-y-1 text-primary-700">
						<li>🎙️ AI asks questions out loud</li>
						<li>🗣️ You speak your answer — it auto-detects when you stop</li>
						<li>🤖 AI responds and asks the next question instantly</li>
						<li>
							📊 Results shared with recruiter after all {MAX_QUESTIONS}{" "}
							questions
						</li>
					</ul>
				</div>

				<div className="card space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Job Position
						</label>
						<select
							value={selectedJobId}
							onChange={(e) => setSelectedJobId(e.target.value)}
							className="input">
							<option value="">Select a job...</option>
							{jobsData?.map((job: Job) => (
								<option key={job._id} value={job._id}>
									{job.title} — {job.company}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Your Resume
						</label>
						<select
							value={selectedResumeId}
							onChange={(e) => setSelectedResumeId(e.target.value)}
							className="input">
							<option value="">Select a resume...</option>
							{resumes?.map((r: Resume) => (
								<option key={r._id} value={r._id}>
									{r.fileName}
								</option>
							))}
						</select>
					</div>

					<button
						onClick={() => {
							setCallState("connecting");
							startMutation.mutate();
						}}
						disabled={
							!selectedJobId || !selectedResumeId || startMutation.isPending
						}
						className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-base">
						{startMutation.isPending ? (
							<>
								<Loader2 className="w-5 h-5 animate-spin" /> Preparing
								interview...
							</>
						) : (
							<>
								<Phone className="w-5 h-5" /> Start Interview
							</>
						)}
					</button>
				</div>
			</div>
		);
	}

	// ── Connecting screen ─────────────────────────────────────────────────
	if (callState === "connecting") {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
				<div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
					<Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
				</div>
				<p className="text-lg font-medium text-gray-700">
					Connecting to your interviewer...
				</p>
			</div>
		);
	}

	// ── Results screen ────────────────────────────────────────────────────
	if (callState === "ended" && result) {
		return (
			<div className="max-w-2xl mx-auto space-y-6">
				<div className="text-center">
					<CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
					<h1 className="text-3xl font-bold text-gray-900">
						Interview Complete!
					</h1>
					<p className="text-gray-600 mt-1">
						Results shared with the recruiter.
					</p>
				</div>

				<div className="card text-center">
					<p className="text-sm text-gray-500 mb-1">Overall Score</p>
					<p className="text-5xl font-bold text-primary-600">
						{result.overallScore}
					</p>
					<p className="text-sm text-gray-400 mb-3">out of 100</p>
					<span
						className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold capitalize ${fitColors[result.fitLevel] ?? ""}`}>
						{result.fitLevel} fit
					</span>
					<p className="mt-4 text-gray-600 text-sm leading-relaxed">
						{result.summary}
					</p>
				</div>

				<div className="grid md:grid-cols-2 gap-4">
					<div className="card">
						<h3 className="font-semibold text-gray-900 mb-3">Strengths</h3>
						<ul className="space-y-2">
							{result.strengths.map((s, i) => (
								<li
									key={i}
									className="flex items-start gap-2 text-sm text-gray-600">
									<span className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
									{s}
								</li>
							))}
						</ul>
					</div>
					<div className="card">
						<h3 className="font-semibold text-gray-900 mb-3">
							Areas to Improve
						</h3>
						<ul className="space-y-2">
							{result.concerns.map((c, i) => (
								<li
									key={i}
									className="flex items-start gap-2 text-sm text-gray-600">
									<span className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0" />
									{c}
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className="card space-y-3">
					<h3 className="font-semibold text-gray-900">Answer Breakdown</h3>
					{result.answers.map((a, i) => (
						<div key={i} className="border border-gray-200 rounded-lg p-4">
							<div className="flex justify-between items-start gap-4 mb-2">
								<p className="text-sm font-medium text-gray-900">
									{a.question}
								</p>
								<span
									className={`text-sm font-bold flex-shrink-0 ${a.score >= 7 ? "text-green-600" : a.score >= 5 ? "text-yellow-600" : "text-red-600"}`}>
									{a.score}/10
								</span>
							</div>
							<p className="text-xs text-gray-500 italic mb-1">
								&ldquo;{a.answer || "No answer"}&rdquo;
							</p>
							<p className="text-xs text-gray-600">{a.feedback}</p>
						</div>
					))}
				</div>

				<button
					onClick={() => {
						setCallState("idle");
						setResult(null);
						setMessages([]);
						setInterview(null);
						setAnsweredCount(0);
					}}
					className="btn-secondary w-full">
					Start New Interview
				</button>
			</div>
		);
	}

	// ── Ended but still evaluating ────────────────────────────────────────
	if (callState === "ended" && !result) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
				<Loader2 className="w-12 h-12 animate-spin text-primary-600" />
				<p className="text-lg font-medium text-gray-700">
					Evaluating your interview...
				</p>
			</div>
		);
	}

	// ── Active call screen ────────────────────────────────────────────────
	return (
		<div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
			{/* Header */}
			<div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
				<div className="flex items-center gap-3">
					<div className="relative">
						<div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg">
							A
						</div>
						{/* Status dot */}
						<span
							className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
								callState === "active"
									? "bg-green-500"
									: callState === "thinking"
										? "bg-yellow-500 animate-pulse"
										: callState === "speaking"
											? "bg-blue-500 animate-pulse"
											: "bg-gray-400"
							}`}
						/>
					</div>
					<div>
						<p className="font-semibold text-gray-900">Alex — AI Interviewer</p>
						<p className="text-xs text-gray-500">
							{callState === "active"
								? "🎙️ Listening..."
								: callState === "thinking"
									? "💭 Thinking..."
									: callState === "speaking"
										? "🔊 Speaking..."
										: ""}
						</p>
					</div>
				</div>
				<div className="flex items-center gap-3">
					<span className="text-sm text-gray-500">
						{answeredCount}/{MAX_QUESTIONS} answered
					</span>
					<button
						onClick={endCall}
						className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium">
						<PhoneOff className="w-4 h-4" />
						End
					</button>
				</div>
			</div>

			{/* Chat messages */}
			<div className="flex-1 overflow-y-auto space-y-4 pr-1">
				{messages.map((msg, i) => (
					<div
						key={i}
						className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
						{msg.role === "assistant" && (
							<div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 mt-1">
								A
							</div>
						)}
						<div
							className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
								msg.role === "assistant"
									? "bg-gray-100 text-gray-900 rounded-tl-sm"
									: "bg-primary-600 text-white rounded-tr-sm"
							}`}>
							{msg.text}
						</div>
					</div>
				))}

				{/* Thinking indicator */}
				{callState === "thinking" && (
					<div className="flex justify-start">
						<div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0">
							A
						</div>
						<div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
							<div className="flex items-center gap-1">
								{[0, 1, 2].map((i) => (
									<div
										key={i}
										className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
										style={{ animationDelay: `${i * 0.15}s` }}
									/>
								))}
							</div>
						</div>
					</div>
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Bottom status bar */}
			<div className="mt-4 pt-4 border-t border-gray-200">
				<div
					className={`flex items-center justify-center gap-3 py-3 px-4 rounded-xl transition-all ${
						sttControls.listening
							? "bg-red-50 border border-red-200"
							: callState === "speaking"
								? "bg-blue-50 border border-blue-200"
								: "bg-gray-50 border border-gray-200"
					}`}>
					{sttControls.listening ? (
						<>
							<div className="flex items-end gap-0.5 h-5">
								{[2, 4, 3, 5, 2, 4, 3].map((h, i) => (
									<div
										key={i}
										className="w-1 bg-red-500 rounded-full animate-bounce"
										style={{
											height: `${h * 3}px`,
											animationDelay: `${i * 0.08}s`,
											animationDuration: "0.5s",
										}}
									/>
								))}
							</div>
							<span className="text-sm font-medium text-red-700">
								Listening...
							</span>
							{sttControls.interim && (
								<span className="text-xs text-red-500 truncate max-w-xs italic">
									&ldquo;{sttControls.interim}&rdquo;
								</span>
							)}
						</>
					) : callState === "speaking" ? (
						<>
							<div className="flex items-end gap-0.5 h-5">
								{[3, 5, 4, 6, 3, 5, 4].map((h, i) => (
									<div
										key={i}
										className="w-1 bg-blue-500 rounded-full animate-bounce"
										style={{
											height: `${h * 3}px`,
											animationDelay: `${i * 0.08}s`,
											animationDuration: "0.6s",
										}}
									/>
								))}
							</div>
							<span className="text-sm font-medium text-blue-700">
								Alex is speaking...
							</span>
						</>
					) : callState === "thinking" ? (
						<>
							<Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />
							<span className="text-sm font-medium text-yellow-700">
								Processing your answer...
							</span>
						</>
					) : (
						<>
							<MicOff className="w-4 h-4 text-gray-400" />
							<span className="text-sm text-gray-500">Waiting...</span>
						</>
					)}
				</div>
				<p className="text-center text-xs text-gray-400 mt-2">
					Speak naturally — silence is auto-detected after 1.5 seconds
				</p>
			</div>
		</div>
	);
}
