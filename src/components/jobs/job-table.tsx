// src/components/jobs/job-table.tsx
"use client"

import { Job } from "./types"
import { JobRow } from "./job-row"

interface JobTableProps {
	jobs: Job[]
	onView: (job: Job) => void
	onEdit: (job: Job) => void
	onCopyUrl: (job: Job) => void
	onDelete: (job: Job) => void
}

export function JobTable({ jobs, onView, onEdit, onCopyUrl, onDelete }: JobTableProps) {
	return (
		<div className="bg-card rounded-lg border">
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead className="bg-muted/50">
						<tr>
							<th className="text-left p-4 font-medium text-sm">Job Title</th>
							<th className="text-left p-4 font-medium text-sm">Company</th>
							<th className="text-left p-4 font-medium text-sm">Skills</th>
							<th className="text-left p-4 font-medium text-sm">Location</th>
							<th className="text-left p-4 font-medium text-sm">Expiry Date</th>
							<th className="text-left p-4 font-medium text-sm">Status</th>
							<th className="text-left p-4 font-medium text-sm">Tools</th>
						</tr>
					</thead>
					<tbody>
						{jobs.map((job) => (
							<JobRow
								key={job._id}
								job={job}
								onView={onView}
								onEdit={onEdit}
								onCopyUrl={onCopyUrl}
								onDelete={onDelete}
							/>
						))}
					</tbody>
				</table>
			</div>
		</div>
	)
}