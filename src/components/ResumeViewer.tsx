"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Eye, Loader2 } from 'lucide-react';

interface ResumeViewerProps {
  resumeData: string; // Base64 encoded resume
  resumeFileName: string;
  resumeFileType: string;
  resumeText?: string; // Extracted text content
  candidateName: string;
}

export default function ResumeViewer({ 
  resumeData, 
  resumeFileName, 
  resumeFileType, 
  resumeText, 
  candidateName 
}: ResumeViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleViewResume = () => {
    setIsOpen(true);
  };

  const createBlobUrl = () => {
    try {
      const binaryString = atob(resumeData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: resumeFileType });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error creating blob URL:', error);
      return null;
    }
  };

  const renderResumeContent = () => {
    if (resumeFileType === 'application/pdf') {
      const blobUrl = createBlobUrl();
      if (blobUrl) {
        return (
          <div className="w-full h-[600px]">
            <iframe
              src={blobUrl}
              className="w-full h-full border-0 rounded-md"
              title={`Resume - ${candidateName}`}
            />
          </div>
        );
      }
    }

    // Fallback to text content for non-PDF files or if PDF viewing fails
    if (resumeText) {
      return (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Resume Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] w-full">
              <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">
                {resumeText}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">
          Resume content is not available for preview.
        </p>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" onClick={handleViewResume}>
          <Eye className="mr-2 h-4 w-4" />
          View Resume
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {candidateName}'s Resume - {resumeFileName}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            renderResumeContent()
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
