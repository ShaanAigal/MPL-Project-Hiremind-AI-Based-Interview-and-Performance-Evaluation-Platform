// src/components/jobs/types.ts
export type JobStatus = "Active" | "Expired";

export interface Job {
	_id: string;
	id?: number; // Keep for now, but primary key is _id
	title: string;
	company: string;
	skills: string[];
	location: string;
	expiryDate: string; // ISO string
	status: JobStatus;
	applications: number;
	description?: string;
	salaryRange?: string;
}

export interface JobActionHandlers {
	onView: (job: Job) => void;
	onEdit: (job: Job) => void;
	onCopyUrl: (job: Job) => void;
	onDelete: (job: Job) => void;
}