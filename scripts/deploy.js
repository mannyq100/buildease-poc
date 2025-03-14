#!/usr/bin/env node

/**
 * BuildEase Multi-Environment Deployment Script
 * 
 * This script automates the process of building and deploying the application
 * to different environments (development, staging, production).
 * 
 * Usage:
 *   node scripts/deploy.js <environment> [options]
 * 
 * Arguments:
 *   environment: The target environment (dev, staging, prod)
 * 
 * Options:
 *   --build-only: Only build the application without deploying
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { resolve } from 'path';

// Configuration
const ENVIRONMENTS = {
  dev: {
    name: 'development',
    buildCommand: 'npm run build:dev',
    outputDir: 'dist/development',
    deployCommand: 'echo "Deploying to development server..."',
  },
  staging: {
    name: 'staging',
    buildCommand: 'npm run build:staging',
    outputDir: 'dist/staging',
    deployCommand: 'echo "Deploying to staging server..."',
  },
  prod: {
    name: 'production',
    buildCommand: 'npm run build',
    outputDir: 'dist/production',
    deployCommand: 'echo "Deploying to production server..."',
  },
};

// Helper functions
function executeCommand(command) {
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    console.error(error.message);
    return false;
  }
}

function validateEnvironment(env) {
  if (!ENVIRONMENTS[env]) {
    console.error(`Invalid environment: ${env}`);
    console.error(`Valid options are: ${Object.keys(ENVIRONMENTS).join(', ')}`);
    return false;
  }
  return true;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    environment: args[0],
    buildOnly: args.includes('--build-only'),
  };

  if (!options.environment) {
    console.error('Missing required argument: environment');
    return null;
  }

  return options;
}

// Main function
function main() {
  console.log('🏗️  BuildEase Deployment Script');
  console.log('--------------------------------');

  // Parse arguments
  const options = parseArgs();
  if (!options) {
    console.log('\nUsage: node scripts/deploy.js <environment> [options]');
    console.log('\nEnvironments:');
    console.log('  dev       Development environment');
    console.log('  staging   Staging environment');
    console.log('  prod      Production environment');
    console.log('\nOptions:');
    console.log('  --build-only    Only build the application without deploying');
    process.exit(1);
  }

  // Validate environment
  if (!validateEnvironment(options.environment)) {
    process.exit(1);
  }

  const env = ENVIRONMENTS[options.environment];
  console.log(`Target environment: ${env.name}`);

  // Build the application
  console.log(`\n📦 Building for ${env.name} environment...`);
  if (!executeCommand(env.buildCommand)) {
    process.exit(1);
  }

  // Verify the build output
  const outputDir = resolve(process.cwd(), env.outputDir);
  if (!existsSync(outputDir)) {
    console.error(`Build output directory not found: ${outputDir}`);
    process.exit(1);
  }

  console.log(`✅ Build successful: ${outputDir}`);

  // Deploy if not build only
  if (!options.buildOnly) {
    console.log(`\n🚀 Deploying to ${env.name} environment...`);
    if (!executeCommand(env.deployCommand)) {
      process.exit(1);
    }
    console.log(`✅ Deployment to ${env.name} complete!`);
  } else {
    console.log('\n⏹️  Skipping deployment (--build-only)');
  }

  console.log('\n✨ All done!');
}

// Run the script
main(); 