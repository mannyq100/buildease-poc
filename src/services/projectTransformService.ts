import type { Project, ProjectImage, ProjectStatus } from '@/types/project';
import { supabase } from '@/lib/supabase';

// Custom error classes for better error handling
export class ProjectTransformError extends Error {
  constructor(message: string, public readonly field?: string, public readonly originalData?: any) {
    super(message);
    this.name = 'ProjectTransformError';
  }
}

export class ProjectValidationError extends Error {
  constructor(message: string, public readonly field: string, public readonly value?: any) {
    super(message);
    this.name = 'ProjectValidationError';
  }
}

// Interface for owner info structure
export interface OwnerInfo {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
}

// Interface for enriched owner data from be_user table
export interface EnrichedOwnerData {
  id: string;
  first_name: string;
  last_name?: string | null;
  phone?: string | null;
  email: string;
}

// Interface for the raw data from database views with strict typing
export interface ProjectViewData {
  // Required fields
  id: string;
  name: string;
  owner_id: string;
  status: string;
  client: string;
  location: string;
  project_type: string;
  budget: number;
  spent: number;
  currency: string;
  spent_percentage: number;
  remaining: number;
  progress: number;
  health: string;
  owner_name: string;
  phases: number;
  materials: number;
  documents: number;
  members: number;
  transactions: number;
  created_at: string;
  updated_at: string;
  
  // Optional fields
  description?: string | null;
  profile_image?: string | null;
  inspiration_images?: string[] | null;
  progress_images?: string[] | null;
  start_date?: string | null;
  end_date?: string | null;
  
  // Additional fields for project_details view
  details?: any;
  timeline?: any;
  budget_data?: any;
  location_data?: any;
  specs?: any;
  materials_config?: any;
  features?: any;
  constraints?: any;
  owner_info?: any;
  recent_phases?: any[];
  recent_transactions?: any[];
}

/**
 * Minimal transformation service for project data
 * Most transformations now handled by database views
 */
export class ProjectTransformService {
  /**
   * Transform project data to Project interface
   * Handles both view data and base table data
   */
  static transformProjectSummary(rawData: any): Project {
    try {
      // Validate required fields
      this.validateRequiredFields(rawData);
      
      // Handle both view and base table structures
      const isBaseTable = rawData.details && rawData.timeline && rawData.budget && typeof rawData.budget === 'object';
      
      if (isBaseTable) {
        return this.transformFromBaseTable(rawData);
      } else {
        return this.transformFromView(rawData);
      }
    } catch (error) {
      if (error instanceof ProjectTransformError || error instanceof ProjectValidationError) {
        throw error;
      }
      throw new ProjectTransformError(
        `Failed to transform project data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        rawData
      );
    }
  }

  /**
   * Transform data from base table structure
   */
  private static transformFromBaseTable(data: any): Project {
    // Extract data from JSONB fields
    const details = data.details || {};
    const timeline = data.timeline || {};
    const budget = data.budget || {};
    
    return {
      // Direct mappings
      id: this.validateString(data.id, 'id'),
      name: this.validateString(data.name, 'name'),
      description: data.description || '',
      owner_id: data.owner_id || 'unknown',
      status: this.mapDBStatusToUIStatus(data.status || 'PLANNING'),
      
      // Visual assets
      profile_image: this.validateOptionalString(data.profile_image),
      inspiration_images: this.validateStringArray(data.inspiration_images),
      progress_images: this.validateStringArray(data.progress_images),
      inspirationalImages: this.transformProjectImages(data.inspiration_images, 'inspiration'),
      progressImages: this.transformProjectImages(data.progress_images, 'progress'),
      
      // Extract from details JSONB
      client: details.client || 'Unknown Client',
      location: this.formatLocation(details.location),
      project_type: details.project_type || 'Construction',
      
      // Extract from timeline JSONB
      start_date: timeline.planned_start || data.created_at || new Date().toISOString(),
      end_date: timeline.planned_end || new Date().toISOString(),
      
      // Extract from budget JSONB - always use user's set currency
      budget: this.safeParseNumber(budget.allocated),
      spent: this.safeParseNumber(budget.spent),
      currency: budget.currency || 'USD', // This preserves the user's original currency choice
      spent_percentage: this.safeParseNumber(budget.allocated) > 0 ? 
        Math.round((this.safeParseNumber(budget.spent) / this.safeParseNumber(budget.allocated)) * 100) : 0,
      remaining: this.safeParseNumber(budget.allocated) - this.safeParseNumber(budget.spent),
      
      // Default values for missing calculated fields
      progress: 0,
      health: 'good' as const,
      owner_name: this.getOwnerName(details.owner_info, null),
      
      // Default counts (would need separate queries)
      phases: 0,
      materials: 0,
      documents: 0,
      members: 0,
      transactions: 0,
      
      // UI-only fields
      teamMembers: [],
      activities: [],
      tags: this.generateTags(data),
      
      // Audit fields
      created_at: this.validateString(data.created_at, 'created_at'),
      updated_at: this.validateString(data.updated_at, 'updated_at'),
    };
  }

  /**
   * Transform data from view structure
   */
  private static transformFromView(viewData: ProjectViewData): Project {
    return {
      // Direct mappings from view (no transformation needed)
      id: this.validateString(viewData.id, 'id'),
      name: this.validateString(viewData.name, 'name'),
      description: viewData.description || '',
      owner_id: viewData.owner_id || 'unknown',
      status: this.validateStatus(viewData.status),
    
      // Visual assets
      profile_image: this.validateOptionalString(viewData.profile_image),
      inspiration_images: this.validateStringArray(viewData.inspiration_images),
      progress_images: this.validateStringArray(viewData.progress_images),
      inspirationalImages: this.transformProjectImages(viewData.inspiration_images, 'inspiration'),
      progressImages: this.transformProjectImages(viewData.progress_images, 'progress'),
      
      // Project details (already formatted by view)
      client: this.validateString(viewData.client, 'client'),
      location: this.validateString(viewData.location, 'location'),
      project_type: this.validateString(viewData.project_type, 'project_type'),
      
      // Timeline (keep as strings, safe defaults)
      start_date: this.validateOptionalString(viewData.start_date) || viewData.created_at || new Date().toISOString(),
      end_date: this.validateOptionalString(viewData.end_date) || new Date().toISOString(),
      
      // Financial data (already calculated by view)
      budget: this.validateNumber(viewData.budget, 'budget'),
      spent: this.validateNumber(viewData.spent, 'spent'),
      currency: this.validateString(viewData.currency, 'currency') || 'USD',
      spent_percentage: this.validateNumber(viewData.spent_percentage, 'spent_percentage'),
      remaining: this.validateNumber(viewData.remaining, 'remaining'),
      
      // Progress and health (already calculated by view)
      progress: this.validateNumber(viewData.progress, 'progress', 0, 100),
      health: this.validateHealth(viewData.health),
      
      // Owner
      owner_name: this.validateString(viewData.owner_name, 'owner_name'),
      
      // Counts (already calculated by view)
      phases: this.validateNumber(viewData.phases, 'phases', 0),
      materials: this.validateNumber(viewData.materials, 'materials', 0),
      documents: this.validateNumber(viewData.documents, 'documents', 0),
      members: this.validateNumber(viewData.members, 'members', 0),
      transactions: this.validateNumber(viewData.transactions, 'transactions', 0),
      
      // UI-only fields
      teamMembers: [],
      activities: [],
      tags: this.generateTags(viewData),
      
      // Audit fields
      created_at: this.validateString(viewData.created_at, 'created_at'),
      updated_at: this.validateString(viewData.updated_at, 'updated_at'),
    };
  }

  /**
   * Transform project details view data (includes extended nested data)
   * Async version that supports owner info enrichment
   */
  static async transformProjectDetailsAsync(viewData: any): Promise<Project> {
    // First enrich owner info if needed
    const enrichedData = await this.enrichOwnerInfo(viewData);
    return this.transformProjectDetails(enrichedData);
  }
  
  /**
   * Transform project details view data (includes extended nested data)
   * Synchronous version for backward compatibility
   */
  static transformProjectDetails(viewData: any): Project {
    const baseProject = this.transformProjectSummary(viewData);
    
    return {
      ...baseProject,
      
      // Extended data from project_details view
      details: viewData.details,
      timeline: viewData.timeline,
      budget_data: viewData.budget,
      location_data: viewData.location_data,
      specs: viewData.specs,
      materials_config: viewData.materials_config,
      features: viewData.features,
      constraints: viewData.constraints,
      owner_info: viewData.owner_info,
      recent_phases: viewData.recent_phases || [],
      recent_transactions: viewData.recent_transactions || [],
      
      // Combine recent activities
      activities: this.combineRecentActivities(
        viewData.recent_phases || [],
        viewData.recent_transactions || []
      ),
    };
  }

  /**
   * Transform project images from string array to ProjectImage array
   * Null-safe implementation with proper validation
   */
  private static transformProjectImages(images?: string[] | null, imageType: 'inspiration' | 'progress' = 'inspiration'): ProjectImage[] {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return [];
    }
    
    return images
      .filter((url): url is string => {
        // Filter out null, undefined, empty strings, and invalid URLs
        if (typeof url !== 'string' || !url.trim()) {
          return false;
        }
        
        // Basic URL validation (could be enhanced with proper URL validation)
        try {
          new URL(url);
          return true;
        } catch {
          // If it's not a valid URL, check if it's a relative path
          return url.startsWith('/') || url.startsWith('./') || url.startsWith('../');
        }
      })
      .map((url, index) => ({
        id: `${imageType}-${index}-${Date.now()}`, // More unique IDs
        url: url.trim(),
        caption: imageType === 'progress' ? `Progress ${index + 1}` : `Inspiration ${index + 1}`,
        uploadedAt: new Date(),
        type: imageType as const,
      }));
  }

  /**
   * Legacy method for backward compatibility
   */
  private static transformInspirationImages(images?: string[] | null): ProjectImage[] {
    return this.transformProjectImages(images, 'inspiration');
  }

  /**
   * Combine recent activities from phases and transactions
   * Null-safe implementation with proper date handling
   */
  private static combineRecentActivities(phases: any[] | null | undefined, transactions: any[] | null | undefined): any[] {
    const activities: any[] = [];
    
    // Safely process phases
    if (Array.isArray(phases)) {
      const validPhases = phases
        .filter(phase => phase && typeof phase === 'object')
        .map(phase => {
          try {
            return {
              ...phase,
              timestamp: this.parseDate(phase.date || phase.created_at || phase.updated_at),
              type: 'phase'
            };
          } catch {
            return null;
          }
        })
        .filter(Boolean);
      
      activities.push(...validPhases);
    }
    
    // Safely process transactions
    if (Array.isArray(transactions)) {
      const validTransactions = transactions
        .filter(transaction => transaction && typeof transaction === 'object')
        .map(transaction => {
          try {
            return {
              ...transaction,
              timestamp: this.parseDate(transaction.date || transaction.created_at || transaction.updated_at),
              type: 'transaction'
            };
          } catch {
            return null;
          }
        })
        .filter(Boolean);
      
      activities.push(...validTransactions);
    }

    // Sort by timestamp, most recent first, with null safety
    return activities
      .filter(activity => activity && activity.timestamp)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10); // Keep only 10 most recent
  }

  /**
   * Generate tags based on project data
   * Null-safe implementation with proper validation
   */
  private static generateTags(project: any): string[] {
    if (!project || typeof project !== 'object') {
      return [];
    }
    
    const tags: string[] = [];
    
    // Add project type tag
    if (typeof project.project_type === 'string' && project.project_type.trim()) {
      tags.push(project.project_type.toLowerCase().trim());
    }
    
    // Add status-based tags
    if (typeof project.status === 'string') {
      const status = project.status.toLowerCase().trim();
      if (status === 'completed') {
        tags.push('completed');
      } else if (status === 'active') {
        tags.push('in-progress');
      }
    }
    
    // Add health-based tags
    if (typeof project.health === 'string' && project.health.trim()) {
      tags.push(`health-${project.health.toLowerCase().trim()}`);
    }
    
    // Add budget-based tags (with null safety)
    const budget = this.safeParseNumber(project.budget);
    if (budget > 0) {
      if (budget > 10000000) tags.push('large-scale');
      else if (budget > 1000000) tags.push('medium-scale');
      else tags.push('small-scale');
    }
    
    // Add progress-based tags (with null safety)
    const progress = this.safeParseNumber(project.progress);
    if (progress >= 80) tags.push('near-completion');
    else if (progress >= 50) tags.push('mid-progress');
    else if (progress > 0) tags.push('started');
    else tags.push('not-started');
    
    // Remove duplicates and empty strings
    return Array.from(new Set(tags.filter(tag => tag && tag.trim())));
  }

  /**
   * Transform arrays of projects with owner info enrichment and proper error handling
   */
  static async transformProjects(viewData: ProjectViewData[]): Promise<Project[]> {
    if (!Array.isArray(viewData)) {
      throw new ProjectTransformError('Input data must be an array', undefined, viewData);
    }
    
    if (viewData.length === 0) {
      return [];
    }
    
    // First, enrich owner info for all projects
    const enrichedProjects = await this.enrichOwnerInfoBatch(viewData);
    
    const results: Project[] = [];
    const errors: { index: number; error: Error; data: any }[] = [];
    
    enrichedProjects.forEach((item, index) => {
      try {
        if (item && typeof item === 'object') {
          results.push(this.transformProjectSummary(item));
        }
      } catch (error) {
        errors.push({ 
          index, 
          error: error instanceof Error ? error : new Error('Unknown transformation error'), 
          data: item 
        });
      }
    });
    
    // Log errors but don't fail the entire operation
    if (errors.length > 0) {
      console.warn(`ProjectTransformService: Failed to transform ${errors.length} of ${viewData.length} projects:`, errors);
    }
    
    return results;
  }

  /**
   * Synchronous version for backward compatibility when owner info is already complete
   */
  static transformProjectsSync(viewData: ProjectViewData[]): Project[] {
    if (!Array.isArray(viewData)) {
      throw new ProjectTransformError('Input data must be an array', undefined, viewData);
    }
    
    const results: Project[] = [];
    const errors: { index: number; error: Error; data: any }[] = [];
    
    viewData.forEach((item, index) => {
      try {
        if (item && typeof item === 'object') {
          results.push(this.transformProjectSummary(item));
        }
      } catch (error) {
        errors.push({ 
          index, 
          error: error instanceof Error ? error : new Error('Unknown transformation error'), 
          data: item 
        });
      }
    });
    
    // Log errors but don't fail the entire operation
    if (errors.length > 0) {
      console.warn(`ProjectTransformService: Failed to transform ${errors.length} of ${viewData.length} projects:`, errors);
    }
    
    return results;
  }

  /**
   * Helper: Safely convert date string to Date object
   */
  static toDateObject(dateString?: string): Date {
    if (!dateString) return new Date();
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date() : date;
  }

  /**
   * Helper: Format date for display
   */
  static formatDate(dateString?: string, options?: Intl.DateTimeFormatOptions): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleDateString('en-US', options || {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  }

  /**
   * Transform single project for mutations (UI -> DB format)
   */
  static transformForMutation(project: Partial<Project>) {
    try {
      return {
        name: project.name,
        description: project.description,
        status: project.status,
        details: project.details,
        timeline: project.timeline,
        budget: project.budget_data,
        profile_image: project.profile_image,
        inspiration_images: project.inspiration_images,
      };
    } catch (error) {
      throw new ProjectTransformError(
        `Failed to transform project for mutation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        project
      );
    }
  }

  // Validation methods
  private static validateRequiredFields(data: any): void {
    const requiredFields = ['id', 'name', 'created_at', 'updated_at'];
    
    for (const field of requiredFields) {
      if (!data[field]) {
        throw new ProjectValidationError(`Required field '${field}' is missing or empty`, field, data[field]);
      }
    }
    
    // Log debug info for missing fields to help diagnose issues
    if (!data.owner_id) {
      console.warn('ProjectTransformService: owner_id is missing from data:', {
        id: data.id,
        name: data.name,
        availableFields: Object.keys(data)
      });
    }

    if (!data.status) {
      console.warn('ProjectTransformService: status is missing, using default:', {
        id: data.id,
        name: data.name
      });
    }
  }

  private static validateString(value: any, fieldName: string): string {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new ProjectValidationError(`Field '${fieldName}' must be a non-empty string`, fieldName, value);
    }
    return value.trim();
  }

  private static validateOptionalString(value: any): string | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }
    if (typeof value !== 'string') {
      return undefined;
    }
    return value.trim() || undefined;
  }

  private static validateNumber(value: any, fieldName: string, min?: number, max?: number): number {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    
    if (typeof num !== 'number' || isNaN(num)) {
      throw new ProjectValidationError(`Field '${fieldName}' must be a valid number`, fieldName, value);
    }
    
    if (min !== undefined && num < min) {
      throw new ProjectValidationError(`Field '${fieldName}' must be >= ${min}`, fieldName, value);
    }
    
    if (max !== undefined && num > max) {
      throw new ProjectValidationError(`Field '${fieldName}' must be <= ${max}`, fieldName, value);
    }
    
    return num;
  }

  private static validateStatus(value: any): ProjectStatus {
    const validStatuses: ProjectStatus[] = ['active', 'planning', 'completed', 'on-hold'];
    
    if (typeof value !== 'string') {
      console.warn(`Invalid status type: ${typeof value}, using default 'planning'`);
      return 'planning';
    }
    
    if (!validStatuses.includes(value as ProjectStatus)) {
      console.warn(`Invalid status value: ${value}, using default 'planning'`);
      return 'planning';
    }
    
    return value as ProjectStatus;
  }

  /**
   * Map UI status values to database status values
   */
  static mapUIStatusToDBStatus(uiStatus: ProjectStatus | 'all'): string | undefined {
    if (uiStatus === 'all') {
      return undefined; // No filter needed for 'all'
    }
    
    switch (uiStatus) {
      case 'active':
        return 'IN_PROGRESS';
      case 'planning':
        return 'PLANNING';
      case 'completed':
        return 'COMPLETED';
      case 'on-hold':
        return 'PAUSED';
      default:
        return 'PLANNING';
    }
  }

  private static validateHealth(value: any): 'excellent' | 'good' | 'fair' | 'poor' {
    const validHealth = ['excellent', 'good', 'fair', 'poor'];
    
    if (typeof value !== 'string' || !validHealth.includes(value)) {
      throw new ProjectValidationError(
        `Health must be one of: ${validHealth.join(', ')}`, 
        'health', 
        value
      );
    }
    
    return value as 'excellent' | 'good' | 'fair' | 'poor';
  }

  private static validateStringArray(value: any): string[] | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }
    
    if (!Array.isArray(value)) {
      return undefined;
    }
    
    // Filter out non-string values and empty strings
    const validStrings = value.filter(item => typeof item === 'string' && item.trim() !== '');
    return validStrings.length > 0 ? validStrings : undefined;
  }

  // Additional helper methods for null safety
  private static safeParseNumber(value: any, defaultValue: number = 0): number {
    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }
    
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    }
    
    return defaultValue;
  }

  private static parseDate(dateInput: any): Date {
    if (dateInput instanceof Date) {
      return isNaN(dateInput.getTime()) ? new Date() : dateInput;
    }
    
    if (typeof dateInput === 'string' && dateInput.trim()) {
      const parsed = new Date(dateInput);
      return isNaN(parsed.getTime()) ? new Date() : parsed;
    }
    
    // Default to current date if invalid
    return new Date();
  }

  /**
   * Map database status values to UI status values
   */
  private static mapDBStatusToUIStatus(dbStatus: string): ProjectStatus {
    switch (dbStatus) {
      case 'IN_PROGRESS':
        return 'active';
      case 'PLANNING':
        return 'planning';
      case 'COMPLETED':
        return 'completed';
      case 'PAUSED':
        return 'on-hold';
      default:
        return 'planning';
    }
  }

  /**
   * Format location from JSONB structure
   */
  private static formatLocation(location: any): string {
    if (!location || typeof location !== 'object') {
      return 'Unknown Location';
    }
    
    const parts = [
      location.street_address,
      location.city,
      location.region_or_state,
      location.country
    ].filter(part => part && typeof part === 'string' && part.trim());
    
    return parts.length > 0 ? parts.join(', ') : 'Unknown Location';
  }

  /**
   * Enrich owner info for a batch of projects to avoid N+1 queries
   */
  static async enrichOwnerInfoBatch(projects: ProjectViewData[]): Promise<ProjectViewData[]> {
    if (!projects || projects.length === 0) {
      return projects;
    }

    // Identify projects that need owner info enrichment
    const projectsNeedingEnrichment = projects.filter(project => {
      const ownerInfo = this.extractOwnerInfo(project);
      return !this.isOwnerInfoComplete(ownerInfo) && project.owner_id;
    });

    if (projectsNeedingEnrichment.length === 0) {
      console.log('ProjectTransformService: All projects already have complete owner info');
      return projects;
    }

    // Get unique owner IDs to fetch
    const ownerIds = Array.from(new Set(projectsNeedingEnrichment.map(p => p.owner_id).filter(Boolean)));
    
    console.log(`ProjectTransformService: Fetching owner info for ${ownerIds.length} unique owners`);

    try {
      // Batch fetch owner data from be_user table
      const { data: owners, error } = await supabase
        .from('be_user')
        .select('id, first_name, last_name, phone, email')
        .in('id', ownerIds);

      if (error) {
        console.error('ProjectTransformService: Failed to fetch owner data:', error);
        // Return original projects without enrichment on error
        return projects;
      }

      if (!owners || owners.length === 0) {
        console.warn('ProjectTransformService: No owner data found for provided IDs');
        return projects;
      }

      // Create lookup map for efficient owner data access
      const ownerMap = new Map<string, EnrichedOwnerData>();
      owners.forEach(owner => {
        if (owner.id) {
          ownerMap.set(owner.id, owner as EnrichedOwnerData);
        }
      });

      console.log(`ProjectTransformService: Successfully fetched data for ${owners.length} owners`);

      // Enrich projects with owner data
      return projects.map(project => {
        if (!project.owner_id || !ownerMap.has(project.owner_id)) {
          return project;
        }

        const ownerData = ownerMap.get(project.owner_id)!;
        const existingOwnerInfo = this.extractOwnerInfo(project);
        const enrichedOwnerInfo = this.mergeOwnerInfo(existingOwnerInfo, ownerData);

        return this.updateProjectOwnerInfo(project, enrichedOwnerInfo);
      });
    } catch (error) {
      console.error('ProjectTransformService: Error during owner info enrichment:', error);
      // Return original projects without enrichment on error
      return projects;
    }
  }

  /**
   * Enrich owner info for a single project
   */
  static async enrichOwnerInfo(project: ProjectViewData): Promise<ProjectViewData> {
    if (!project || !project.owner_id) {
      console.warn('ProjectTransformService: Cannot enrich owner info - missing project or owner_id');
      return project;
    }

    const existingOwnerInfo = this.extractOwnerInfo(project);
    
    // Skip enrichment if owner info is already complete
    if (this.isOwnerInfoComplete(existingOwnerInfo)) {
      console.log('ProjectTransformService: Owner info already complete, skipping enrichment');
      return project;
    }

    try {
      // Fetch owner data from be_user table
      const { data: ownerData, error } = await supabase
        .from('be_user')
        .select('id, first_name, last_name, phone, email')
        .eq('id', project.owner_id)
        .single();

      if (error) {
        console.error('ProjectTransformService: Failed to fetch owner data:', error);
        return project;
      }

      if (!ownerData) {
        console.warn('ProjectTransformService: No owner data found for ID:', project.owner_id);
        return project;
      }

      // Merge existing and fetched owner info
      const enrichedOwnerInfo = this.mergeOwnerInfo(existingOwnerInfo, ownerData as EnrichedOwnerData);
      
      console.log('ProjectTransformService: Successfully enriched owner info for project:', project.id);
      
      return this.updateProjectOwnerInfo(project, enrichedOwnerInfo);
    } catch (error) {
      console.error('ProjectTransformService: Error during single owner info enrichment:', error);
      return project;
    }
  }

  /**
   * Extract owner info from project data (handles both base table and view structures)
   */
  private static extractOwnerInfo(project: ProjectViewData): OwnerInfo {
    // Try to get from owner_info field first
    if (project.owner_info && typeof project.owner_info === 'object') {
      return project.owner_info as OwnerInfo;
    }
    
    // Try to get from details.owner_info
    if (project.details && typeof project.details === 'object' && project.details.owner_info) {
      return project.details.owner_info as OwnerInfo;
    }

    // Return empty object if no owner info found
    return {};
  }

  /**
   * Check if owner info has all required fields
   */
  private static isOwnerInfoComplete(ownerInfo: OwnerInfo): boolean {
    if (!ownerInfo || typeof ownerInfo !== 'object') {
      return false;
    }
    
    // Check if we have at least name and one contact method
    const hasName = ownerInfo.name && ownerInfo.name.trim().length > 0;
    const hasContact = (ownerInfo.phone && ownerInfo.phone.trim().length > 0) || 
                      (ownerInfo.email && ownerInfo.email.trim().length > 0);
    
    return hasName && hasContact;
  }

  /**
   * Merge existing owner info with fetched user data
   */
  private static mergeOwnerInfo(existing: OwnerInfo, userData: EnrichedOwnerData): OwnerInfo {
    const merged: OwnerInfo = { ...existing };
    
    // Build full name from user data if not present
    if (!merged.name || !merged.name.trim()) {
      const firstName = userData.first_name || '';
      const lastName = userData.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) {
        merged.name = fullName;
      }
    }
    
    // Use user phone if not present
    if (!merged.phone || !merged.phone.trim()) {
      merged.phone = userData.phone || null;
    }
    
    // Use user email if not present
    if (!merged.email || !merged.email.trim()) {
      merged.email = userData.email || null;
    }
    
    return merged;
  }

  /**
   * Update project with enriched owner info
   */
  private static updateProjectOwnerInfo(project: ProjectViewData, ownerInfo: OwnerInfo): ProjectViewData {
    const updatedProject = { ...project };
    
    // Update owner_info field if it exists
    if (updatedProject.owner_info !== undefined) {
      updatedProject.owner_info = ownerInfo;
    }
    
    // Update details.owner_info if details exists
    if (updatedProject.details && typeof updatedProject.details === 'object') {
      updatedProject.details = {
        ...updatedProject.details,
        owner_info: ownerInfo
      };
    } else {
      // Create details object with owner_info if it doesn't exist
      updatedProject.details = {
        owner_info: ownerInfo
      };
    }
    
    return updatedProject;
  }

  /**
   * Get owner name, preferring owner_info from details, fallback to joined user data
   */
  private static getOwnerName(ownerInfo: any, userData: any): string {
    // If owner_info exists and has a name, use it
    if (ownerInfo && typeof ownerInfo === 'object' && ownerInfo.name && ownerInfo.name.trim()) {
      return ownerInfo.name.trim();
    }
    
    // Fallback to joined user data from be_user table
    if (userData && typeof userData === 'object') {
      const firstName = userData.first_name || '';
      const lastName = userData.last_name || '';
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) {
        return fullName;
      }
    }
    
    // Final fallback
    return 'Project Owner';
  }
}