#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join } from 'path';
import { query } from '../src/db';

async function runMigration() {
  try {
    console.log('🌍 Starting Atlas Sanctum Regenerative Architecture Migration...');
    
    // Read the migration file
    const migrationPath = join(__dirname, '../db/migrations/20260104_regenerative_architecture.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await query(migrationSQL);
    
    console.log('✅ Regenerative Architecture Migration completed successfully!');
    console.log('🚀 Atlas Sanctum is now ready for non-CRUD, ecosystem-native operations');
    
    // Verify the migration by checking if key tables exist
    const verificationResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'verification_pipelines',
        'confidence_weighted_values',
        'ethical_constraints',
        'trust_scores',
        'temporal_actions'
      )
      ORDER BY table_name
    `);
    
    console.log('\n📊 Verification - Created Tables:');
    verificationResult.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });
    
    // Check if views were created
    const viewsResult = await query(`
      SELECT table_name 
      FROM information_schema.views 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'current_confidence_values',
        'current_trust_scores',
        'verification_pipeline_summary'
      )
      ORDER BY table_name
    `);
    
    console.log('\n📈 Verification - Created Views:');
    viewsResult.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });
    
    // Check if functions were created
    const functionsResult = await query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_schema = 'public' 
      AND routine_name IN (
        'calculate_current_confidence',
        'calculate_current_trust',
        'update_updated_at_column'
      )
      ORDER BY routine_name
    `);
    
    console.log('\n⚙️  Verification - Created Functions:');
    functionsResult.rows.forEach(row => {
      console.log(`   ✓ ${row.routine_name}`);
    });
    
    // Check initial ethical constraints
    const constraintsResult = await query(`
      SELECT name, type, category 
      FROM ethical_constraints 
      ORDER BY name
    `);
    
    console.log('\n🛡️  Verification - Initial Ethical Constraints:');
    constraintsResult.rows.forEach(row => {
      console.log(`   ✓ ${row.name} (${row.type}/${row.category})`);
    });
    
    console.log('\n🎉 Atlas Sanctum Regenerative Architecture is ready!');
    console.log('📚 Available API endpoints:');
    console.log('   • POST /api/regenerative/actions - Process regenerative actions');
    console.log('   • POST /api/regenerative/verification/pipelines - Create verification pipelines');
    console.log('   • POST /api/regenerative/measurements - Store confidence-weighted measurements');
    console.log('   • POST /api/regenerative/ethics/evaluate - Evaluate ethical constraints');
    console.log('   • GET  /api/regenerative/trust/:userId - Get trust scores');
    console.log('   • POST /api/regenerative/temporal/schedule - Schedule temporal actions');
    console.log('   • GET  /api/regenerative/health - System health metrics');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('\nTroubleshooting:');
    console.error('1. Ensure PostgreSQL is running');
    console.error('2. Check database connection settings in .env');
    console.error('3. Verify database user has CREATE privileges');
    console.error('4. Check if migration file exists and is readable');
    
    process.exit(1);
  }
}

// Run the migration
runMigration();