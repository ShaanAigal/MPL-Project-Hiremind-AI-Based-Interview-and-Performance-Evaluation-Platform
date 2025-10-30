"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import ApplyForm from './apply-form';
import type { Job } from '@/components/jobs/types';

export default function ApplyNowButton({ job }: { job: Job }) {
    const [isFormOpen, setIsFormOpen] = useState(false);

    return (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
                <Button size="lg" className="w-full text-lg font-semibold h-12">
                    Apply Now
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <ApplyForm job={job} onClose={() => setIsFormOpen(false)} />
            </DialogContent>
        </Dialog>
    );
}