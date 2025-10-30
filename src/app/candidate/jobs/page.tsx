"use client"

import { Button } from '@/components/ui/button'
import {
  Search,
  MapPin,
  Building,
  DollarSign,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Star,
  Eye,
  Send,
  Loader2,
  Filter,
  X 
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import type { Job } from '@/components/jobs/types'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'

const PREDEFINED_SKILLS = ["Agile", "Agile Methodologies", "Amazon Web Services (AWS)", "AWS", "Android", "Ansible", "Appium", "API Gateway", "API Development", "API Security", "APIs and Integrations", "Apache", "App / Mobile Development", "Artificial Intelligence (AI)", "Async Communication", "Azure (Microsoft Azure)", "Back-end Development", "Big Data Processing", "Bitbucket", "Blockchain", "Blue-Green Deployments", "BDD (Behaviour-Driven Development)", "Bootstrap", "Build Automation", "Business Analysis", "Cloud Computing", "Cloud Functions", "Cloud Management", "Cloud Migration", "Cloud-Native", "Containers (Docker, Kubernetes)", "Content Management Systems (CMS)", "Continuous Integration (CI)", "Continuous Testing", "Continuous Deployment (CD)", "C#", "CSS", "CI/CD", "Cybersecurity", "Data Analysis", "Data Migration", "Data Modelling", "Data Science", "Database Administration", "Deep Learning", "DevOps", "DevSecOps", "Docker", "Drupal", "ElasticSearch", "Express.js", "Figma", "Firefox / Browser Tech (as part of Web Dev)", "Flutter", "Front-end Development", "Go (Golang)", "GraphQL", "Google Cloud Platform (GCP)", "Hardware Deployment", "HTML", "IaC (Infrastructure as Code)", "IaaS (Infrastructure as a Service)", "Illustrator", "IAM (Identity & Access Management)", "IoT (Internet of Things)", "iOS", "Jenkins", "JIRA", "Java", "JavaScript", "Jest", "Jira", "Kotlin", "Linux", "Machine Learning (ML)", "Magento", "Microservices", "MongoDB", "Mocha", "Network Architecture", "Network Security", "Node.js", "Nginx", "NoSQL", "OAuth / Authentication & Authorization", "OpenCV", "Operating Systems (Windows Server, Unix, macOS, Linux)", "OWASP", "Penetration Testing", "PostgreSQL", "PowerShell", "Post-mortems / Troubleshooting", "Product Management", "Product Ownership", "Project Management", "Prometheus", "Python", "Qiskit / Quantum Computing (emerging)", "RabbitMQ", "React", "React Native", "Real-Time Applications", "Redis", "REST APIs", "RDS (Relational Database Service)", "RESTful Web Services", "RPA / Workflow Automation", "Ruby", "Ruby on Rails (implicitly)", "Rust", "SaaS (Software as a Service)", "SAP / ERP (implied)", "SASS", "Scrum", "Scrum Master", "Selenium", "Serverless", "Serverless Architecture", "Shell Scripting (Bash, etc.)", "Sketch", "Smart Contracts (Solidity, Ethereum)", "Solidity", "Software Architecture & Design Patterns", "Software Development Life Cycle (SDLC)", "Software Testing & Quality Assurance", "SQL", "SQL Server", "Stakeholder Management", "Swift", "Tailwind CSS", "Terraform", "Test Automation", "TDD (Test-Driven Development)", "TypeScript", "UI/UX Design", "Ubuntu / General Unix-like Systems (as part of OS)", "Unit Testing", "Vagrant", "Vue.js", "VPC (Virtual Private Cloud)", "Web Development", "WebRTC", "WebSockets", "Windows Server", "WordPress"
].sort();


export default function CandidateJobs() {
  // jobs are fetched from server via React Query (jobsFromServer)
  const [searchTitle, setSearchTitle] = useState('')
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set())
  const router = useRouter();

  // --- STATE FOR FILTERS ---
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [isFilterPopoverOpen, setIsFilterPopoverOpen] = useState(false);
  // --- NEW: State for skill search query ---
  const [skillSearchQuery, setSkillSearchQuery] = useState('');
  // --- END NEW STATE ---
  // --- END FILTER STATE ---

  const [currentPage, setCurrentPage] = useState(1);

  const fetchJobs = async ({ queryKey }: { queryKey: (string | number)[] }) => {
    const [_key, page] = queryKey;
    const res = await fetch(`/api/jobs?page=${page}&filter=active&limit=10`);
    if (!res.ok) throw new Error('Failed to fetch jobs');
    return res.json();
  };

  const { data: jobsData, isLoading: jobsLoading, error: jobsError } = useQuery({ queryKey: ['candidateJobs', currentPage], queryFn: fetchJobs, keepPreviousData: true } as any);

  // Use server-side paged jobs if available, fallback to empty array
  const jobsFromServer: Job[] = (jobsData as any)?.data ?? [];
  const pagination = (jobsData as any)?.pagination;

  // Filter jobs based only on title and selected skills (applies to current page)
  const filteredJobs = useMemo(() => {
    return jobsFromServer.filter(job => {
      const matchesTitle = !searchTitle || job.title.toLowerCase().includes(searchTitle.toLowerCase());
      const matchesSkills = selectedSkills.size === 0 || Array.from(selectedSkills).every(selectedSkill =>
        job.skills.some(jobSkill => jobSkill.toLowerCase() === selectedSkill.toLowerCase())
      );
      return matchesTitle && matchesSkills;
    });
  }, [jobsFromServer, searchTitle, selectedSkills]);

  // --- NEW: Filter skills based on search query ---
  const filteredSkillsForDisplay = useMemo(() => {
    if (!skillSearchQuery) {
      return PREDEFINED_SKILLS;
    }
    const query = skillSearchQuery.toLowerCase();
    return PREDEFINED_SKILLS.filter(skill =>
      skill.toLowerCase().includes(query)
    );
  }, [skillSearchQuery]);
  // --- END NEW FILTER ---

  const toggleJobExpansion = (jobId: string) => {
    setExpandedJobs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(jobId)) {
        newSet.delete(jobId)
      } else {
        newSet.add(jobId)
      }
      return newSet
    })
  }

  // REVERTED: Apply button navigates to the apply page
  const handleApplyClick = (jobId: string) => {
    router.push(`/jobs/${jobId}/apply`);
  };

  const handleViewDetails = (jobId: string) => {
     window.open(`/jobs/${jobId}`, '_blank');
  }

  const formatDate = (dateString: string) => dayjs(dateString).format("DD/MM/YYYY")

  // Skill checkbox handler remains the same
  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => {
      const newSet = new Set(prev);
      if (newSet.has(skill)) {
        newSet.delete(skill);
      } else {
        newSet.add(skill);
      }
      return newSet;
    });
  };

  // Function to clear only skill filters
  const clearSkillFilters = () => {
    setSelectedSkills(new Set());
    setSkillSearchQuery(''); // Also clear the search query
  };

  // Calculate active filter count based only on skills
  const activeFilterCount = useMemo(() => {
    return selectedSkills.size;
  }, [selectedSkills]);

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Job Listings
        </h1>
        <p className="text-muted-foreground">
          Find your next opportunity from below job listings
        </p>
      </div>

      {/* UPDATED: Search and Filters Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
        {/* Title Search */}
        <div className="relative flex-1 w-full md:w-auto md:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Job Role..."
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            className="pl-10 pr-4 py-2 bg-muted rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary w-full border border-input"
          />
        </div>

        {/* Skills Filter Popover Button */}
        <Popover open={isFilterPopoverOpen} onOpenChange={setIsFilterPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="relative pl-10 pr-4 py-2 bg-muted text-sm w-full md:w-auto justify-start text-muted-foreground border-input">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
              <span>Filter by skills</span>
              {activeFilterCount > 0 && (
                <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0"> {/* Adjusted width */}
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <h4 className="font-medium">Skills Filter</h4>
                <p className="text-sm text-muted-foreground">Select skills to filter jobs</p>
              </div>
              {activeFilterCount > 0 && (
                 <Button variant="ghost" size="sm" onClick={clearSkillFilters} className="text-xs">
                   <X className="h-3 w-3 mr-1" /> Clear All
                 </Button>
              )}
            </div>

            {/* --- NEW: Skill Search Input --- */}
            <div className="p-2 border-b">
              <Input
                type="text"
                placeholder="Search skills..."
                value={skillSearchQuery}
                onChange={(e) => setSkillSearchQuery(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            {/* --- END: Skill Search Input --- */}

            {/* Skills Filter Section using filteredSkillsForDisplay */}
            <ScrollArea className="h-56"> {/* Adjusted height slightly */}
              <div className="p-4 space-y-2">
                {/* --- UPDATED: Use filteredSkillsForDisplay --- */}
                {filteredSkillsForDisplay.length > 0 ? filteredSkillsForDisplay.map(skill => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={`skill-${skill}`}
                      checked={selectedSkills.has(skill)}
                      onCheckedChange={() => handleSkillToggle(skill)}
                    />
                    <Label htmlFor={`skill-${skill}`} className="font-normal cursor-pointer text-sm">{skill}</Label>
                  </div>
                )) : (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    {skillSearchQuery ? 'No skills match your search' : 'No predefined skills available'}
                  </p>
                )}
                {/* --- END UPDATE --- */}
              </div>
            </ScrollArea>
             <div className="p-2 border-t flex justify-end">
                 <Button size="sm" onClick={() => setIsFilterPopoverOpen(false)}>Done</Button>
            </div>
          </PopoverContent>
        </Popover>
        {/* END: Skills Filter Popover */}

        {/* Job Count */}
        <div className="text-sm text-muted-foreground flex-1 text-left md:text-right">
          {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
        </div>
      </div>

      {/* Loading State */}
      {jobsLoading && !jobsData && (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Job Cards Grid */}
  {!jobsLoading && filteredJobs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredJobs.map((job) => (
            <div key={job._id} className="bg-card rounded-2xl border hover:shadow-lg transition-shadow">
              <div className="p-6 border-b">
                 {/* Job card details */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{job.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center space-x-1">
                        <Building className="h-4 w-4" />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{job.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <span className="font-semibold">Rs</span>
                        <span>{job.salaryRange || 'Not specified'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{job.applications} applications</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <div className={`text-sm text-muted-foreground ${!expandedJobs.has(job._id) ? 'line-clamp-3' : ''}`}>
                    {job.description}
                  </div>
                  <button
                    onClick={() => toggleJobExpansion(job._id)}
                    className="text-primary text-sm font-medium hover:underline mt-2 flex items-center space-x-1"
                  >
                    {expandedJobs.has(job._id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    <span>{expandedJobs.has(job._id) ? 'Show less' : 'Show more'}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Expires: {formatDate(job.expiryDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(job._id)}>
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                    {/* REVERTED: Apply button navigates */}
                    <Button size="sm" onClick={() => handleApplyClick(job._id)}>
                      <Send className="h-3 w-3 mr-1" />
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!jobsLoading && filteredJobs.length === 0 && (
        <div className="text-center py-12 col-span-1 lg:col-span-2">
          <div className="text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No Jobs Found</p>
            <p className="text-sm">
              Try adjusting your search or filter criteria or check back later for new opportunities.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}