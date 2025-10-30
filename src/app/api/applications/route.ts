import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Application from '@/models/Application';
import Job from '@/models/Job';

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

    const resumeBuffer = await resumeFile.arrayBuffer();
    const resumeBase64 = Buffer.from(resumeBuffer).toString('base64');

    // Call ATS analysis route (best-effort)
    let atsResult: any = { analysis: { atsScore: 0 } };
    try {
      const atsFormData = new FormData();
      atsFormData.append('resumeFile', resumeFile);
      const atsResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ats/analyze`, {
        method: 'POST',
        body: atsFormData,
      });
      atsResult = await atsResponse.json();
    } catch (e) {
      console.warn('ATS analysis failed (continuing):', e);
    }

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
    }

    const application = await Application.create({
      jobId,
      candidateName,
      candidateEmail,
      resumeData: resumeBase64,
      resumeFileName: resumeFile.name,
      resumeFileType: resumeFile.type,
      resumeText: resumeText,
      atsScore: atsResult?.analysis?.atsScore,
      score: atsResult?.analysis?.score, // Save overall score
      atsAnalysis: atsResult?.analysis,
      status: 'Pending',
    });

    await Job.findByIdAndUpdate(jobId, { $inc: { applications: 1 } });

    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const statusFilter = searchParams.get('status');

  try {
    let query: any = {};

    // Get user email from query params
    const userEmail = searchParams.get('email');
    if (userEmail) {
      query.candidateEmail = userEmail;
    }

    if (statusFilter && statusFilter !== 'all') {
      query.status = statusFilter;
    }

    const skip = (page - 1) * limit;
    const totalApplications = await Application.countDocuments(query);
    const applications = await Application.find(query)
      .populate({ path: 'jobId', model: Job, select: 'title company _id' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: applications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalApplications / limit),
        totalApplications: totalApplications,
        limit: limit,
      },
    });
  } catch (error) {
    const err = error as Error;
    console.error('Error fetching applications:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}