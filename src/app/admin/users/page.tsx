"use client";

import SkeletonCard from "@/components/SkeletonCard";
import {
    useAdminUsers,
    useDeleteUser,
    useUpdateUserStatus,
} from "@/hooks/useAdmin";
import { User } from "@/types";
import { ShieldOff, Trash2, UserCheck } from "lucide-react";

export default function AdminUsersPage() {
	const { data, isLoading } = useAdminUsers();
	const updateStatusMutation = useUpdateUserStatus();
	const deleteUserMutation = useDeleteUser();

	const users: User[] = data?.users ?? [];

	const handleToggleStatus = (user: User) => {
		const action = user.active === false ? "activate" : "deactivate";
		if (
			!confirm(
				`Are you sure you want to ${action} ${user.firstName} ${user.lastName}?`,
			)
		)
			return;
		updateStatusMutation.mutate({ id: user.id, active: user.active === false });
	};

	const handleDelete = (user: User) => {
		if (
			!confirm(
				`Permanently delete ${user.firstName} ${user.lastName}? This cannot be undone.`,
			)
		)
			return;
		deleteUserMutation.mutate(user.id);
	};

	const roleBadge = (role: string) => {
		const colors: Record<string, string> = {
			admin: "bg-red-100 text-red-700",
			recruiter: "bg-purple-100 text-purple-700",
			candidate: "bg-blue-100 text-blue-700",
		};
		return colors[role] ?? "bg-gray-100 text-gray-700";
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">User Management</h1>
				<p className="mt-1 text-gray-600">
					Manage all platform users · {data?.pagination?.total ?? 0} total
				</p>
			</div>

			{isLoading && (
				<div className="space-y-3">
					{[1, 2, 3, 4, 5].map((i) => (
						<SkeletonCard key={i} lines={1} />
					))}
				</div>
			)}

			{!isLoading && users.length > 0 && (
				<div className="card p-0 overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-sm">
							<thead className="bg-gray-50 border-b border-gray-200">
								<tr>
									<th className="text-left px-6 py-3 font-medium text-gray-600">
										Name
									</th>
									<th className="text-left px-6 py-3 font-medium text-gray-600">
										Email
									</th>
									<th className="text-left px-6 py-3 font-medium text-gray-600">
										Role
									</th>
									<th className="text-left px-6 py-3 font-medium text-gray-600">
										Status
									</th>
									<th className="text-left px-6 py-3 font-medium text-gray-600">
										Joined
									</th>
									<th className="text-right px-6 py-3 font-medium text-gray-600">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-100">
								{users.map((user: User) => (
									<tr key={user.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 font-medium text-gray-900">
											{user.firstName} {user.lastName}
										</td>
										<td className="px-6 py-4 text-gray-500">{user.email}</td>
										<td className="px-6 py-4">
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${roleBadge(user.role)}`}>
												{user.role}
											</span>
										</td>
										<td className="px-6 py-4">
											<span
												className={`px-2 py-1 rounded-full text-xs font-medium ${
													user.active === false
														? "bg-red-100 text-red-700"
														: "bg-green-100 text-green-700"
												}`}>
												{user.active === false ? "Inactive" : "Active"}
											</span>
										</td>
										<td className="px-6 py-4 text-gray-500">
											{user.createdAt
												? new Date(user.createdAt).toLocaleDateString(
														undefined,
														{
															year: "numeric",
															month: "short",
															day: "numeric",
														},
													)
												: "—"}
										</td>
										<td className="px-6 py-4">
											<div className="flex items-center justify-end gap-2">
												<button
													onClick={() => handleToggleStatus(user)}
													disabled={updateStatusMutation.isPending}
													className="p-1.5 rounded text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
													title={
														user.active === false
															? "Activate user"
															: "Deactivate user"
													}
													aria-label={
														user.active === false
															? "Activate user"
															: "Deactivate user"
													}>
													{user.active === false ? (
														<UserCheck className="w-4 h-4" />
													) : (
														<ShieldOff className="w-4 h-4" />
													)}
												</button>
												<button
													onClick={() => handleDelete(user)}
													disabled={deleteUserMutation.isPending}
													className="p-1.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
													aria-label="Delete user">
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{!isLoading && users.length === 0 && (
				<div className="card text-center py-12">
					<p className="text-gray-500">No users found.</p>
				</div>
			)}
		</div>
	);
}
