"use client";

import { X } from "lucide-react";
import { KeyboardEvent, useState } from "react";

interface SkillsSelectorProps {
	value: string[];
	onChange: (skills: string[]) => void;
	placeholder?: string;
	suggestions?: string[];
}

const DEFAULT_SKILLS = [
	// Programming Languages
	"JavaScript",
	"TypeScript",
	"Python",
	"Java",
	"C++",
	"C#",
	"Go",
	"Rust",
	"PHP",
	"Ruby",
	"Swift",
	"Kotlin",
	"Dart",
	"Scala",

	// Frontend Technologies
	"React",
	"Vue.js",
	"Angular",
	"Svelte",
	"Next.js",
	"Nuxt.js",
	"HTML/CSS",
	"Sass/SCSS",
	"Tailwind CSS",
	"Bootstrap",
	"Material-UI",
	"Chakra UI",
	"Styled Components",

	// Backend Technologies
	"Node.js",
	"Express.js",
	"Django",
	"Flask",
	"FastAPI",
	"Spring Boot",
	"ASP.NET",
	"Laravel",
	"Ruby on Rails",
	"NestJS",

	// Databases
	"MongoDB",
	"PostgreSQL",
	"MySQL",
	"Redis",
	"SQLite",
	"DynamoDB",
	"Cassandra",
	"Elasticsearch",

	// Cloud & DevOps
	"AWS",
	"Azure",
	"Google Cloud Platform",
	"Docker",
	"Kubernetes",
	"Jenkins",
	"GitLab CI",
	"GitHub Actions",
	"Terraform",
	"Ansible",

	// Tools & Others
	"Git",
	"GraphQL",
	"REST API",
	"Microservices",
	"DevOps",
	"CI/CD",
	"Jest",
	"Cypress",
	"Webpack",
	"Vite",
	"Figma",
	"Adobe XD",
	"Photoshop",
	"Illustrator",

	// Soft Skills
	"UI/UX Design",
	"Product Management",
	"Agile",
	"Scrum",
	"Project Management",
	"Leadership",
	"Communication",
	"Problem Solving",
	"Team Collaboration",
	"Critical Thinking",
	"Time Management",
];

export default function SkillsSelector({
	value = [],
	onChange,
	placeholder = "Type a skill and press Enter",
	suggestions = DEFAULT_SKILLS,
}: SkillsSelectorProps) {
	const [inputValue, setInputValue] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(false);

	const filteredSuggestions = suggestions.filter(
		(skill) =>
			skill.toLowerCase().includes(inputValue.toLowerCase()) &&
			!value.includes(skill),
	);

	const addSkill = (skill: string) => {
		const trimmedSkill = skill.trim();
		if (trimmedSkill && !value.includes(trimmedSkill)) {
			onChange([...value, trimmedSkill]);
		}
		setInputValue("");
		setShowSuggestions(false);
	};

	const removeSkill = (skillToRemove: string) => {
		onChange(value.filter((skill) => skill !== skillToRemove));
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			if (inputValue.trim()) {
				addSkill(inputValue);
			}
		} else if (e.key === "Backspace" && !inputValue && value.length > 0) {
			removeSkill(value[value.length - 1]);
		} else if (e.key === "Escape") {
			setShowSuggestions(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setInputValue(newValue);
		setShowSuggestions(newValue.length > 0);
	};

	return (
		<div className="relative">
			{/* Skills Display */}
			<div className="min-h-[42px] p-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 bg-white">
				<div className="flex flex-wrap gap-2 items-center">
					{/* Selected Skills */}
					{value.map((skill) => (
						<span
							key={skill}
							className="inline-flex items-center px-2 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-700 border border-primary-200">
							{skill}
							<button
								type="button"
								onClick={() => removeSkill(skill)}
								className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary-200 focus:outline-none focus:bg-primary-200"
								aria-label={`Remove ${skill}`}>
								<X className="w-3 h-3" />
							</button>
						</span>
					))}

					{/* Input Field */}
					<input
						type="text"
						value={inputValue}
						onChange={handleInputChange}
						onKeyDown={handleKeyDown}
						onFocus={() => setShowSuggestions(inputValue.length > 0)}
						placeholder={value.length === 0 ? placeholder : ""}
						className="flex-1 min-w-[120px] outline-none bg-transparent text-sm placeholder-gray-400"
					/>
				</div>
			</div>

			{/* Suggestions Dropdown */}
			{showSuggestions && filteredSuggestions.length > 0 && (
				<div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
					{filteredSuggestions.slice(0, 10).map((skill) => (
						<button
							key={skill}
							type="button"
							onClick={() => addSkill(skill)}
							className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:bg-gray-50 focus:outline-none first:rounded-t-md last:rounded-b-md">
							{skill}
						</button>
					))}
					{filteredSuggestions.length > 10 && (
						<div className="px-3 py-2 text-xs text-gray-500 border-t border-gray-200">
							{filteredSuggestions.length - 10} more skills available...
						</div>
					)}
				</div>
			)}

			{/* Popular Skills (when no input) */}
			{!showSuggestions && value.length === 0 && (
				<div className="mt-2">
					<p className="text-xs text-gray-500 mb-2">Popular skills:</p>
					<div className="flex flex-wrap gap-1">
						{suggestions.slice(0, 8).map((skill) => (
							<button
								key={skill}
								type="button"
								onClick={() => addSkill(skill)}
								className="px-2 py-1 text-xs text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 focus:outline-none focus:bg-gray-200 transition-colors">
								+ {skill}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Help Text */}
			<p className="mt-1 text-xs text-gray-500">
				Type to search skills or select from suggestions. Press Enter to add
				custom skills.
			</p>
		</div>
	);
}
