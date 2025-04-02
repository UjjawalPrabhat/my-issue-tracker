import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';

const execPromise = promisify(exec);

/**
 * Check if a command is available in the system PATH
 */
async function isCommandAvailable(command) {
  try {
    const checkCmd = process.platform === 'win32' ? 
      `where ${command}` : 
      `which ${command}`;
    
    await execPromise(checkCmd);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Check Firebase CLI installation and project setup
 */
async function checkFirebaseSetup() {
  try {
    // Check if Firebase CLI is installed
    const isFirebaseInstalled = await isCommandAvailable('firebase');
    if (!isFirebaseInstalled) {
      console.error('❌ Firebase CLI is not installed or not in PATH.');
      console.log('Please install Firebase CLI with: npm install -g firebase-tools');
      return false;
    }
    
    // Check if user is logged in
    try {
      const { stdout } = await execPromise('firebase projects:list --json');
      const projects = JSON.parse(stdout);
      
      if (!projects || projects.length === 0) {
        console.log('⚠️ No Firebase projects found. You might need to initialize your project.');
        console.log('Run: firebase init');
      }
    } catch (error) {
      console.log('⚠️ You may not be logged in to Firebase CLI.');
      console.log('Run: firebase login');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error checking Firebase setup:', error.message);
    return false;
  }
}

/**
 * Deploy Firestore Rules to Firebase
 */
async function deployFirestoreRules() {
  try {
    console.log('🔄 Checking Firebase setup...');
    const isSetupOk = await checkFirebaseSetup();
    if (!isSetupOk) {
      return;
    }
    
    console.log('🔄 Deploying Firestore rules...');
    
    // Check if firebase.json exists
    try {
      await fs.access('firebase.json');
      console.log('✅ firebase.json found');
    } catch (error) {
      // Create firebase.json with firestore configuration
      console.log('Creating firebase.json configuration...');
      const firebaseConfig = {
        "firestore": {
          "rules": "firestore.rules",
          "indexes": "firestore-indexes.json"
        },
        "hosting": {
          "public": "dist",
          "ignore": [
            "firebase.json",
            "**/.*",
            "**/node_modules/**"
          ],
          "rewrites": [
            {
              "source": "**",
              "destination": "/index.html"
            }
          ]
        },
        "storage": {
          "rules": "storage.rules"
        }
      };
      
      await fs.writeFile('firebase.json', JSON.stringify(firebaseConfig, null, 2));
      console.log('✅ Firebase configuration created successfully.');
    }
    
    // Check if firestore.rules exists
    try {
      await fs.access('firestore.rules');
      console.log('✅ firestore.rules found');
    } catch (error) {
      console.error('❌ firestore.rules file not found! Please create it first.');
      return;
    }
    
    // Check if storage.rules exists, if not create a basic one
    try {
      await fs.access('storage.rules');
      console.log('✅ storage.rules found');
    } catch (error) {
      console.log('Creating basic storage.rules...');
      const storageRules = `rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}`;
      await fs.writeFile('storage.rules', storageRules);
      console.log('✅ Storage rules created successfully.');
    }

    // Run firebase deploy command with verbose output
    console.log('🔄 Running deployment command...');
    try {
      const { stdout, stderr } = await execPromise('firebase deploy --only firestore:rules --debug');
      
      if (stderr && !stderr.includes('Debug:')) {
        console.error('⚠️ Deployment warning:', stderr);
      }
      
      console.log('✅ Firestore rules deployed successfully!');
      
      // Log only the important parts of the output
      const relevantOutput = stdout
        .split('\n')
        .filter(line => !line.startsWith('Debug:') && line.trim() !== '')
        .join('\n');
      
      console.log(relevantOutput);
    } catch (error) {
      console.error('❌ Deployment failed!');
      if (error.stderr) {
        console.error('Error details:');
        console.error(error.stderr);
      }
      
      console.log('\n🔍 Troubleshooting:');
      console.log('1. Make sure you\'re logged in: firebase login');
      console.log('2. Check if your project is initialized: firebase init');
      console.log('3. Verify firestore.rules syntax');
      console.log('4. Try running the command manually: firebase deploy --only firestore:rules');
    }
  } catch (error) {
    console.error('❌ Failed to deploy Firestore rules:', error.message);
  }
}

// Run the deployment script
deployFirestoreRules().catch(console.error);

/**
 * To use this script:
 * 1. Make sure you're logged in to Firebase CLI: firebase login
 * 2. Make sure your project is initialized: firebase init
 * 3. Run this script: node firebase-deploy.js
 * 
 * Troubleshooting:
 * - If Firebase CLI is not installed: npm install -g firebase-tools
 * - If not logged in: firebase login
 * - If project not initialized: firebase init
 * - For more verbose output: firebase deploy --only firestore:rules --debug
 */
