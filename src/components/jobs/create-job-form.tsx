"use client"

import React, { useMemo, useState } from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, X } from "lucide-react"
import dayjs from "dayjs"
import type { Job } from "./types"

const jobSchema = z.object({
	title: z.string().min(3, "Title must be at least 3 characters"),
	company: z.string().min(2, "Company is required"),
	skills: z.array(z.string()).min(1, "Select at least one skill"),
	location: z.string().min(2, "Location is required"),
	salaryRange: z.string().min(2, "Salary range is required"),
	expiryDate: z.string().refine((v) => dayjs(v, "YYYY-MM-DD", true).isValid(), "Select a valid date"),
	description: z.string().min(20, "Description should be at least 20 characters"),
})

export interface CreateJobFormValues extends z.infer<typeof jobSchema> {}

interface CreateJobFormProps {
	onCreate?: (job: Job) => void
	onSubmit?: (job: Job) => void
	initialValues?: Partial<Job>
	submitLabel?: string
}

export function CreateJobForm({ onCreate, onSubmit, initialValues, submitLabel }: CreateJobFormProps) {
	const [values, setValues] = useState<CreateJobFormValues>({
		title: "",
		company: "",
		skills: [],
		location: "",
		salaryRange: "",
		expiryDate: "",
		description: "",
	})
	const [errors, setErrors] = useState<Record<string, string>>({})
    const [skillInput, setSkillInput] = useState("");
    const [isSuggestionsVisible, setSuggestionsVisible] = useState(false);

	const availableSkills = useMemo(
		() => [
			"JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Tailwind CSS", 
			"Python", "Java", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin", 
			"AWS", "Docker", "Kubernetes", "Google Cloud (GCP)", "Microsoft Azure", 
			"SQL", "NoSQL", "PostgreSQL", "MongoDB", "GraphQL", "REST APIs", 
			"CI/CD", "Git", "Agile", "Scrum", "JIRA", "Product Management", 
			"HTML", "CSS", "SASS", "Vue.js", "Angular", "Express.js", "Bootstrap", "Figma", 
			"Adobe XD", "Sketch", "Photoshop", "Illustrator", "UI/UX Design", 
			"Machine Learning", "Deep Learning", "Data Science", "AI", "TensorFlow", 
			"PyTorch", "OpenCV", "NLP", "Data Analysis", "SQL Server", 
			"ElasticSearch", "RabbitMQ", "Redis", "Vagrant", "Nginx", "Apache", 
			"Linux", "Unix", "Windows Server", "Shell Scripting", "PowerShell", 
			"Cybersecurity", "Penetration Testing", "OWASP", "Network Security", 
			"Blockchain", "Ethereum", "Smart Contracts", "Solidity", "DevOps", 
			"Terraform", "Ansible", "Jenkins", "Nagios", "Prometheus", "Grafana", 
			"CloudFormation", "VPC", "IAM", "Lambda", "S3", "EC2", "RDS", "SQS", 
			"Cloud Functions", "GitLab", "Bitbucket", "Firebase", "GraphQL", 
			"Content Management Systems (CMS)", "WordPress", "Drupal", "Magento", 
			"React Native", "Ionic", "Flutter", "Mobile Development", "Android", "iOS", 
			"Agile Methodologies", "Scrum Master", "Test Automation", "Unit Testing", 
			"Jest", "Mocha", "Cypress", "Selenium", "Appium", "TDD", "BDD", 
			"DevSecOps", "Test-Driven Development", "Continuous Testing", "Cloud-Native", 
			"Serverless", "API Gateway", "WebSockets", "WebRTC", "Real-Time Applications", 
			"Jenkins", "Travis CI", "CircleCI", "Jira", "Product Ownership", 
			"Project Management", "Stakeholder Management", "Business Analysis", 
			"SDLC", "SaaS", "PaaS", "IaaS", "VPS", "Microservices", "Serverless Architecture"
		],
		[]
	)

    const suggestedSkills = useMemo(() => {
        if (!skillInput) return [];
        return availableSkills.filter(
            (skill) =>
                skill.toLowerCase().includes(skillInput.toLowerCase()) &&
                !values.skills.includes(skill)
        );
    }, [skillInput, availableSkills, values.skills]);

	function setField<K extends keyof CreateJobFormValues>(key: K, value: CreateJobFormValues[K]) {
		setValues((prev) => ({ ...prev, [key]: value }))
	}

	React.useEffect(() => {
		if (!initialValues) return
		setValues({
			title: initialValues.title ?? "",
			company: initialValues.company ?? "",
			skills: initialValues.skills ?? [],
			location: initialValues.location ?? "",
			salaryRange: initialValues.salaryRange ?? "",
			expiryDate: initialValues.expiryDate ? dayjs(initialValues.expiryDate).format("YYYY-MM-DD") : "",
			description: initialValues.description ?? "",
		})
	}, [initialValues])

    const handleAddSkill = (skill: string) => {
        const skillToAdd = skill.trim();
        if (skillToAdd && !values.skills.includes(skillToAdd)) {
            setValues((prev) => ({ ...prev, skills: [...prev.skills, skillToAdd] }));
        }
        setSkillInput("");
        setSuggestionsVisible(false);
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setValues((prev) => ({
            ...prev,
            skills: prev.skills.filter((s) => s !== skillToRemove),
        }));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSkill(skillInput);
        }
    };

	function generateWithAI() {
    const lorem =
        "We are seeking a talented Technical Professional to join our team and contribute to the development, maintenance, and optimization of our technical infrastructure. This role offers the opportunity to work on diverse projects, solve complex challenges, and make a meaningful impact on our organization's technical capabilities.\n\n" +
        
        "Key Responsibilities:\n" +
        "- Design, develop, implement, and maintain technical solutions aligned with business objectives.\n" +
        "- Analyze system requirements and provide technical recommendations for improvements.\n" +
        "- Collaborate with cross-functional teams including product, engineering, and operations.\n" +
        "- Participate in code reviews, technical discussions, and knowledge-sharing sessions.\n" +
        "- Document technical specifications, processes, and best practices.\n" +
        "- Stay current with emerging technologies and industry trends.\n" +
        "- Contribute to the continuous improvement of development processes and workflows.\n\n" +
        
        "Required Qualifications:\n" +
        "- Bachelor's degree in Computer Science, Information Technology, Engineering, or related field (or equivalent practical experience).\n" +
        "- Proven experience in a technical role with demonstrable project outcomes.\n" +
        "- Strong analytical and problem-solving skills with attention to detail.\n" +
        "- Solid understanding of software development lifecycle and methodologies.\n\n" +
        
        "Technical Skills:\n" +
        "- Proficiency in relevant programming languages, frameworks, and technologies.\n" +
        "- Experience with version control systems and collaborative development tools.\n" +
        "- Knowledge of databases, APIs, and system integration concepts.\n" +
        "- Understanding of cloud platforms and modern infrastructure practices.\n" +
        "- Familiarity with testing frameworks and quality assurance practices.\n\n" +
        
        "Soft Skills:\n" +
        "- Excellent verbal and written communication abilities.\n" +
        "- Strong teamwork and collaboration mindset.\n" +
        "- Ability to manage multiple priorities and work independently.\n" +
        "- Adaptability and eagerness to learn new technologies.\n\n";
    setField("description", lorem);
}

	function validate(): boolean {
		const parsed = jobSchema.safeParse(values)
		if (!parsed.success) {
			const formErrors: Record<string, string> = {}
			for (const issue of parsed.error.issues) {
				const key = issue.path[0] as string
				if (!formErrors[key]) formErrors[key] = issue.message
			}
			setErrors(formErrors)
			return false
		}
		setErrors({})
		return true
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (!validate()) return

        const jobData = {
			...values,
			_id: initialValues?._id,
            status: initialValues?.status ?? "Active",
			applications: initialValues?.applications ?? 0,
            expiryDate: dayjs(values.expiryDate, "YYYY-MM-DD").toISOString(),
		};

		if (onSubmit) {
			onSubmit(jobData as Job)
		} else if (onCreate) {
			onCreate(jobData as Job)
		}
		
		if (!initialValues) {
			setValues({ title: "", company: "", skills: [], location: "", salaryRange: "", expiryDate: "", description: "" })
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Job Title and Company fields remain the same */}
			<div className="space-y-2">
				<Label htmlFor="title">Job Title *</Label>
				<Input id="title" value={values.title} onChange={(e) => setField("title", e.target.value)} placeholder="e.g. Senior Software Engineer" required />
				{errors.title && <p className="text-xs text-red-600">{errors.title}</p>}
			</div>
			<div className="space-y-2">
				<Label htmlFor="company">Company Name *</Label>
				<Input id="company" value={values.company} onChange={(e) => setField("company", e.target.value)} placeholder="e.g. TechCorp Inc." required />
				{errors.company && <p className="text-xs text-red-600">{errors.company}</p>}
			</div>

            {/* START: Updated Skills Section */}
            <div className="space-y-2 relative">
                <Label htmlFor="skills-input">Required Skills *</Label>
                <Input
                    id="skills-input"
                    placeholder="Search the skills to add..."
                    value={skillInput}
                    onChange={(e) => {
                        setSkillInput(e.target.value);
                        if (!isSuggestionsVisible) setSuggestionsVisible(true);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setSuggestionsVisible(true)}
                    onBlur={() => setTimeout(() => setSuggestionsVisible(false), 150)} // Delay to allow click
                />
                {isSuggestionsVisible && suggestedSkills.length > 0 && (
                    <div className="absolute z-10 w-full bg-card border rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto">
                        <ul className="py-1">
                            {suggestedSkills.map((skill) => (
                                <li
                                    key={skill}
                                    className="px-3 py-2 cursor-pointer hover:bg-accent text-sm"
                                    onMouseDown={(e) => { // Use onMouseDown to prevent blur event from firing first
                                        e.preventDefault();
                                        handleAddSkill(skill);
                                    }}
                                >
                                    {skill}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                {errors.skills && <p className="text-xs text-red-600">{errors.skills}</p>}
                {values.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                        {values.skills.map((skill) => (
                            <span key={skill} className="inline-flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                                {skill}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSkill(skill)}
                                    className="hover:bg-primary/20 rounded-full p-0.5"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>
            {/* END: Updated Skills Section */}

			{/* Other form fields remain the same */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="space-y-2">
					<Label htmlFor="location">Location *</Label>
					<Input id="location" value={values.location} onChange={(e) => setField("location", e.target.value)} placeholder="e.g. San Francisco or Remote" required />
					{errors.location && <p className="text-xs text-red-600">{errors.location}</p>}
				</div>
				<div className="space-y-2">
					<Label htmlFor="salaryRange">Salary Range *</Label>
					<Input id="salaryRange" value={values.salaryRange} onChange={(e) => setField("salaryRange", e.target.value)} placeholder="e.g. Rs 50,000 - Rs 80,000" required />
					{errors.salaryRange && <p className="text-xs text-red-600">{errors.salaryRange}</p>}
				</div>
			</div>
			<div >
				<div className="space-y-2">
					<Label htmlFor="expiryDate">Application Deadline *</Label>
					<Input id="expiryDate" type="date" value={values.expiryDate} onChange={(e) => setField("expiryDate", e.target.value)} required />
					{errors.expiryDate && <p className="text-xs text-red-600">{errors.expiryDate}</p>}
				</div>
			</div>
			<div className="grid grid-cols-1 md:grid-cols-20 gap-4">
				<div className="space-y-2">
					<Label htmlFor="description">Job Description *</Label>
					<Textarea id="description" className="min-h-[120px]" value={values.description} onChange={(e) => setField("description", e.target.value)} placeholder="Describe the role, responsibilities, requirements, and benefits..." required />
					{errors.description && <p className="text-xs text-red-600">{errors.description}</p>}
					<div className="flex justify-center">
						<Button type="button" variant="outline" onClick={generateWithAI} className="flex items-center gap-2">
							<Sparkles className="h-4 w-4" />
							Generate with AI
						</Button>
					</div>
				</div>
			</div>
			<div className="flex justify-end gap-2">
				<Button type="submit">{submitLabel ?? (initialValues ? "Save Changes" : "Create Job Posting")}</Button>
			</div>
		</form>
	)
}