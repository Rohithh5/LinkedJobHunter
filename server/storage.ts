import { db } from "@db";
import * as schema from "@shared/schema";
import { and, eq, desc, sql, like, isNull, not, lt, gt, gte, lte, asc } from "drizzle-orm";

export const storage = {
  // User management
  getUserById: async (id: number) => {
    return await db.query.users.findFirst({
      where: eq(schema.users.id, id),
      with: {
        profiles: true
      }
    });
  },

  getUserByUsername: async (username: string) => {
    return await db.query.users.findFirst({
      where: eq(schema.users.username, username),
      with: {
        profiles: true
      }
    });
  },

  getUserByEmail: async (email: string) => {
    return await db.query.users.findFirst({
      where: eq(schema.users.email, email)
    });
  },

  getUserByLinkedinId: async (linkedinId: string) => {
    return await db.query.users.findFirst({
      where: eq(schema.users.linkedinId, linkedinId)
    });
  },

  insertUser: async (user: schema.InsertUser) => {
    const [newUser] = await db.insert(schema.users)
      .values(user)
      .returning();
    return newUser;
  },

  updateUser: async (id: number, userData: schema.UpdateUser) => {
    const [updatedUser] = await db.update(schema.users)
      .set({ ...userData, updated_at: new Date() })
      .where(eq(schema.users.id, id))
      .returning();
    return updatedUser;
  },

  // Profile management
  getProfileByUserId: async (userId: number) => {
    return await db.query.profiles.findFirst({
      where: eq(schema.profiles.userId, userId)
    });
  },

  insertProfile: async (profile: schema.InsertProfile) => {
    const [newProfile] = await db.insert(schema.profiles)
      .values(profile)
      .returning();
    return newProfile;
  },

  updateProfile: async (id: number, profileData: schema.UpdateProfile) => {
    const [updatedProfile] = await db.update(schema.profiles)
      .set({ ...profileData, updated_at: new Date() })
      .where(eq(schema.profiles.id, id))
      .returning();
    return updatedProfile;
  },

  // Resume management
  getResumesByUserId: async (userId: number) => {
    return await db.query.resumes.findMany({
      where: eq(schema.resumes.userId, userId),
      orderBy: [desc(schema.resumes.isDefault), desc(schema.resumes.updated_at)]
    });
  },

  getResumeById: async (id: number) => {
    return await db.query.resumes.findFirst({
      where: eq(schema.resumes.id, id)
    });
  },

  getDefaultResumeByUserId: async (userId: number) => {
    return await db.query.resumes.findFirst({
      where: and(
        eq(schema.resumes.userId, userId),
        eq(schema.resumes.isDefault, true)
      )
    });
  },

  insertResume: async (resume: schema.InsertResume) => {
    // If this is set as default, unset any existing default
    if (resume.isDefault) {
      await db.update(schema.resumes)
        .set({ isDefault: false })
        .where(and(
          eq(schema.resumes.userId, resume.userId),
          eq(schema.resumes.isDefault, true)
        ));
    }
    
    const [newResume] = await db.insert(schema.resumes)
      .values(resume)
      .returning();
    return newResume;
  },

  updateResume: async (id: number, resumeData: Partial<schema.InsertResume>) => {
    // If this is set as default, unset any existing default
    if (resumeData.isDefault) {
      const resume = await db.query.resumes.findFirst({
        where: eq(schema.resumes.id, id)
      });
      
      if (resume) {
        await db.update(schema.resumes)
          .set({ isDefault: false })
          .where(and(
            eq(schema.resumes.userId, resume.userId),
            eq(schema.resumes.isDefault, true),
            not(eq(schema.resumes.id, id))
          ));
      }
    }
    
    const [updatedResume] = await db.update(schema.resumes)
      .set({ ...resumeData, updated_at: new Date() })
      .where(eq(schema.resumes.id, id))
      .returning();
    return updatedResume;
  },

  deleteResume: async (id: number) => {
    const [deletedResume] = await db.delete(schema.resumes)
      .where(eq(schema.resumes.id, id))
      .returning();
    return deletedResume;
  },

  // Job management
  getJobs: async (filters: {
    title?: string,
    location?: string,
    experienceLevel?: schema.experienceLevelEnum.enumValues,
    jobType?: schema.jobTypeEnum.enumValues,
    isEasyApply?: boolean,
    datePosted?: string,
    limit?: number,
    offset?: number
  }) => {
    let query = db.select().from(schema.jobs)
      .leftJoin(schema.companies, eq(schema.jobs.companyId, schema.companies.id));

    // Apply filters
    if (filters.title) {
      query = query.where(like(schema.jobs.title, `%${filters.title}%`));
    }
    
    if (filters.location) {
      query = query.where(like(schema.jobs.location, `%${filters.location}%`));
    }
    
    if (filters.experienceLevel) {
      query = query.where(eq(schema.jobs.experienceLevel, filters.experienceLevel));
    }
    
    if (filters.jobType) {
      query = query.where(eq(schema.jobs.jobType, filters.jobType));
    }
    
    if (filters.isEasyApply !== undefined) {
      query = query.where(eq(schema.jobs.isEasyApply, filters.isEasyApply));
    }
    
    if (filters.datePosted) {
      const now = new Date();
      let date: Date;
      
      switch (filters.datePosted) {
        case 'day':
          date = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          date = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          date = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          date = new Date(0); // Beginning of time
      }
      
      query = query.where(gte(schema.jobs.postedDate, date));
    }
    
    // Add pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
      
      if (filters.offset) {
        query = query.offset(filters.offset);
      }
    }
    
    // Order by posted date, most recent first
    query = query.orderBy(desc(schema.jobs.postedDate));
    
    const result = await query;
    
    // Transform the result to merge company data with job
    return result.map(row => ({
      ...row.jobs,
      company: row.companies
    }));
  },

  getJobById: async (id: number) => {
    const result = await db.select()
      .from(schema.jobs)
      .leftJoin(schema.companies, eq(schema.jobs.companyId, schema.companies.id))
      .where(eq(schema.jobs.id, id));
    
    if (result.length === 0) return null;
    
    return {
      ...result[0].jobs,
      company: result[0].companies
    };
  },

  insertJob: async (job: schema.InsertJob) => {
    const [newJob] = await db.insert(schema.jobs)
      .values(job)
      .returning();
    return newJob;
  },

  updateJob: async (id: number, jobData: Partial<schema.InsertJob>) => {
    const [updatedJob] = await db.update(schema.jobs)
      .set(jobData)
      .where(eq(schema.jobs.id, id))
      .returning();
    return updatedJob;
  },

  // Company management
  getCompanyById: async (id: number) => {
    return await db.query.companies.findFirst({
      where: eq(schema.companies.id, id)
    });
  },

  getCompanyByName: async (name: string) => {
    return await db.query.companies.findFirst({
      where: eq(schema.companies.name, name)
    });
  },

  insertCompany: async (company: schema.InsertCompany) => {
    const [newCompany] = await db.insert(schema.companies)
      .values(company)
      .returning();
    return newCompany;
  },

  // Job application management
  getJobApplicationsByUserId: async (userId: number, status?: schema.applicationStatusEnum.enumValues) => {
    let query = db.select({
      application: schema.jobApplications,
      job: schema.jobs,
      company: schema.companies
    })
    .from(schema.jobApplications)
    .innerJoin(schema.jobs, eq(schema.jobApplications.jobId, schema.jobs.id))
    .innerJoin(schema.companies, eq(schema.jobs.companyId, schema.companies.id))
    .where(eq(schema.jobApplications.userId, userId));
    
    if (status) {
      query = query.where(eq(schema.jobApplications.status, status));
    }
    
    return await query.orderBy(desc(schema.jobApplications.applicationDate));
  },

  getRecentJobApplications: async (userId: number, limit: number = 5) => {
    return await db.select({
      application: schema.jobApplications,
      job: schema.jobs,
      company: schema.companies
    })
    .from(schema.jobApplications)
    .innerJoin(schema.jobs, eq(schema.jobApplications.jobId, schema.jobs.id))
    .innerJoin(schema.companies, eq(schema.jobs.companyId, schema.companies.id))
    .where(eq(schema.jobApplications.userId, userId))
    .orderBy(desc(schema.jobApplications.applicationDate))
    .limit(limit);
  },

  getJobApplicationById: async (id: number) => {
    const result = await db.select({
      application: schema.jobApplications,
      job: schema.jobs,
      company: schema.companies,
      resume: schema.resumes
    })
    .from(schema.jobApplications)
    .innerJoin(schema.jobs, eq(schema.jobApplications.jobId, schema.jobs.id))
    .innerJoin(schema.companies, eq(schema.jobs.companyId, schema.companies.id))
    .leftJoin(schema.resumes, eq(schema.jobApplications.resumeId, schema.resumes.id))
    .where(eq(schema.jobApplications.id, id));
    
    return result.length > 0 ? result[0] : null;
  },

  insertJobApplication: async (application: schema.InsertJobApplication) => {
    const [newApplication] = await db.insert(schema.jobApplications)
      .values(application)
      .returning();
    return newApplication;
  },

  updateJobApplication: async (id: number, applicationData: schema.UpdateJobApplication) => {
    const [updatedApplication] = await db.update(schema.jobApplications)
      .set({ ...applicationData, updated_at: new Date() })
      .where(eq(schema.jobApplications.id, id))
      .returning();
    return updatedApplication;
  },

  getApplicationStats: async (userId: number) => {
    // Total applications
    const totalApplications = await db.select({ count: sql<number>`count(*)` })
      .from(schema.jobApplications)
      .where(eq(schema.jobApplications.userId, userId));
    
    // Responses received (viewed, interview_scheduled, rejected, hired)
    const responsesReceived = await db.select({ count: sql<number>`count(*)` })
      .from(schema.jobApplications)
      .where(and(
        eq(schema.jobApplications.userId, userId),
        not(eq(schema.jobApplications.status, 'applied')),
        not(eq(schema.jobApplications.status, 'no_response'))
      ));
    
    // Interviews scheduled
    const interviewsScheduled = await db.select({ count: sql<number>`count(*)` })
      .from(schema.jobApplications)
      .where(and(
        eq(schema.jobApplications.userId, userId),
        eq(schema.jobApplications.status, 'interview_scheduled')
      ));
    
    // Success rate (interviews / total)
    const successRate = totalApplications[0].count > 0 
      ? Math.round((interviewsScheduled[0].count / totalApplications[0].count) * 100) 
      : 0;
    
    return {
      totalApplications: totalApplications[0].count,
      responsesReceived: responsesReceived[0].count,
      interviewsScheduled: interviewsScheduled[0].count,
      successRate
    };
  },

  // Search criteria management
  getSearchCriteriaByUserId: async (userId: number) => {
    return await db.query.searchCriteria.findMany({
      where: eq(schema.searchCriteria.userId, userId),
      orderBy: [desc(schema.searchCriteria.updated_at)]
    });
  },

  getSearchCriteriaById: async (id: number) => {
    return await db.query.searchCriteria.findFirst({
      where: eq(schema.searchCriteria.id, id)
    });
  },

  insertSearchCriteria: async (criteria: schema.InsertSearchCriteria) => {
    const [newCriteria] = await db.insert(schema.searchCriteria)
      .values(criteria)
      .returning();
    return newCriteria;
  },

  updateSearchCriteria: async (id: number, criteriaData: Partial<schema.InsertSearchCriteria>) => {
    const [updatedCriteria] = await db.update(schema.searchCriteria)
      .set({ ...criteriaData, updated_at: new Date() })
      .where(eq(schema.searchCriteria.id, id))
      .returning();
    return updatedCriteria;
  },

  deleteSearchCriteria: async (id: number) => {
    const [deletedCriteria] = await db.delete(schema.searchCriteria)
      .where(eq(schema.searchCriteria.id, id))
      .returning();
    return deletedCriteria;
  },

  // Recommended jobs - based on user profile skills
  getRecommendedJobs: async (userId: number, limit: number = 3) => {
    // Get user profile skills
    const profile = await db.query.profiles.findFirst({
      where: eq(schema.profiles.userId, userId)
    });
    
    if (!profile || !profile.skills || profile.skills.length === 0) {
      // Fallback: just get recent easy apply jobs
      return await db.select({
        job: schema.jobs,
        company: schema.companies
      })
      .from(schema.jobs)
      .innerJoin(schema.companies, eq(schema.jobs.companyId, schema.companies.id))
      .where(eq(schema.jobs.isEasyApply, true))
      .orderBy(desc(schema.jobs.postedDate))
      .limit(limit);
    }
    
    // Find jobs matching user skills
    // This is a simplified approach - in production, we would use more sophisticated matching
    const result = await db.select({
      job: schema.jobs,
      company: schema.companies
    })
    .from(schema.jobs)
    .innerJoin(schema.companies, eq(schema.jobs.companyId, schema.companies.id))
    .where(eq(schema.jobs.isEasyApply, true))
    .orderBy(desc(schema.jobs.postedDate))
    .limit(limit * 3); // Get more than needed for filtering
    
    // Score each job by matching skills
    const scoredJobs = result.map(row => {
      let score = 0;
      
      if (row.job.skills) {
        // Count matching skills
        score = row.job.skills.filter(skill => 
          profile.skills.includes(skill)
        ).length;
      }
      
      return { ...row, score };
    });
    
    // Sort by score (highest first) and take the top 'limit' jobs
    return scoredJobs
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
};
