"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import AnalysisReport from '@/components/ats/AnalysisReport';
import ResumeViewer from '@/components/ResumeViewer';

interface ApplicationDetails {
    _id: string;
    candidateName: string;
    candidateEmail: string;
    atsScore: number;
    atsAnalysis: any;
    resumeData: string; // Base64 encoded resume content
    resumeFileName: string;
    resumeFileType: string;
    resumeText?: string; // Extracted text content
}

export default function ApplicantDetailsPage({ params }: { params: { applicationId: string } }) {
    const [application, setApplication] = useState<ApplicationDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
    const fetchApplicationDetails = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/applications/${params.applicationId}`);
            const data = await res.json();
            if (data.success) {
                setApplication(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch application details:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchApplicationDetails();
}, [params.applicationId]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!application) {
        return <div className="p-6 text-center">Application details not found.</div>;
    }

    return (
        <div className="p-6">
            <Card>
                <CardHeader>
                    <CardTitle>{application.candidateName}</CardTitle>
                    <CardDescription>{application.candidateEmail}</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Resume Section */}
                        <div className="flex justify-between items-center p-4 border rounded-lg">
                            <div>
                                <h3 className="font-semibold">Resume</h3>
                                <p className="text-sm text-muted-foreground">
                                    {application.resumeFileName}
                                </p>
                            </div>
                            <ResumeViewer
                                resumeData={application.resumeData}
                                resumeFileName={application.resumeFileName}
                                resumeFileType={application.resumeFileType}
                                resumeText={application.resumeText}
                                candidateName={application.candidateName}
                            />
                        </div>

                        {/* ATS Analysis Section */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3">Resume Analysis Report</h3>
                            {application.atsAnalysis ? (
                                <AnalysisReport data={application.atsAnalysis} />
                            ) : (
                                <p>No ATS analysis available for this candidate.</p>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}