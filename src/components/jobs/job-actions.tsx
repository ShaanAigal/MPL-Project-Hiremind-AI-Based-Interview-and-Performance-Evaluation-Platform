"use client"

import { Button } from "@/components/ui/button"
import { Edit, Eye, Copy, Trash2 } from "lucide-react"
import type { Job, JobActionHandlers } from "./types"

interface JobActionsProps extends JobActionHandlers {
	job: Job
}

export function JobActions({ job, onView, onEdit, onCopyUrl, onDelete }: JobActionsProps) {
	return (
		<div className="flex items-center space-x-2">
			<Button
				variant="outline"
				size="sm"
				onClick={() => onView(job)}
				title="View Job"
			>
				<Eye className="h-3 w-3" />
			</Button>
			<Button
				variant="outline"
				size="sm"
				onClick={() => onEdit(job)}
				title="Edit Job"
			>
				<Edit className="h-3 w-3" />
			</Button>
			<Button
				variant="outline"
				size="sm"
				onClick={() => onCopyUrl(job)}
				title="Copy URL"
			>
				<Copy className="h-3 w-3" />
			</Button>
			<Button
				variant="outline"
				size="sm"
				onClick={() => onDelete(job)}
				title="Delete Job"
				className="text-red-600 hover:text-red-700 hover:bg-red-50"
			>
				<Trash2 className="h-3 w-3" />
			</Button>
		</div>
	)
}


