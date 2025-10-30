// src/app/candidate/ats/create/page.tsx
"use client"

import React, { useState, useRef, useMemo } from 'react' // Added useMemo
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area' // Import ScrollArea
import { User, Phone, Mail, Linkedin, MapPin, GraduationCap, Briefcase, Star, PlusCircle, Trash2, Eye, FileText, Download, Loader2 } from 'lucide-react'

// Import PDF generation libraries
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Define types for resume sections
interface Education { id: number; institution: string; degree: string; year: string }
interface Experience { id: number; company: string; role: string; duration: string; description: string }
interface Project { id: number; name: string; description: string; link?: string }
interface Skill { id: number; name: string; category?: string }

export default function CreateResumePage() {
  const [name, setName] = useState('John Doe')
  const [phone, setPhone] = useState('+1 234 567 890')
  const [email, setEmail] = useState('john.doe@example.com')
  const [linkedin, setLinkedin] = useState('linkedin.com/in/johndoe')
  const [location, setLocation] = useState('San Francisco, CA')
  const [professionalSummary, setProfessionalSummary] = useState('Results-driven Software Engineer with 5+ years of experience in developing and maintaining web applications. Proficient in React, Node.js, and cloud technologies. Seeking to leverage technical expertise and leadership skills in a challenging role.')

  const [education, setEducation] = useState<Education[]>([{ id: Date.now(), institution: 'State University', degree: 'B.Sc. in Computer Science', year: '2020' }])
  const [experience, setExperience] = useState<Experience[]>([{ id: Date.now(), company: 'Tech Corp', role: 'Software Engineer', duration: '2020 - Present', description: '- Developed and maintained web applications using React, Node.js, and MongoDB.\n- Led a team of 3 junior developers.' }])
  const [projects, setProjects] = useState<Project[]>([{ id: Date.now(), name: 'Personal Portfolio', description: 'A personal website built with Next.js to showcase projects.', link: 'github.com/johndoe/portfolio' }])
  const [skills, setSkills] = useState<Skill[]>([
      { id: Date.now() + 1, name: 'JavaScript', category: 'Languages' },
      { id: Date.now() + 2, name: 'React', category: 'Frameworks' },
      { id: Date.now() + 3, name: 'Node.js', category: 'Frameworks' },
      { id: Date.now() + 4, name: 'AWS', category: 'Tools/Cloud' },
      { id: Date.now() + 5, name: 'Agile', category: 'Methodologies' },
  ])

  const [activeTemplate, setActiveTemplate] = useState('modern')
  const [isDownloading, setIsDownloading] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  // Helper functions to add/remove/update items
  const updateItem = <T extends { id: number }>(
    items: T[],
    setItems: React.Dispatch<React.SetStateAction<T[]>>,
    id: number,
    field: keyof T,
    value: any
  ) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const addEducation = () => setEducation([...education, { id: Date.now(), institution: '', degree: '', year: '' }])
  const removeEducation = (id: number) => setEducation(education.filter(e => e.id !== id))

  const addExperience = () => setExperience([...experience, { id: Date.now(), company: '', role: '', duration: '', description: '' }])
  const removeExperience = (id: number) => setExperience(experience.filter(e => e.id !== id))

  const addProject = () => setProjects([...projects, { id: Date.now(), name: '', description: '', link: '' }])
  const removeProject = (id: number) => setProjects(projects.filter(p => p.id !== id))

  const addSkill = () => setSkills([...skills, { id: Date.now(), name: '', category: '' }])
  const removeSkill = (id: number) => setSkills(skills.filter(s => s.id !== id))

  // Download PDF function
  const handleDownloadPDF = async () => {
      if (!previewRef.current) return;
      setIsDownloading(true);

      try {
          // Temporarily adjust styles for better PDF capture
          const originalStyles = previewRef.current.style.cssText;
          previewRef.current.style.width = '210mm'; // A4 width
          previewRef.current.style.padding = '15mm'; // Margins
          previewRef.current.style.boxShadow = 'none';
          previewRef.current.style.border = 'none';

          const canvas = await html2canvas(previewRef.current, {
              // Remove 'scale' property - use window.devicePixelRatio instead
              useCORS: true,
              logging: false,
              width: previewRef.current.scrollWidth,
              height: previewRef.current.scrollHeight,
          });

          // Restore original styles
          previewRef.current.style.cssText = originalStyles;

          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
              orientation: 'portrait',
              unit: 'mm',
              format: 'a4',
          });

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          
          // Calculate image dimensions manually
          const imgWidth = pdfWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          let heightLeft = imgHeight;
          let position = 0;

          // Add image, potentially spanning multiple pages
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pdfHeight;

          while (heightLeft > 0) {
              position = heightLeft - imgHeight;
              pdf.addPage();
              pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
              heightLeft -= pdfHeight;
          }

          pdf.save(`${name.replace(/\s+/g, '_')}_Resume.pdf`);

      } catch (error) {
          console.error("Error generating PDF:", error);
          alert("Failed to generate PDF. Please try again.");
      } finally {
          setIsDownloading(false);
      }
  };

  // Group skills by category for preview
  const groupedSkills = useMemo(() => {
      return skills.reduce((acc, skill) => {
          const category = skill.category || 'Other';
          if (!acc[category]) {
              acc[category] = [];
          }
          acc[category].push(skill.name);
          return acc;
      }, {} as Record<string, string[]>);
  }, [skills]);

  return (
    <div className="p-6 h-full flex flex-col md:flex-row gap-6 overflow-hidden">
      {/* Editor Panel */}
      <div className="w-full md:w-1/2 flex flex-col">
          <h1 className="text-2xl font-bold mb-4">Resume Editor</h1>
          <ScrollArea className="overflow-y-auto pr-4 flex-grow">
            {/* Personal Details */}
            <Card className="mb-6">
                <CardHeader><CardTitle>Personal Details</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1"><Label>Full Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
                        <div className="space-y-1"><Label>Phone</Label><Input value={phone} onChange={e => setPhone(e.target.value)} /></div>
                        <div className="space-y-1"><Label>Email</Label><Input value={email} onChange={e => setEmail(e.target.value)} /></div>
                        <div className="space-y-1"><Label>LinkedIn Profile URL</Label><Input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="linkedin.com/in/yourprofile"/></div>
                    </div>
                     <div className="space-y-1"><Label>Location</Label><Input value={location} onChange={e => setLocation(e.target.value)} placeholder="City, State" /></div>
                </CardContent>
            </Card>

            {/* Professional Summary */}
            <Card className="mb-6">
                <CardHeader><CardTitle>Professional Summary</CardTitle></CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="Write a brief summary highlighting your key skills and experience..."
                        value={professionalSummary}
                        onChange={e => setProfessionalSummary(e.target.value)}
                        className="min-h-[100px]"
                    />
                </CardContent>
            </Card>

            {/* Education Section */}
            <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Education</CardTitle>
                    <Button variant="outline" size="sm" onClick={addEducation}><PlusCircle className="h-4 w-4 mr-2" />Add Education</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {education.map((edu) => (
                        <div key={edu.id} className="p-4 border rounded-md relative group">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input placeholder="Institution Name" value={edu.institution} onChange={e => updateItem(education, setEducation, edu.id, 'institution', e.target.value)} />
                                <Input placeholder="Degree (e.g., B.Sc. Computer Science)" value={edu.degree} onChange={e => updateItem(education, setEducation, edu.id, 'degree', e.target.value)} />
                                <Input placeholder="Graduation Year (e.g., 2020)" value={edu.year} onChange={e => updateItem(education, setEducation, edu.id, 'year', e.target.value)} />
                            </div>
                            <Button variant="ghost" size="icon" className="absolute top-1 right-1 opacity-0 group-hover:opacity-100" onClick={() => removeEducation(edu.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Work Experience Section */}
            <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Work Experience</CardTitle>
                    <Button variant="outline" size="sm" onClick={addExperience}><PlusCircle className="h-4 w-4 mr-2" />Add Experience</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {experience.map(exp => (
                        <div key={exp.id} className="p-4 border rounded-md relative space-y-3 group">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input placeholder="Company Name" value={exp.company} onChange={e => updateItem(experience, setExperience, exp.id, 'company', e.target.value)} />
                                <Input placeholder="Job Role / Title" value={exp.role} onChange={e => updateItem(experience, setExperience, exp.id, 'role', e.target.value)} />
                                <Input placeholder="Duration (e.g., Jan 2020 - Present)" value={exp.duration} onChange={e => updateItem(experience, setExperience, exp.id, 'duration', e.target.value)} />
                             </div>
                             <Textarea
                                placeholder="Describe your responsibilities and achievements. Use bullet points (start lines with - or *)."
                                value={exp.description}
                                onChange={e => updateItem(experience, setExperience, exp.id, 'description', e.target.value)}
                                className="min-h-[100px]"
                              />
                             <Button variant="ghost" size="icon" className="absolute top-1 right-1 opacity-0 group-hover:opacity-100" onClick={() => removeExperience(exp.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                    ))}
                </CardContent>
            </Card>

             {/* Projects Section */}
             <Card className="mb-6">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Projects</CardTitle>
                    <Button variant="outline" size="sm" onClick={addProject}><PlusCircle className="h-4 w-4 mr-2" />Add Project</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {projects.map(proj => (
                        <div key={proj.id} className="p-4 border rounded-md relative space-y-3 group">
                             <Input placeholder="Project Name" value={proj.name} onChange={e => updateItem(projects, setProjects, proj.id, 'name', e.target.value)} />
                             <Textarea
                                placeholder="Describe the project and your contributions..."
                                value={proj.description}
                                onChange={e => updateItem(projects, setProjects, proj.id, 'description', e.target.value)}
                                className="min-h-[80px]"
                             />
                             <Input placeholder="Link (Optional, e.g., GitHub URL)" value={proj.link} onChange={e => updateItem(projects, setProjects, proj.id, 'link', e.target.value)} />
                             <Button variant="ghost" size="icon" className="absolute top-1 right-1 opacity-0 group-hover:opacity-100" onClick={() => removeProject(proj.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                    ))}
                </CardContent>
            </Card>

             {/* Skills Section */}
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Skills</CardTitle>
                    <Button variant="outline" size="sm" onClick={addSkill}><PlusCircle className="h-4 w-4 mr-2" />Add Skill</Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {skills.map(skill => (
                        <div key={skill.id} className="p-3 border rounded-md relative flex items-center gap-4 group">
                             <Input
                                placeholder="Skill Name (e.g., React)"
                                value={skill.name}
                                onChange={e => updateItem(skills, setSkills, skill.id, 'name', e.target.value)}
                                className="flex-1"
                             />
                             <Input
                                placeholder="Category (Optional, e.g., Frameworks)"
                                value={skill.category}
                                onChange={e => updateItem(skills, setSkills, skill.id, 'category', e.target.value)}
                                className="flex-1"
                             />
                             <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100" onClick={() => removeSkill(skill.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                        </div>
                    ))}
                </CardContent>
            </Card>

        </ScrollArea>
      </div>

      {/* Preview Panel */}
      <div className="w-full md:w-1/2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Preview</h1>
             <Button onClick={handleDownloadPDF} disabled={isDownloading}>
                {isDownloading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                Download PDF
            </Button>
          </div>
        <ScrollArea className="flex-grow border rounded-lg bg-background shadow-inner">
            <div ref={previewRef} className="p-8 prose prose-sm dark:prose-invert max-w-none prose-headings:mb-1 prose-headings:mt-3 prose-p:my-1 prose-ul:my-1 prose-li:my-0.5" id="resume-preview">
                {/* Header */}
                <header className="text-center mb-6 not-prose">
                    <h1 className="text-3xl font-bold mb-1 tracking-tight">{name}</h1>
                    <div className="text-xs text-muted-foreground flex flex-wrap justify-center gap-x-3 gap-y-1">
                        {phone && <span><Phone className="inline h-3 w-3 mr-1"/>{phone}</span>}
                        {email && <span><Mail className="inline h-3 w-3 mr-1"/>{email}</span>}
                        {location && <span><MapPin className="inline h-3 w-3 mr-1"/>{location}</span>}
                        {linkedin && <span><Linkedin className="inline h-3 w-3 mr-1"/>{linkedin}</span>}
                    </div>
                </header>

                {/* Summary */}
                {professionalSummary && (
                    <section className="mb-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wider border-b pb-1 mb-2 text-primary">Summary</h2>
                        <p className="text-sm text-muted-foreground">{professionalSummary}</p>
                    </section>
                )}

                 {/* Experience */}
                {experience.length > 0 && (
                    <section className="mb-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wider border-b pb-1 mb-2 text-primary">Experience</h2>
                        {experience.map(exp => (
                             <div key={exp.id} className="mb-3">
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-base font-semibold">{exp.role}</h3>
                                    <p className="text-xs text-muted-foreground">{exp.duration}</p>
                                </div>
                                <p className="text-sm font-medium">{exp.company}</p>
                                <ul className="list-disc pl-5 text-sm text-muted-foreground mt-1">
                                    {exp.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line.trim().replace(/^-|^\*/, '').trim()}</li>)}
                                </ul>
                            </div>
                        ))}
                    </section>
                )}

                {/* Skills */}
                {Object.keys(groupedSkills).length > 0 && (
                    <section className="mb-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wider border-b pb-1 mb-2 text-primary">Skills</h2>
                        <div className="space-y-1">
                            {Object.entries(groupedSkills).map(([category, skillList]) => (
                                <p key={category} className="text-sm">
                                    <span className="font-semibold">{category}: </span>
                                    <span className="text-muted-foreground">{skillList.join(', ')}</span>
                                </p>
                            ))}
                        </div>
                    </section>
                )}

                {/* Projects */}
                 {projects.length > 0 && (
                    <section className="mb-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wider border-b pb-1 mb-2 text-primary">Projects</h2>
                        {projects.map(proj => (
                            <div key={proj.id} className="mb-2">
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-base font-semibold">{proj.name}</h3>
                                    {proj.link && <a href={`//${proj.link.replace(/^https?:\/\//, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate">({proj.link})</a>}
                                </div>
                                <p className="text-sm text-muted-foreground">{proj.description}</p>
                            </div>
                        ))}
                    </section>
                )}

                 {/* Education */}
                {education.length > 0 && (
                    <section>
                        <h2 className="text-sm font-semibold uppercase tracking-wider border-b pb-1 mb-2 text-primary">Education</h2>
                        {education.map(edu => (
                            <div key={edu.id} className="mb-1 flex justify-between">
                                <div>
                                    <h3 className="text-base font-semibold">{edu.degree}</h3>
                                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                                </div>
                                <p className="text-sm text-muted-foreground">{edu.year}</p>
                            </div>
                        ))}
                    </section>
                )}

            </div>
        </ScrollArea>
      </div>
    </div>
  )
}