interface SkeletonCardProps {
	lines?: number;
	className?: string;
}

/**
 * Generic skeleton placeholder for card-shaped content.
 */
export default function SkeletonCard({
	lines = 3,
	className = "",
}: SkeletonCardProps) {
	return (
		<div className={`card animate-pulse ${className}`}>
			<div className="flex items-center space-x-4 mb-4">
				<div className="w-12 h-12 rounded-lg bg-gray-200" />
				<div className="flex-1 space-y-2">
					<div className="h-4 bg-gray-200 rounded w-3/4" />
					<div className="h-3 bg-gray-200 rounded w-1/2" />
				</div>
			</div>
			<div className="space-y-2">
				{Array.from({ length: lines }).map((_, i) => (
					<div
						key={i}
						className="h-3 bg-gray-200 rounded"
						style={{ width: `${100 - i * 10}%` }}
					/>
				))}
			</div>
		</div>
	);
}
