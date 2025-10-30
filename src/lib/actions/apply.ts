"use server"

import { revalidatePath } from 'next/cache';
import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';
import Job from '@/models/Job';

export async function submitApplication(formData: FormData) {
  try {
    await dbConnect();

    const jobId = formData.get('jobId') as string;
    const candidateName = formData.get('candidateName') as string;
    const candidateEmail = formData.get('candidateEmail') as string;
    const resumeFile = formData.get('resumeFile') as File;

    if (!jobId || !candidateName || !candidateEmail || !resumeFile) {
        throw new Error('Missing required fields');
    }

    // Call ATS analysis route
    const atsFormData = new FormData();
    atsFormData.append('resumeFile', resumeFile);

    // IMPORTANT: When calling a route from a server action, you need the full URL
    const atsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ats/analyze`, {
        method: 'POST',
        body: atsFormData,
    });
    
    const atsResult = await atsResponse.json();
    
    if (!atsResponse.ok) {
        throw new Error(atsResult.error || 'ATS analysis failed');
    }

    await Application.create({
      jobId,
      candidateName,
      candidateEmail,
      resumeUrl: "placeholder", // In a real app, you'd upload to a service like S3 and store the URL
      atsScore: atsResult.analysis.atsScore,
      status: 'Pending',
    });

    // Increment applications count on the Job model
    await Job.findByIdAndUpdate(jobId, { $inc: { applications: 1 } });
    
    // Revalidate the applications page to show the new application
    revalidatePath('/candidate/applications');

    return { success: true, message: 'Application submitted successfully!' };

  } catch (error) {
    const err = error as Error;
    return { success: false, error: err.message };
  }
}