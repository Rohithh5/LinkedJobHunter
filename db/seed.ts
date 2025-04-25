import { db } from "./index";
import * as schema from "@shared/schema";
import { desc, eq, sql } from "drizzle-orm";

async function seed() {
  try {
    console.log("Starting seed...");

    // Check if we have users
    const existingUsers = await db.query.users.findMany({
      limit: 1
    });

    if (existingUsers.length > 0) {
      console.log("Database already has data. Skipping seed.");
      return;
    }

    // Create test user
    const [user] = await db.insert(schema.users).values({
      username: "testuser",
      password: "password123", // In production, this would be hashed
      email: "test@example.com",
      fullName: "Alex Johnson",
      linkedinConnected: true,
      lastSynced: new Date()
    }).returning();

    console.log(`Created user: ${user.username}`);

    // Create profile for user
    await db.insert(schema.profiles).values({
      userId: user.id,
      headline: "Senior Frontend Developer",
      summary: "Experienced developer with expertise in React, TypeScript, and modern frontend technologies.",
      location: "San Francisco, CA",
      phoneNumber: "555-123-4567",
      skills: ["JavaScript", "React", "TypeScript", "HTML/CSS", "Node.js", "GraphQL"]
    });

    console.log(`Created profile for user: ${user.id}`);

    // Create sample resume
    const [resume] = await db.insert(schema.resumes).values({
      userId: user.id,
      title: "Main Resume",
      content: "Professional resume content would go here.",
      isDefault: true
    }).returning();

    console.log(`Created resume: ${resume.title}`);

    // Create sample companies
    const companyData = [
      { name: "Airbnb Inc.", logo: "https://logo.clearbit.com/airbnb.com", website: "https://airbnb.com" },
      { name: "Stripe", logo: "https://logo.clearbit.com/stripe.com", website: "https://stripe.com" },
      { name: "Google", logo: "https://logo.clearbit.com/google.com", website: "https://google.com" },
      { name: "Facebook", logo: "https://logo.clearbit.com/facebook.com", website: "https://facebook.com" },
      { name: "Amazon", logo: "https://logo.clearbit.com/amazon.com", website: "https://amazon.com" },
      { name: "Microsoft", logo: "https://logo.clearbit.com/microsoft.com", website: "https://microsoft.com" },
      { name: "Spotify", logo: "https://logo.clearbit.com/spotify.com", website: "https://spotify.com" },
      { name: "Adobe", logo: "https://logo.clearbit.com/adobe.com", website: "https://adobe.com" },
      { name: "Netflix", logo: "https://logo.clearbit.com/netflix.com", website: "https://netflix.com" },
      { name: "Slack", logo: "https://logo.clearbit.com/slack.com", website: "https://slack.com" }
    ];

    const companies = await db.insert(schema.companies).values(companyData).returning();
    console.log(`Created ${companies.length} companies`);

    // Create sample jobs
    const jobsData = [
      {
        title: "Senior Frontend Developer",
        companyId: companies[0].id,
        description: "We are looking for a talented Frontend Developer to join our team. You will work on building user interfaces for our platform.",
        location: "Remote (US)",
        salary: "$120k - $150k",
        jobType: "full_time" as const,
        experienceLevel: "senior" as const,
        skills: ["JavaScript", "React", "TypeScript", "HTML/CSS"],
        isEasyApply: true,
        postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        url: "https://linkedin.com/jobs/view/123456"
      },
      {
        title: "Full Stack Engineer",
        companyId: companies[1].id,
        description: "Join our engineering team to build and scale our payment infrastructure.",
        location: "New York, NY",
        salary: "$140k - $170k",
        jobType: "full_time" as const,
        experienceLevel: "mid" as const,
        skills: ["JavaScript", "Node.js", "React", "PostgreSQL"],
        isEasyApply: true,
        postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        url: "https://linkedin.com/jobs/view/123457"
      },
      {
        title: "UI/UX Designer",
        companyId: companies[2].id,
        description: "Design beautiful and intuitive user interfaces for our products.",
        location: "Mountain View, CA",
        salary: "$110k - $140k",
        jobType: "full_time" as const,
        experienceLevel: "mid" as const,
        skills: ["Figma", "UI Design", "UX Research", "Prototyping"],
        isEasyApply: true,
        postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        url: "https://linkedin.com/jobs/view/123458"
      },
      {
        title: "Product Manager",
        companyId: companies[3].id,
        description: "Lead product development and strategy for our social media platform.",
        location: "Menlo Park, CA",
        salary: "$150k - $180k",
        jobType: "full_time" as const,
        experienceLevel: "senior" as const,
        skills: ["Product Strategy", "User Research", "Agile", "Market Analysis"],
        isEasyApply: true,
        postedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        url: "https://linkedin.com/jobs/view/123459"
      },
      {
        title: "React Developer",
        companyId: companies[4].id,
        description: "Build responsive and scalable frontend applications using React.",
        location: "Seattle, WA",
        salary: "$130k - $160k",
        jobType: "full_time" as const,
        experienceLevel: "mid" as const,
        skills: ["React", "JavaScript", "Redux", "CSS"],
        isEasyApply: true,
        postedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
        url: "https://linkedin.com/jobs/view/123460"
      },
      {
        title: "React Native Developer",
        companyId: companies[5].id,
        description: "Develop cross-platform mobile applications using React Native.",
        location: "Remote (US)",
        salary: "$120k - $150k",
        jobType: "full_time" as const,
        experienceLevel: "senior" as const,
        skills: ["React Native", "JavaScript", "iOS", "Android"],
        isEasyApply: true,
        postedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        url: "https://linkedin.com/jobs/view/123461"
      },
      {
        title: "Data Scientist",
        companyId: companies[6].id,
        description: "Analyze user data to improve our music recommendation algorithms.",
        location: "New York, NY",
        salary: "$140k - $170k",
        jobType: "full_time" as const,
        experienceLevel: "mid" as const,
        skills: ["Python", "Machine Learning", "SQL", "Statistics"],
        isEasyApply: true,
        postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        url: "https://linkedin.com/jobs/view/123462"
      },
      {
        title: "Product Designer",
        companyId: companies[7].id,
        description: "Create beautiful and intuitive design solutions for our creative tools.",
        location: "San Francisco, CA",
        salary: "$110k - $140k",
        jobType: "full_time" as const,
        experienceLevel: "senior" as const,
        skills: ["UI Design", "UX Design", "Adobe Creative Suite", "Figma"],
        isEasyApply: true,
        postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        url: "https://linkedin.com/jobs/view/123463"
      },
      {
        title: "Frontend Developer",
        companyId: companies[8].id,
        description: "Build user interfaces for our streaming platform.",
        location: "Los Angeles, CA",
        salary: "$115k - $145k",
        jobType: "full_time" as const,
        experienceLevel: "mid" as const,
        skills: ["JavaScript", "React", "TypeScript", "HTML/CSS"],
        isEasyApply: true,
        postedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        url: "https://linkedin.com/jobs/view/123464"
      },
      {
        title: "UI/UX Designer",
        companyId: companies[9].id,
        description: "Design intuitive interfaces for our collaboration platform.",
        location: "San Francisco, CA",
        salary: "$120k - $150k",
        jobType: "full_time" as const,
        experienceLevel: "mid" as const,
        skills: ["Figma", "UI Design", "UX Research"],
        isEasyApply: true,
        postedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        url: "https://linkedin.com/jobs/view/123465"
      }
    ];

    const jobs = await db.insert(schema.jobs).values(jobsData).returning();
    console.log(`Created ${jobs.length} jobs`);

    // Create sample job applications
    const jobAppsData = [
      {
        userId: user.id,
        jobId: jobs[0].id,
        resumeId: resume.id,
        applicationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        status: "in_review" as const,
        lastStatusUpdate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        notes: "Applied via LinkedIn Easy Apply"
      },
      {
        userId: user.id,
        jobId: jobs[1].id,
        resumeId: resume.id,
        applicationDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        status: "viewed" as const,
        lastStatusUpdate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        notes: "Application viewed by recruiter"
      },
      {
        userId: user.id,
        jobId: jobs[2].id,
        resumeId: resume.id,
        applicationDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        status: "interview_scheduled" as const,
        lastStatusUpdate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        notes: "Interview scheduled for next week"
      },
      {
        userId: user.id,
        jobId: jobs[3].id,
        resumeId: resume.id,
        applicationDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        status: "rejected" as const,
        lastStatusUpdate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        notes: "Rejected due to experience mismatch"
      },
      {
        userId: user.id,
        jobId: jobs[4].id,
        resumeId: resume.id,
        applicationDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
        status: "no_response" as const,
        lastStatusUpdate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
        notes: "No response yet"
      }
    ];

    const jobApps = await db.insert(schema.jobApplications).values(jobAppsData).returning();
    console.log(`Created ${jobApps.length} job applications`);

    // Create a search criteria
    await db.insert(schema.searchCriteria).values({
      userId: user.id,
      title: "Frontend Developer Search",
      keywords: ["Frontend", "React", "JavaScript"],
      location: "Remote",
      experienceLevel: "senior" as const,
      jobType: "full_time" as const,
      datePosted: "week",
      autoApply: true
    });

    console.log("Seed completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
