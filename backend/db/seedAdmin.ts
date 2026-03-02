/**
 * Admin Dashboard Seed Script
 * 
 * Seeds the database with default admin user and permissions.
 * Run this script to initialize the admin dashboard.
 */

import { query } from '../src/db';
import { adminAuthService } from '../src/services/adminAuth';

async function seedAdmin() {
  console.log('🌱 Starting admin dashboard seed...\n');

  try {
    // 1. Create default admin user
    console.log('1. Creating default admin user...');
    const adminUser = await adminAuthService.seedDefaultAdmin();
    if (adminUser) {
      console.log(`   ✅ Admin user created: ${adminUser.email}`);
      console.log(`   🔑 Default password: admin123!`);
      console.log(`   ⚠️  IMPORTANT: Change the password on first login!\n`);
    }

    // 2. Assign super_admin role to default user
    console.log('2. Assigning super_admin role...');
    const adminRoleResult = await query(
      `SELECT id FROM admin_roles WHERE name = 'super_admin'`
    );
    if (adminRoleResult.rows[0]) {
      await query(
        `INSERT INTO admin_user_roles (user_id, role_id) 
         SELECT $1, $2 
         ON CONFLICT (user_id, role_id) DO NOTHING`,
        [adminUser?.id, adminRoleResult.rows[0].id]
      );
      console.log('   ✅ Super admin role assigned\n');
    }

    // 3. Grant permissions to super_admin role
    console.log('3. Granting permissions to super_admin role...');
    const superAdminRole = await query(
      `SELECT id FROM admin_roles WHERE name = 'super_admin'`
    );
    const allPermissions = await query(`SELECT id FROM admin_permissions`);

    if (superAdminRole.rows[0] && allPermissions.rows.length > 0) {
      for (const perm of allPermissions.rows) {
        await query(
          `INSERT INTO admin_role_permissions (role_id, permission_id) 
           VALUES ($1, $2) 
           ON CONFLICT (role_id, permission_id) DO NOTHING`,
          [superAdminRole.rows[0].id, perm.id]
        );
      }
      console.log(`   ✅ Granted ${allPermissions.rows.length} permissions\n`);
    }

    // 4. Grant permissions to admin role (limited)
    console.log('4. Granting permissions to admin role...');
    const adminRole = await query(
      `SELECT id FROM admin_roles WHERE name = 'admin'`
    );
    
    if (adminRole.rows[0]) {
      const adminPermissions = [
        'users:read', 'users:create', 'users:update',
        'dashboard:read', 'dashboard:export',
        'analytics:read', 'analytics:export',
        'settings:read',
        'alerts:read', 'alerts:manage',
        'audit:read',
        'security:read', 'security:manage',
        'backup:read', 'backup:create', 'backup:delete',
        'files:read', 'files:upload', 'files:delete',
      ];

      for (const permName of adminPermissions) {
        const permResult = await query(
          `SELECT id FROM admin_permissions WHERE name = $1`,
          [permName]
        );
        if (permResult.rows[0]) {
          await query(
            `INSERT INTO admin_role_permissions (role_id, permission_id) 
             VALUES ($1, $2) 
             ON CONFLICT (role_id, permission_id) DO NOTHING`,
            [adminRole.rows[0].id, permResult.rows[0].id]
          );
        }
      }
      console.log(`   ✅ Granted ${adminPermissions.length} permissions to admin role\n`);
    }

    console.log('🎉 Admin dashboard seed completed successfully!\n');
    console.log('===========================================');
    console.log('📧 Admin Login Credentials:');
    console.log('   Email:    admin@atlas-genesis.com');
    console.log('   Password: admin123!');
    console.log('===========================================\n');

  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

// Run if called directly
seedAdmin()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
