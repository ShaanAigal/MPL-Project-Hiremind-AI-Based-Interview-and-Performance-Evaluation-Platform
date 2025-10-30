"use client"

import { useMemo, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Search, Filter, Loader2, Briefcase, Clock } from "lucide-react"
import dayjs from "dayjs"
import { JobTable } from "@/components/jobs/job-table"
import { JobPostingModal } from "@/components/job-posting-modal"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CreateJobForm } from "@/components/jobs/create-job-form"
import type { Job } from "@/components/jobs/types"

export default function JobListings() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [viewJob, setViewJob] = useState<Job | null>(null)
  const [editJob, setEditJob] = useState<Job | null>(null)

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if (data.success) {
        setJobs(data.data);
      } else {
        console.error("API Error:", data.error);
      }
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    const q = query.trim().toLowerCase()
    return jobs.filter((job) => {
      return !q || job.title.toLowerCase().includes(q) || job.company.toLowerCase().includes(q)
    })
  }, [jobs, query])

  function handleView(job: Job) {
    setViewJob(job)
  }
  function handleEdit(job: Job) {
    setEditJob(job)
  }
  
  // FIX: Updated this function
  function handleCopyUrl(job: Job) {
    const url = `${window.location.origin}/jobs/${job._id}`;
    navigator.clipboard.writeText(url);
    alert("Public job URL copied to clipboard!"); 
  }

  async function handleDelete(job: Job) {
    if (confirm("Are you sure you want to delete this job?")) {
      try {
        await fetch(`/api/jobs/${job._id}`, { method: 'DELETE' });
        await fetchJobs();
      } catch (error) {
        console.error("Failed to delete job:", error);
      }
    }
  }
  async function handleCreate(newJobData: Omit<Job, '_id'>) {
    try {
      await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJobData),
      });
      await fetchJobs();
    } catch (error) {
      console.error("Failed to create job:", error);
    }
  }
  
  async function handleUpdate(updatedJob: Job) {
    if (!editJob) return;
    try {
      const payload = { ...editJob, ...updatedJob };
      await fetch(`/api/jobs/${editJob._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
      });
      await fetchJobs();
      setEditJob(null);
    } catch (error) {
        console.error("Failed to update job:", error);
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Job Listings</h1>
            <p className="text-muted-foreground">Manage your job postings and track applications</p>
          </div>
          <JobPostingModal onCreate={handleCreate as (job: Job) => void} />
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search jobs by title..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-4 py-2 bg-muted rounded-md text-sm focus-outline-none focus:ring-2 focus:ring-primary w-full"
          />
        </div>
        {/* <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button> */}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredJobs.length > 0 ? (
        <JobTable jobs={filteredJobs} onView={handleView} onEdit={handleEdit} onCopyUrl={handleCopyUrl} onDelete={handleDelete} />
      ) : (
        <div className="text-center py-16 bg-card border rounded-lg">
            <h3 className="text-xl font-semibold">No jobs found</h3>
            <p className="text-muted-foreground mt-2">
                {query ? `No results for "${query}". Try a different search.` : "Get started by posting a new job."}
            </p>
        </div>
      )}

      {/* View Job Modal */}
      <Dialog open={!!viewJob} onOpenChange={(open) => !open && setViewJob(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewJob?.title}</DialogTitle>
            <DialogDescription>
              {viewJob?.company} • {viewJob?.location}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
            <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className={`px-2 py-1 text-xs rounded-full ${viewJob?.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{viewJob?.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{viewJob?.applications} applications</span>
            </div>
            {viewJob?.salaryRange && <p className="text-sm"><b>Salary:</b> {viewJob.salaryRange}</p>}
             <p className="text-sm"><b>Expires:</b> {dayjs(viewJob?.expiryDate).format("DD/MM/YYYY")}</p>
            <div className="flex flex-wrap gap-1">
              {viewJob?.skills.map((s) => (
                <span key={s} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  {s}
                </span>
              ))}
            </div>
            {viewJob?.description && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{viewJob.description}</p>}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Job Modal */}
      <Dialog open={!!editJob} onOpenChange={(open) => !open && setEditJob(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>Update the fields and save your changes.</DialogDescription>
          </DialogHeader>
          {editJob && (
            <CreateJobForm
              initialValues={editJob}
              submitLabel="Save Changes"
              onSubmit={handleUpdate}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}