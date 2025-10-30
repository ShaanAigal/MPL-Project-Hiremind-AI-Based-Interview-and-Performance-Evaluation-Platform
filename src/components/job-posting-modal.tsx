"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { CreateJobForm } from '@/components/jobs/create-job-form'
import type { Job } from '@/components/jobs/types'

interface JobPostingModalProps {
  trigger?: React.ReactNode
  onCreate?: (job: Job) => void
}

export function JobPostingModal({ trigger, onCreate }: JobPostingModalProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Job Posting</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new job posting.
          </DialogDescription>
        </DialogHeader>
        <CreateJobForm
          onCreate={(job) => {
            onCreate?.(job)
            setOpen(false)
          }}
        />
      </DialogContent>
    </Dialog>
  )
} 