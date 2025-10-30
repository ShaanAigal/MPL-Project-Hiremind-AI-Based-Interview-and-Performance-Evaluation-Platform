// Test utility for the free ATS analyzer
// This can be used to test the analyzer without making API calls

import { FreeATSAnalyzer } from './ats-analyzer';

// Sample resume text for testing
const SAMPLE_RESUME = `
John Doe
Software Engineer
Email: john.doe@email.com
Phone: (555) 123-4567

EXPERIENCE
Senior Software Engineer - Tech Company (2020-2023)
- Developed and maintained web applications using React, Node.js, and MongoDB
- Implemented RESTful APIs and microservices architecture
- Led a team of 5 developers in agile development environment
- Improved application performance by 40% through code optimization
- Collaborated with cross-functional teams to deliver projects on time

Software Developer - StartupCorp (2018-2020)
- Built responsive web applications using JavaScript, HTML, and CSS
- Worked with SQL databases and implemented data visualization features
- Participated in code reviews and maintained version control using Git
- Mentored junior developers and conducted technical interviews

EDUCATION
Bachelor of Science in Computer Science
University of Technology (2014-2018)

SKILLS
Programming Languages: JavaScript, Python, Java, TypeScript
Frameworks: React, Node.js, Express, Angular
Databases: MongoDB, PostgreSQL, MySQL
Tools: Git, Docker, Jenkins, AWS
Soft Skills: Leadership, Communication, Problem Solving, Teamwork

PROJECTS
E-commerce Platform - Built a full-stack e-commerce application with payment integration
Data Analytics Dashboard - Created real-time dashboard using React and D3.js
`;

// Test function
export function testFreeAnalyzer() {
  console.log('Testing Free ATS Analyzer...\n');
  
  // Test without job context
  console.log('=== Test 1: General Analysis ===');
  const analyzer1 = new FreeATSAnalyzer(SAMPLE_RESUME);
  const result1 = analyzer1.analyze();
  console.log('Overall Score:', result1.score);
  console.log('ATS Score:', result1.atsScore);
  console.log('Skills Analysis:', result1.skillsDetails);
  console.log('\n');
  
  // Test with job role
  console.log('=== Test 2: With Job Role ===');
  const analyzer2 = new FreeATSAnalyzer(SAMPLE_RESUME, 'software engineer');
  const result2 = analyzer2.analyze();
  console.log('Overall Score:', result2.score);
  console.log('Skills Score:', result2.skillsScore);
  console.log('Skills Checks:', result2.skillsDetails.checks);
  console.log('\n');
  
  // Test with job role and description
  console.log('=== Test 3: With Job Role and Description ===');
  const jobDescription = `
    We are looking for a Senior Software Engineer with experience in React, Node.js, 
    and cloud technologies. The ideal candidate should have strong leadership skills 
    and experience with agile development methodologies.
  `;
  
  const analyzer3 = new FreeATSAnalyzer(SAMPLE_RESUME, 'software engineer', jobDescription);
  const result3 = analyzer3.analyze();
  console.log('Overall Score:', result3.score);
  console.log('Content Score:', result3.contentScore);
  console.log('Structure Checks:', result3.structureDetails.checks);
  console.log('Content Checks:', result3.contentDetails.checks);
  
  return {
    generalAnalysis: result1,
    roleBasedAnalysis: result2,
    fullContextAnalysis: result3
  };
}

// Export for use in other files
export { SAMPLE_RESUME };
