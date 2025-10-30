"use client"

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Job } from '@/components/jobs/types';
import { Loader2 } from 'lucide-react';

const applySchema = z.object({
  candidateName: z.string().min(1, 'Your name is required'),
  candidateEmail: z.string().email('Invalid email address'),
  resumeFile: z
    .any()
    .refine((files) => files?.length > 0, 'Please select a file.')
    .refine((files) => files?.[0]?.size <= 10 * 1024 * 1024, 'File size must be less than 10MB.')
    .refine(
      (files) => ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(files?.[0]?.type),
      'Only .pdf and .docx formats are supported.'
    ),
});

type ApplyFormValues = z.infer<typeof applySchema>;

interface ApplyFormProps {
    job: Job;
    onClose: () => void;
}

// Function to call our new API endpoint
const postApplication = async (formData: FormData) => {
    const response = await fetch('/api/applications/submit', {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit application');
    }
    return response.json();
};

export default function ApplyForm({ job, onClose }: ApplyFormProps) {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<ApplyFormValues>({
        resolver: zodResolver(applySchema),
        mode: 'onChange',
    });

    const mutation = useMutation({
        mutationFn: postApplication,
        onSuccess: () => {
            router.push('/candidate/applications/submitted');
        },
    });

    const onSubmit = (values: ApplyFormValues) => {
        const formData = new FormData();
        formData.append('jobId', job._id);
        formData.append('candidateName', values.candidateName);
        formData.append('candidateEmail', values.candidateEmail);
        formData.append('resumeFile', values.resumeFile[0]);
        mutation.mutate(formData);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
             <div>
                <h2 className="text-2xl font-bold">Apply for {job.title}</h2>
                <p className="text-muted-foreground">{job.company}</p>
            </div>
            <div className="space-y-2">
                <Label htmlFor="candidateName">Your Name</Label>
                <Input id="candidateName" {...register('candidateName')} />
                {errors.candidateName && <p className="text-red-600 text-sm">{errors.candidateName.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="candidateEmail">Email</Label>
                <Input id="candidateEmail" type="email" {...register('candidateEmail')} />
                {errors.candidateEmail && <p className="text-red-600 text-sm">{errors.candidateEmail.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="resumeFile">Resume</Label>
                <Input id="resumeFile" type="file" accept=".pdf,.docx" {...register('resumeFile')} />
                 {errors.resumeFile && <p className="text-sm text-red-600">{errors.resumeFile.message as string}</p>}
                <p className="text-xs text-muted-foreground">PDF or DOCX, max 10MB</p>
            </div>
            {mutation.error && <p className="text-sm text-red-600">{(mutation.error as Error).message}</p>}
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button type="button" className="w-full" disabled={!isValid || mutation.isPending}>
                        Submit Application
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to submit this application?
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSubmit(onSubmit)} disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Yes, Submit
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </form>
    );
}