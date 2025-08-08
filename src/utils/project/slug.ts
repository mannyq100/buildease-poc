/**
 * Slug utilities for project URLs
 * - Generates URL-safe, lowercase slugs
 * - Ensures uniqueness against existing records
 */
import { supabase } from '@/lib/supabase';
import { TABLE_NAMES } from '@/types/database';

// Reserved slugs to avoid conflicts with app routes
const RESERVED_SLUGS = new Set([
  'projects',
  'project',
  'new',
  'create',
  'settings',
  'admin',
  'login',
  'signup',
  'account',
  'team',
  'about',
  'help',
]);

function baseSlugify(input: string): string {
  if (!input) return '';
  // Normalize, remove diacritics, lower-case
  const normalized = input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .toLowerCase();

  // Replace non-alphanumeric with hyphens, collapse, and trim
  return normalized
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60); // keep slugs short
}

function randomSuffix(len = 4): string {
  // URL-safe base36 suffix
  let s = '';
  while (s.length < len) {
    s += Math.floor(Math.random() * 36).toString(36);
  }
  return s.slice(0, len);
}

async function slugExists(candidate: string): Promise<boolean> {
  // Use ilike for case-insensitive equality; limit to 1 row
  const { data, error } = await supabase
    .from(TABLE_NAMES.PROJECTS)
    .select('id')
    .ilike('slug', candidate)
    .limit(1);

  if (error) {
    // Fail closed: assume exists to avoid collisions when DB check fails
    return true;
  }
  return Array.isArray(data) && data.length > 0;
}

export async function generateUniqueProjectSlug(name: string): Promise<string> {
  const base = baseSlugify(name) || 'project';
  const isReserved = RESERVED_SLUGS.has(base);
  let candidate = isReserved ? `${base}-${randomSuffix(3)}` : base;

  // Try base, then add short suffixes if needed
  const maxAttempts = 10;
  for (let i = 0; i < maxAttempts; i++) {
    const exists = await slugExists(candidate);
    if (!exists) return candidate;
    candidate = `${base}-${randomSuffix(4 + i % 2)}`; // vary 4/5 length
  }

  // Final fallback with timestamp
  return `${base}-${Date.now().toString(36)}`;
}
