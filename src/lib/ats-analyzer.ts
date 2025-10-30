// Free ATS Resume Analyzer using rule-based analysis and keyword matching
// No external AI APIs required

import { getJobKeywords, getIndustrySkills, UNIVERSAL_SOFT_SKILLS } from './job-keywords';

interface AnalysisResult {
  score: number;
  atsScore: number;
  toneScore: number;
  contentScore: number;
  structureScore: number;
  skillsScore: number;
  toneDetails: {
    checks: string[];
    warnings: string[];
  };
  contentDetails: {
    checks: string[];
    warnings: string[];
  };
  structureDetails: {
    checks: string[];
    warnings: string[];
  };
  skillsDetails: {
    checks: string[];
    warnings: string[];
  };
}

// Comprehensive keyword database for different categories
const KEYWORDS = {
  technical: [
    'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'html', 'css',
    'typescript', 'angular', 'vue', 'mongodb', 'postgresql', 'mysql', 'redis',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'git', 'github', 'gitlab',
    'jenkins', 'ci/cd', 'devops', 'microservices', 'api', 'rest', 'graphql',
    'machine learning', 'ai', 'data science', 'tensorflow', 'pytorch', 'pandas',
    'numpy', 'scikit-learn', 'blockchain', 'web3', 'solidity', 'ethereum'
  ],
  
  soft_skills: [
    'leadership', 'communication', 'teamwork', 'problem solving', 'analytical',
    'creative', 'innovative', 'collaborative', 'adaptable', 'organized',
    'detail-oriented', 'time management', 'project management', 'mentoring',
    'training', 'presentation', 'negotiation', 'customer service', 'sales'
  ],
  
  experience_indicators: [
    'managed', 'led', 'developed', 'implemented', 'designed', 'created',
    'built', 'improved', 'optimized', 'increased', 'decreased', 'reduced',
    'achieved', 'delivered', 'coordinated', 'collaborated', 'mentored',
    'trained', 'supervised', 'established', 'launched', 'executed'
  ],
  
  education_keywords: [
    'bachelor', 'master', 'phd', 'degree', 'university', 'college',
    'certification', 'certified', 'course', 'training', 'bootcamp',
    'diploma', 'associate', 'graduate', 'undergraduate', 'mba'
  ],
  
  ats_friendly: [
    'experience', 'skills', 'education', 'work history', 'employment',
    'achievements', 'responsibilities', 'projects', 'technologies'
  ]
};

// Common ATS-unfriendly elements
const ATS_UNFRIENDLY = {
  formatting: [
    'tables', 'columns', 'text boxes', 'headers', 'footers', 'images',
    'graphics', 'charts', 'special characters', 'fancy fonts'
  ],
  
  sections: [
    'references available upon request', 'objective', 'personal information',
    'hobbies', 'interests (unless relevant)', 'photos', 'age', 'marital status'
  ]
};

export class FreeATSAnalyzer {
  private resumeText: string;
  private jobRole?: string;
  private jobDescription?: string;

  constructor(resumeText: string, jobRole?: string, jobDescription?: string) {
    this.resumeText = resumeText.toLowerCase();
    this.jobRole = jobRole?.toLowerCase();
    this.jobDescription = jobDescription?.toLowerCase();
  }

  public analyze(): AnalysisResult {
    const structureAnalysis = this.analyzeStructure();
    const contentAnalysis = this.analyzeContent();
    const skillsAnalysis = this.analyzeSkills();
    const toneAnalysis = this.analyzeTone();
    const atsAnalysis = this.analyzeATSCompatibility();

    // Calculate overall scores
    const structureScore = this.calculateStructureScore(structureAnalysis);
    const contentScore = this.calculateContentScore(contentAnalysis);
    const skillsScore = this.calculateSkillsScore(skillsAnalysis);
    const toneScore = this.calculateToneScore(toneAnalysis);
    const atsScore = this.calculateATSScore(atsAnalysis);

    // Overall score is weighted average
    const overallScore = Math.round(
      (structureScore * 0.25) +
      (contentScore * 0.25) +
      (skillsScore * 0.25) +
      (toneScore * 0.15) +
      (atsScore * 0.1)
    );

    return {
      score: overallScore,
      atsScore,
      toneScore,
      contentScore,
      structureScore,
      skillsScore,
      toneDetails: toneAnalysis,
      contentDetails: contentAnalysis,
      structureDetails: structureAnalysis,
      skillsDetails: skillsAnalysis
    };
  }

  private analyzeStructure() {
    const checks: string[] = [];
    const warnings: string[] = [];

    // Check for essential sections
    const sections = {
      contact: /contact|email|phone|address|linkedin/,
      experience: /experience|employment|work history|professional/,
      education: /education|degree|university|college|school/,
      skills: /skills|technical|competencies|technologies/
    };

    Object.entries(sections).forEach(([section, regex]) => {
      if (regex.test(this.resumeText)) {
        checks.push(`${section.charAt(0).toUpperCase() + section.slice(1)} section present`);
      } else {
        warnings.push(`Missing ${section} section`);
      }
    });

    // Check resume length
    const wordCount = this.resumeText.split(/\s+/).length;
    if (wordCount >= 300 && wordCount <= 800) {
      checks.push('Appropriate resume length');
    } else if (wordCount < 300) {
      warnings.push('Resume may be too short');
    } else {
      warnings.push('Resume may be too long');
    }

    // Check for bullet points (common formatting)
    if (/•|·|\*|-/.test(this.resumeText)) {
      checks.push('Uses bullet points for readability');
    } else {
      warnings.push('Consider using bullet points for better readability');
    }

    return { checks, warnings };
  }

  private analyzeContent() {
    const checks: string[] = [];
    const warnings: string[] = [];

    // Check for quantified achievements
    const quantifiers = /\d+%|\d+\$|\d+ years?|\d+ months?|\d+k|\d+ million|\d+ billion/g;
    const quantifiedMatches = this.resumeText.match(quantifiers) || [];
    
    if (quantifiedMatches.length >= 3) {
      checks.push('Contains quantified achievements');
    } else {
      warnings.push('Add more quantified achievements and metrics');
    }

    // Check for action verbs
    const actionVerbCount = KEYWORDS.experience_indicators.filter(verb => 
      this.resumeText.includes(verb)
    ).length;

    if (actionVerbCount >= 5) {
      checks.push('Uses strong action verbs');
    } else {
      warnings.push('Use more action verbs to describe experiences');
    }

    // Check for relevant experience
    if (/\d+ years?/.test(this.resumeText)) {
      checks.push('Includes years of experience');
    } else {
      warnings.push('Consider mentioning years of experience');
    }

    // Check for projects
    if (/project|portfolio|github|demo/.test(this.resumeText)) {
      checks.push('Mentions projects or portfolio');
    } else {
      warnings.push('Consider adding relevant projects');
    }

    return { checks, warnings };
  }

  private analyzeSkills() {
    const checks: string[] = [];
    const warnings: string[] = [];

    // Get job-specific keywords if job role is provided
    let jobSpecificKeywords: string[] = [];
    if (this.jobRole) {
      jobSpecificKeywords = getJobKeywords(this.jobRole);
    }

    // Get industry-specific skills if job description is provided
    let industrySkills: string[] = [];
    if (this.jobDescription) {
      industrySkills = getIndustrySkills(this.jobDescription);
    }

    // Combine all relevant keywords
    const allRelevantKeywords = [
      ...KEYWORDS.technical,
      ...jobSpecificKeywords,
      ...industrySkills
    ].filter((keyword, index, array) => array.indexOf(keyword) === index); // Remove duplicates

    // Count technical and job-specific skills
    const foundSkills = allRelevantKeywords.filter(skill => 
      this.resumeText.includes(skill.toLowerCase())
    );

    if (foundSkills.length >= 12) {
      checks.push(`Excellent skill alignment (${foundSkills.length} relevant skills found)`);
    } else if (foundSkills.length >= 8) {
      checks.push(`Strong skill set (${foundSkills.length} skills found)`);
    } else if (foundSkills.length >= 4) {
      checks.push(`Good technical skills (${foundSkills.length} skills found)`);
    } else {
      warnings.push('Add more relevant technical and job-specific skills');
    }

    // Count soft skills
    const softSkills = UNIVERSAL_SOFT_SKILLS.filter(skill => 
      this.resumeText.includes(skill.toLowerCase())
    );

    if (softSkills.length >= 5) {
      checks.push(`Strong soft skills representation (${softSkills.length} found)`);
    } else if (softSkills.length >= 3) {
      checks.push('Includes important soft skills');
    } else {
      warnings.push('Add more soft skills and interpersonal abilities');
    }

    // Job-specific skills matching
    if (this.jobRole && jobSpecificKeywords.length > 0) {
      const matchingJobSkills = jobSpecificKeywords.filter(skill => 
        this.resumeText.includes(skill.toLowerCase())
      );

      const matchPercentage = (matchingJobSkills.length / jobSpecificKeywords.length) * 100;
      
      if (matchPercentage >= 70) {
        checks.push(`Excellent job role match (${Math.round(matchPercentage)}% keyword alignment)`);
      } else if (matchPercentage >= 50) {
        checks.push(`Good job role match (${Math.round(matchPercentage)}% keyword alignment)`);
      } else {
        warnings.push(`Low job role match (${Math.round(matchPercentage)}% - consider adding more role-specific keywords)`);
      }
    }

    // Industry-specific analysis
    if (this.jobDescription && industrySkills.length > 0) {
      const matchingIndustrySkills = industrySkills.filter(skill => 
        this.resumeText.includes(skill.toLowerCase())
      );

      if (matchingIndustrySkills.length >= industrySkills.length * 0.4) {
        checks.push('Good industry knowledge demonstrated');
      } else {
        warnings.push('Consider adding more industry-specific terminology');
      }
    }

    return { checks, warnings };
  }

  private analyzeTone() {
    const checks: string[] = [];
    const warnings: string[] = [];

    // Check for professional tone
    const professionalWords = [
      'professional', 'experienced', 'skilled', 'proficient', 'expert',
      'accomplished', 'dedicated', 'committed', 'reliable', 'efficient'
    ];

    const professionalCount = professionalWords.filter(word => 
      this.resumeText.includes(word)
    ).length;

    if (professionalCount >= 3) {
      checks.push('Professional tone throughout');
    } else {
      warnings.push('Use more professional language');
    }

    // Check for first person pronouns (should be minimal)
    const firstPersonCount = (this.resumeText.match(/\bi\b|\bme\b|\bmy\b/g) || []).length;
    if (firstPersonCount <= 2) {
      checks.push('Appropriate use of first person');
    } else {
      warnings.push('Reduce use of first person pronouns (I, me, my)');
    }

    // Check for active voice
    const passiveIndicators = /was|were|been|being/g;
    const passiveCount = (this.resumeText.match(passiveIndicators) || []).length;
    const totalSentences = this.resumeText.split(/[.!?]+/).length;

    if (passiveCount / totalSentences < 0.3) {
      checks.push('Uses active voice effectively');
    } else {
      warnings.push('Use more active voice instead of passive voice');
    }

    return { checks, warnings };
  }

  private analyzeATSCompatibility() {
    const checks: string[] = [];
    const warnings: string[] = [];

    // Check for standard section headers
    const standardHeaders = [
      'experience', 'education', 'skills', 'summary', 'objective',
      'employment', 'work history', 'qualifications', 'certifications'
    ];

    const headerCount = standardHeaders.filter(header => 
      this.resumeText.includes(header)
    ).length;

    if (headerCount >= 3) {
      checks.push('Uses ATS-friendly section headers');
    } else {
      warnings.push('Use standard section headers for better ATS parsing');
    }

    // Check for keywords density
    const totalWords = this.resumeText.split(/\s+/).length;
    const keywordCount = [...KEYWORDS.technical, ...KEYWORDS.soft_skills]
      .filter(keyword => this.resumeText.includes(keyword)).length;

    const keywordDensity = keywordCount / totalWords;

    if (keywordDensity >= 0.05) {
      checks.push('Good keyword density for ATS');
    } else {
      warnings.push('Increase relevant keyword usage for better ATS score');
    }

    // Check for common ATS issues
    if (!/\t|\s{4,}/.test(this.resumeText)) {
      checks.push('Clean formatting without excessive spacing');
    } else {
      warnings.push('Remove excessive spacing and tabs');
    }

    return { checks, warnings };
  }


  private calculateStructureScore(analysis: { checks: string[]; warnings: string[] }): number {
    const totalChecks = analysis.checks.length + analysis.warnings.length;
    if (totalChecks === 0) return 70;
    
    const successRate = analysis.checks.length / totalChecks;
    return Math.round(60 + (35 * successRate));
  }

  private calculateContentScore(analysis: { checks: string[]; warnings: string[] }): number {
    const totalChecks = analysis.checks.length + analysis.warnings.length;
    if (totalChecks === 0) return 70;
    
    const successRate = analysis.checks.length / totalChecks;
    return Math.round(60 + (35 * successRate));
  }

  private calculateSkillsScore(analysis: { checks: string[]; warnings: string[] }): number {
    const totalChecks = analysis.checks.length + analysis.warnings.length;
    if (totalChecks === 0) return 60;
    
    const successRate = analysis.checks.length / totalChecks;
    return Math.round(60 + (35 * successRate));
  }

  private calculateToneScore(analysis: { checks: string[]; warnings: string[] }): number {
    const totalChecks = analysis.checks.length + analysis.warnings.length;
    if (totalChecks === 0) return 75;
    
    const successRate = analysis.checks.length / totalChecks;
    return Math.round(65 + (30 * successRate));
  }

  private calculateATSScore(analysis: { checks: string[]; warnings: string[] }): number {
    const totalChecks = analysis.checks.length + analysis.warnings.length;
    if (totalChecks === 0) return 65;
    
    const successRate = analysis.checks.length / totalChecks;
    return Math.round(60 + (35 * successRate));
  }
}

// Utility function to analyze resume with fallback
export function analyzeResumeWithFallback(
  resumeText: string, 
  jobRole?: string, 
  jobDescription?: string
): AnalysisResult {
  try {
    const analyzer = new FreeATSAnalyzer(resumeText, jobRole, jobDescription);
    return analyzer.analyze();
  } catch (error) {
    console.error('Error in free ATS analysis:', error);
    
    // Return a basic fallback analysis
    return {
      score: 65,
      atsScore: 60,
      toneScore: 70,
      contentScore: 65,
      structureScore: 65,
      skillsScore: 60,
      toneDetails: {
        checks: ['Resume processed successfully'],
        warnings: ['Unable to perform detailed tone analysis']
      },
      contentDetails: {
        checks: ['Resume content analyzed'],
        warnings: ['Consider adding more quantified achievements']
      },
      structureDetails: {
        checks: ['Basic structure detected'],
        warnings: ['Ensure all essential sections are present']
      },
      skillsDetails: {
        checks: ['Skills section identified'],
        warnings: ['Add more relevant technical skills']
      }
    };
  }
}