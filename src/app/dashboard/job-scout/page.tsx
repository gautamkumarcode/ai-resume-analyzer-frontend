"use client";

import JobScoutPanel from "@/components/JobScoutPanel";
import RoleGuard from "@/components/RoleGuard";

export default function JobScoutPage() {
	return (
		<RoleGuard role="candidate">
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Job Scout Bot</h1>
					<p className="mt-1 text-gray-600">
						Let the bot rank jobs against your resume and apply with one click.
					</p>
				</div>
				<JobScoutPanel />
			</div>
		</RoleGuard>
	);
}
