"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import dayjs from 'dayjs';
import { Loader2 } from 'lucide-react'; // Import Loader2 for loading state

interface Candidate {
    _id: string;
    candidateName: string;
    status: string;
    interviewScore: number;
    interviewDate: string | null;
    hasCompletedInterview?: boolean;
}

interface JobWithCandidates {
    _id:string;
    title: string;
    company: string;
    candidates: Candidate[];
}

export default function CandidateDetailsPage({ params }: { params: { jobId: string } }) {
    const [jobDetails, setJobDetails] = useState<JobWithCandidates | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchJobDetails = async () => {
            // Keep setLoading(true) only at the beginning if you fetch only once
            // setLoading(true); // Can be removed if you only fetch once
            try {
                const res = await fetch(`/api/interviews/${params.jobId}`);
                const data = await res.json();
                if (data.success) {
                    setJobDetails(data.data);
                } else {
                    // Handle error, e.g., show an error message
                    console.error("API Error:", data.error);
                }
            } catch (error) {
                console.error("Failed to fetch job details:", error);
                 // Handle fetch error
            } finally {
                setLoading(false); // Set loading to false after fetch completes
            }
        };

        fetchJobDetails(); // Fetch data only once when the component mounts

        // REMOVED: Interval causing the continuous loading
        // const interval = setInterval(fetchJobDetails, 3000);
        // return () => clearInterval(interval);

    }, [params.jobId]); 

    return (
        <div className="p-6">
            {loading ? (
                 // Use Loader2 for a better loading indicator
                <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : jobDetails ? (
                <Card>
                    <CardHeader>
                        <CardTitle>{jobDetails.title} - {jobDetails.company}</CardTitle>
                        <CardDescription>Candidates in the interview stage</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto"> {/* Added for responsiveness */}
                            <table className="w-full text-sm"> {/* Use text-sm for smaller text */}
                                <thead className="bg-muted/50"> {/* Use muted background for header */}
                                    <tr className="text-left text-muted-foreground"> {/* Use muted foreground for header text */}
                                        <th className="p-3 font-medium">Sr No</th> {/* Use p-3 and font-medium */}
                                        <th className="p-3 font-medium">Candidate Name</th>
                                        <th className="p-3 font-medium">Status</th>
                                        <th className="p-3 font-medium">Interview Score</th>
                                        <th className="p-3 font-medium">Interview Date</th>
                                        <th className="p-3 font-medium">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jobDetails.candidates.map((candidate, index) => (
                                        <tr key={candidate._id} className="border-b last:border-b-0 hover:bg-muted/30"> {/* Added hover effect */}
                                            <td className="p-3">{index + 1}</td> {/* Use p-3 */}
                                            <td className="p-3 font-medium">{candidate.candidateName}</td> {/* Make name medium weight */}
                                            <td className="p-3">{candidate.status}</td>
                                            <td className="p-3 font-semibold"> {/* Make score semibold */}
                                                {candidate.hasCompletedInterview && candidate.interviewScore > 0
                                                    ? `${candidate.interviewScore}%`
                                                    : candidate.status === 'Completed-Interview' ? 'Processing...' : 'N/A'
                                                }
                                            </td>
                                            <td className="p-3 text-muted-foreground"> {/* Use muted foreground for date */}
                                                {candidate.interviewDate
                                                    ? dayjs(candidate.interviewDate).format('MMMM D, YYYY')
                                                    : 'N/A'
                                                }
                                            </td>
                                            <td className="p-3">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => router.push(`/recruiter/candidates/${params.jobId}/${candidate._id}`)}
                                                    disabled={!candidate.hasCompletedInterview}
                                                >
                                                    View Details
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <p className="text-center py-10 text-muted-foreground">No job details found or failed to load.</p> // Improved empty state message
            )}
        </div>
    );
}