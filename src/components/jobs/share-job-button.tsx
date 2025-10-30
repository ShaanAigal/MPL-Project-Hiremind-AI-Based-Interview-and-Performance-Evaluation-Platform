"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share2, Copy, Check } from 'lucide-react'; // Importing icons
import { FaWhatsapp, FaLinkedin, FaTelegramPlane } from 'react-icons/fa'; // Importing platform icons
import type { Job } from '@/components/jobs/types';

// A simple component for social share links
const SocialLink = ({ href, children, icon }: { href: string, children: React.ReactNode, icon: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="w-full">
    <Button variant="outline" className="w-full justify-center gap-2">
      {icon} {/* Display icon */}
      {children}
    </Button>
  </a>
);

export function ShareJobButton({ job }: { job: Job }) {
  const [hasCopied, setHasCopied] = useState(false);
  const jobUrl = typeof window !== 'undefined' ? `${window.location.origin}/jobs/${job._id}` : '';
  const shareText = `Check out this job opening for a ${job.title} at ${job.company}!`;

  const handleCopy = () => {
    navigator.clipboard.writeText(jobUrl);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000); // Reset after 2 seconds
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Share Job
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Job</DialogTitle>
          <DialogDescription>
            Help others find this opportunity by sharing this job posting.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="flex items-center space-x-2">
                <div className="grid flex-1 gap-2">
                    <Label htmlFor="link" className="sr-only">
                    Link
                    </Label>
                    <Input
                    id="link"
                    defaultValue={jobUrl}
                    readOnly
                    />
                </div>
                <Button type="button" size="sm" className="px-3" onClick={handleCopy}>
                    <span className="sr-only">Copy</span>
                    {hasCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* WhatsApp */}
                <SocialLink href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${jobUrl}`)}`} icon={<FaWhatsapp className="h-5 w-5" />}>
                    WhatsApp
                </SocialLink>
                {/* LinkedIn */}
                <SocialLink href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(jobUrl)}`} icon={<FaLinkedin className="h-5 w-5" />}>
                    LinkedIn
                </SocialLink>
                {/* Telegram */}
                <SocialLink href={`https://t.me/share/url?url=${encodeURIComponent(jobUrl)}&text=${encodeURIComponent(shareText)}`} icon={<FaTelegramPlane className="h-5 w-5" />}>
                    Telegram
                </SocialLink>
            </div>
        </div>
        <DialogFooter className="sm:justify-start">
            {/* The default close button is in the top right, but you can add one here if you want */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
