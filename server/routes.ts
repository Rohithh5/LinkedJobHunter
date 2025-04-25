import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import pgSession from "connect-pg-simple";
import { pool } from "@db";
import passport from "passport";
import * as schema from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

const PgSession = pgSession(session);

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup
  app.use(
    session({
      store: new PgSession({
        pool,
        tableName: "session",
        createTableIfMissing: true,
      }),
      secret: process.env.SESSION_SECRET || "linkedin-job-apply-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      },
    })
  );

  // Passport setup
  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUserById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Middleware to check if user is authenticated
  const isAuthenticated = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // API routes
  const apiPrefix = "/api";

  // Auth routes
  app.post(`${apiPrefix}/auth/register`, async (req, res) => {
    try {
      const userData = schema.insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      // Create user
      const newUser = await storage.insertUser(userData);
      
      // Create empty profile
      await storage.insertProfile({
        userId: newUser.id,
        skills: []
      });
      
      // Log in the user
      req.login(newUser, (err: any) => {
        if (err) {
          return res.status(500).json({ message: "Login failed after registration" });
        }
        return res.status(201).json({ id: newUser.id, username: newUser.username });
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Registration failed" });
    }
  });

  app.post(`${apiPrefix}/auth/login`, (req, res, next) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      passport.authenticate("local", (err: any, user: any) => {
        if (err) {
          return next(err);
        }
        if (!user) {
          return res.status(401).json({ message: "Invalid credentials" });
        }
        
        req.login(user, (loginErr) => {
          if (loginErr) {
            return next(loginErr);
          }
          return res.json({ id: user.id, username: user.username });
        });
      })(req, res, next);
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post(`${apiPrefix}/auth/logout`, (req, res) => {
    req.logout(() => {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: "Logout failed" });
        }
        res.clearCookie("connect.sid");
        return res.json({ message: "Logged out successfully" });
      });
    });
  });

  app.get(`${apiPrefix}/auth/status`, (req, res) => {
    if (req.isAuthenticated()) {
      return res.json({ 
        isAuthenticated: true, 
        user: { 
          id: req.user.id, 
          username: req.user.username,
          fullName: req.user.fullName,
          linkedinConnected: req.user.linkedinConnected 
        } 
      });
    }
    res.json({ isAuthenticated: false });
  });

  // User routes
  app.get(`${apiPrefix}/user/profile`, isAuthenticated, async (req: any, res) => {
    try {
      const profile = await storage.getProfileByUserId(req.user.id);
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.put(`${apiPrefix}/user/profile`, isAuthenticated, async (req: any, res) => {
    try {
      const profileData = schema.updateProfileSchema.parse(req.body);
      
      // Get the profile
      const profile = await storage.getProfileByUserId(req.user.id);
      
      if (!profile) {
        // Create profile if it doesn't exist
        const newProfile = await storage.insertProfile({
          userId: req.user.id,
          ...profileData
        });
        return res.json(newProfile);
      }
      
      // Update existing profile
      const updatedProfile = await storage.updateProfile(profile.id, profileData);
      res.json(updatedProfile);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Resumes routes
  app.get(`${apiPrefix}/resumes`, isAuthenticated, async (req: any, res) => {
    try {
      const resumes = await storage.getResumesByUserId(req.user.id);
      res.json(resumes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resumes" });
    }
  });

  app.get(`${apiPrefix}/resumes/:id`, isAuthenticated, async (req: any, res) => {
    try {
      const resume = await storage.getResumeById(parseInt(req.params.id));
      
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      
      // Check if the resume belongs to the user
      if (resume.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to access this resume" });
      }
      
      res.json(resume);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resume" });
    }
  });

  app.post(`${apiPrefix}/resumes`, isAuthenticated, async (req: any, res) => {
    try {
      const resumeData = schema.insertResumeSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const newResume = await storage.insertResume(resumeData);
      res.status(201).json(newResume);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create resume" });
    }
  });

  app.put(`${apiPrefix}/resumes/:id`, isAuthenticated, async (req: any, res) => {
    try {
      const resume = await storage.getResumeById(parseInt(req.params.id));
      
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      
      // Check if the resume belongs to the user
      if (resume.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this resume" });
      }
      
      const updatedResume = await storage.updateResume(parseInt(req.params.id), req.body);
      res.json(updatedResume);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update resume" });
    }
  });

  app.delete(`${apiPrefix}/resumes/:id`, isAuthenticated, async (req: any, res) => {
    try {
      const resume = await storage.getResumeById(parseInt(req.params.id));
      
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      
      // Check if the resume belongs to the user
      if (resume.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this resume" });
      }
      
      await storage.deleteResume(parseInt(req.params.id));
      res.json({ message: "Resume deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete resume" });
    }
  });

  // Job routes
  app.get(`${apiPrefix}/jobs`, async (req, res) => {
    try {
      const filters: any = {};
      
      // Parse query parameters
      if (req.query.title) filters.title = req.query.title as string;
      if (req.query.location) filters.location = req.query.location as string;
      if (req.query.experienceLevel) filters.experienceLevel = req.query.experienceLevel as any;
      if (req.query.jobType) filters.jobType = req.query.jobType as any;
      if (req.query.isEasyApply) filters.isEasyApply = req.query.isEasyApply === 'true';
      if (req.query.datePosted) filters.datePosted = req.query.datePosted as string;
      
      // Pagination
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      filters.limit = limit;
      filters.offset = (page - 1) * limit;
      
      const jobs = await storage.getJobs(filters);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.get(`${apiPrefix}/jobs/:id`, async (req, res) => {
    try {
      const job = await storage.getJobById(parseInt(req.params.id));
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch job" });
    }
  });

  // Job applications routes
  app.get(`${apiPrefix}/applications`, isAuthenticated, async (req: any, res) => {
    try {
      const status = req.query.status as any;
      const applications = await storage.getJobApplicationsByUserId(req.user.id, status);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.get(`${apiPrefix}/applications/recent`, isAuthenticated, async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const applications = await storage.getRecentJobApplications(req.user.id, limit);
      res.json(applications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent applications" });
    }
  });

  app.get(`${apiPrefix}/applications/:id`, isAuthenticated, async (req: any, res) => {
    try {
      const application = await storage.getJobApplicationById(parseInt(req.params.id));
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Check if the application belongs to the user
      if (application.application.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to access this application" });
      }
      
      res.json(application);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch application" });
    }
  });

  app.post(`${apiPrefix}/applications`, isAuthenticated, async (req: any, res) => {
    try {
      const applicationData = schema.insertJobApplicationSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const newApplication = await storage.insertJobApplication(applicationData);
      res.status(201).json(newApplication);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create application" });
    }
  });

  app.put(`${apiPrefix}/applications/:id`, isAuthenticated, async (req: any, res) => {
    try {
      const application = await storage.getJobApplicationById(parseInt(req.params.id));
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // Check if the application belongs to the user
      if (application.application.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this application" });
      }
      
      const updatedApplication = await storage.updateJobApplication(
        parseInt(req.params.id), 
        req.body
      );
      res.json(updatedApplication);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  // Dashboard statistics
  app.get(`${apiPrefix}/stats`, isAuthenticated, async (req: any, res) => {
    try {
      const stats = await storage.getApplicationStats(req.user.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Recommended jobs
  app.get(`${apiPrefix}/recommended-jobs`, isAuthenticated, async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const jobs = await storage.getRecommendedJobs(req.user.id, limit);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recommended jobs" });
    }
  });

  // Search criteria routes
  app.get(`${apiPrefix}/search-criteria`, isAuthenticated, async (req: any, res) => {
    try {
      const criteria = await storage.getSearchCriteriaByUserId(req.user.id);
      res.json(criteria);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch search criteria" });
    }
  });

  app.post(`${apiPrefix}/search-criteria`, isAuthenticated, async (req: any, res) => {
    try {
      const criteriaData = schema.insertSearchCriteriaSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      const newCriteria = await storage.insertSearchCriteria(criteriaData);
      res.status(201).json(newCriteria);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create search criteria" });
    }
  });

  app.put(`${apiPrefix}/search-criteria/:id`, isAuthenticated, async (req: any, res) => {
    try {
      const criteria = await storage.getSearchCriteriaById(parseInt(req.params.id));
      
      if (!criteria) {
        return res.status(404).json({ message: "Search criteria not found" });
      }
      
      // Check if the criteria belongs to the user
      if (criteria.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this search criteria" });
      }
      
      const updatedCriteria = await storage.updateSearchCriteria(
        parseInt(req.params.id), 
        req.body
      );
      res.json(updatedCriteria);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to update search criteria" });
    }
  });

  app.delete(`${apiPrefix}/search-criteria/:id`, isAuthenticated, async (req: any, res) => {
    try {
      const criteria = await storage.getSearchCriteriaById(parseInt(req.params.id));
      
      if (!criteria) {
        return res.status(404).json({ message: "Search criteria not found" });
      }
      
      // Check if the criteria belongs to the user
      if (criteria.userId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this search criteria" });
      }
      
      await storage.deleteSearchCriteria(parseInt(req.params.id));
      res.json({ message: "Search criteria deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete search criteria" });
    }
  });

  // LinkedIn integration - placeholder routes
  // In a real implementation, we would use the LinkedIn API
  app.get(`${apiPrefix}/linkedin/connect`, isAuthenticated, (req, res) => {
    // Redirect to LinkedIn OAuth flow
    res.json({ message: "This would redirect to LinkedIn OAuth" });
  });

  app.get(`${apiPrefix}/linkedin/callback`, isAuthenticated, async (req: any, res) => {
    try {
      // This would handle the OAuth callback from LinkedIn
      // For demo purposes, we're simulating successful connection
      await storage.updateUser(req.user.id, {
        linkedinConnected: true,
        linkedinId: "linkedin123",
        linkedinAccessToken: "sample-token",
        linkedinTokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        lastSynced: new Date()
      });
      
      // Redirect to dashboard
      res.redirect("/");
    } catch (error) {
      res.status(500).json({ message: "Failed to connect LinkedIn account" });
    }
  });

  app.post(`${apiPrefix}/linkedin/disconnect`, isAuthenticated, async (req: any, res) => {
    try {
      await storage.updateUser(req.user.id, {
        linkedinConnected: false,
        linkedinAccessToken: null,
        linkedinTokenExpiry: null
      });
      
      res.json({ message: "LinkedIn account disconnected successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to disconnect LinkedIn account" });
    }
  });

  // Apply for a job
  app.post(`${apiPrefix}/apply`, isAuthenticated, async (req: any, res) => {
    try {
      const { jobId, resumeId, notes } = req.body;
      
      if (!jobId) {
        return res.status(400).json({ message: "Job ID is required" });
      }
      
      const job = await storage.getJobById(parseInt(jobId));
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      // Check if already applied to this job
      const existingApplications = await storage.getJobApplicationsByUserId(req.user.id);
      const alreadyApplied = existingApplications.some(app => app.application.jobId === parseInt(jobId));
      
      if (alreadyApplied) {
        return res.status(400).json({ message: "You have already applied to this job" });
      }
      
      // Get default resume if none specified
      let actualResumeId = resumeId;
      if (!actualResumeId) {
        const defaultResume = await storage.getDefaultResumeByUserId(req.user.id);
        if (defaultResume) {
          actualResumeId = defaultResume.id;
        }
      }
      
      // Create job application
      const newApplication = await storage.insertJobApplication({
        userId: req.user.id,
        jobId: parseInt(jobId),
        resumeId: actualResumeId ? parseInt(actualResumeId) : null,
        notes,
        status: 'applied',
        applicationDate: new Date(),
        lastStatusUpdate: new Date()
      });
      
      res.status(201).json(newApplication);
    } catch (error) {
      res.status(500).json({ message: "Failed to apply for job" });
    }
  });

  // Apply for multiple jobs
  app.post(`${apiPrefix}/apply-batch`, isAuthenticated, async (req: any, res) => {
    try {
      const { jobIds, resumeId } = req.body;
      
      if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
        return res.status(400).json({ message: "Job IDs are required" });
      }
      
      // Get default resume if none specified
      let actualResumeId = resumeId;
      if (!actualResumeId) {
        const defaultResume = await storage.getDefaultResumeByUserId(req.user.id);
        if (defaultResume) {
          actualResumeId = defaultResume.id;
        }
      }
      
      // Apply to each job
      const results = [];
      for (const jobId of jobIds) {
        try {
          const job = await storage.getJobById(parseInt(jobId));
          
          if (!job) {
            results.push({ jobId, success: false, message: "Job not found" });
            continue;
          }
          
          // Check if already applied to this job
          const existingApplications = await storage.getJobApplicationsByUserId(req.user.id);
          const alreadyApplied = existingApplications.some(app => app.application.jobId === parseInt(jobId));
          
          if (alreadyApplied) {
            results.push({ jobId, success: false, message: "Already applied" });
            continue;
          }
          
          // Create job application
          const newApplication = await storage.insertJobApplication({
            userId: req.user.id,
            jobId: parseInt(jobId),
            resumeId: actualResumeId ? parseInt(actualResumeId) : null,
            notes: "Applied via batch auto-apply",
            status: 'applied',
            applicationDate: new Date(),
            lastStatusUpdate: new Date()
          });
          
          results.push({ jobId, success: true, applicationId: newApplication.id });
        } catch (error) {
          results.push({ jobId, success: false, message: "Failed to apply" });
        }
      }
      
      res.status(201).json({ results });
    } catch (error) {
      res.status(500).json({ message: "Failed to process batch applications" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
