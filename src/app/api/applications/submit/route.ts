import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';
import Job from '@/models/Job';
import { analyzeResumeWithFallback } from '@/lib/ats-analyzer';

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const formData = await request.formData();
    const jobId = formData.get('jobId') as string;
    const candidateName = formData.get('candidateName') as string;
    const candidateEmail = formData.get('candidateEmail') as string;
    const resumeFile = formData.get('resumeFile') as File;

    if (!jobId || !candidateName || !candidateEmail || !resumeFile) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // --- START: DUPLICATE APPLICATION CHECK ---
    // Check if an application with the same email already exists for this job
    const existingApplication = await Application.findOne({
      jobId: jobId,
      candidateEmail: candidateEmail,
    });

    // If an application is found, return an error
    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: 'You have already applied for this job.' },
        { status: 409 } // Using 409 Conflict status code
      );
    }
    // --- END: DUPLICATE APPLICATION CHECK ---

    // Convert resume file to base64 for storage
    const resumeBuffer = await resumeFile.arrayBuffer();
    const resumeBase64 = Buffer.from(resumeBuffer).toString('base64');

    // Extract resume text for viewing (same logic as ATS analyze route)
    let resumeText = '';
    try {
      if (resumeFile.type === 'application/pdf') {
        const pdfParse = (await import('pdf-parse')).default;
        const pdfData = await pdfParse(Buffer.from(resumeBuffer));
        resumeText = pdfData.text;
      } else if (resumeFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const mammoth = (await import('mammoth')).default;
        const docxResult = await mammoth.extractRawText({ buffer: Buffer.from(resumeBuffer) });
        resumeText = docxResult.value;
      }
    } catch (parseError) {
      console.error('Error extracting resume text:', parseError);
      // Continue without resume text - not critical for application submission
    }

    // Run ATS analysis locally (avoid internal multipart call)
    const analysis = analyzeResumeWithFallback(resumeText, undefined, undefined);

    // Save the new application to the database
    const application = await Application.create({
      jobId,
      candidateName,
      candidateEmail,
      resumeData: resumeBase64,
      resumeFileName: resumeFile.name,
      resumeFileType: resumeFile.type,
      resumeText: resumeText,
      atsScore: analysis.atsScore,
      atsAnalysis: analysis,
      status: 'Pending',
    });

    // Increment the application count for the job
    await Job.findByIdAndUpdate(jobId, { $inc: { applications: 1 } });

    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}