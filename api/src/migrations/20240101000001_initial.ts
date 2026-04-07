import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Sites table
  await knex.schema.createTable('sites', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('address').notNullable();
    table.decimal('lat', 10, 7).notNullable();
    table.decimal('lng', 10, 7).notNullable();
    table.string('timezone').defaultTo('Asia/Kuala_Lumpur');
    table.timestamps(true, true);
  });

  // Users table
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('email').unique().notNullable();
    table.string('password').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.enum('role', ['admin', 'manager', 'technician', 'viewer']).defaultTo('viewer');
    table.string('avatar');
    table.timestamps(true, true);
  });

  // User-Site junction table
  await knex.schema.createTable('user_sites', (table) => {
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.uuid('site_id').references('id').inTable('sites').onDelete('CASCADE');
    table.primary(['user_id', 'site_id']);
  });

  // Assets table
  await knex.schema.createTable('assets', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.enum('type', ['HVAC', 'Electrical', 'Plumbing', 'Fire Safety', 'Elevator', 'Structural', 'IT/AV', 'General']).notNullable();
    table.uuid('site_id').references('id').inTable('sites').onDelete('CASCADE');
    table.decimal('lat', 10, 7).notNullable();
    table.decimal('lng', 10, 7).notNullable();
    table.string('floor');
    table.string('zone');
    table.text('description');
    table.string('manufacturer');
    table.string('model');
    table.string('serial_number');
    table.date('install_date');
    table.date('warranty_expiry');
    table.integer('health_score').defaultTo(100);
    table.enum('health_status', ['critical', 'warning', 'good']).defaultTo('good');
    table.date('last_service_date');
    table.string('qr_code');
    table.jsonb('metadata');
    table.timestamps(true, true);
  });

  // Contractors table
  await knex.schema.createTable('contractors', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('company_name').notNullable();
    table.string('contact_name').notNullable();
    table.string('email').notNullable();
    table.string('phone');
    table.specificType('specialties', 'text[]');
    table.string('license_number');
    table.date('license_expiry');
    table.date('insurance_expiry');
    table.integer('performance_score').defaultTo(0);
    table.decimal('avg_response_time', 5, 2);
    table.decimal('completion_rate', 5, 2);
    table.timestamps(true, true);
  });

  // Contractor-Site junction table
  await knex.schema.createTable('contractor_sites', (table) => {
    table.uuid('contractor_id').references('id').inTable('contractors').onDelete('CASCADE');
    table.uuid('site_id').references('id').inTable('sites').onDelete('CASCADE');
    table.primary(['contractor_id', 'site_id']);
  });

  // Work Orders table
  await knex.schema.createTable('work_orders', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('number').unique().notNullable();
    table.uuid('site_id').references('id').inTable('sites').onDelete('CASCADE');
    table.uuid('asset_id').references('id').inTable('assets').onDelete('SET NULL');
    table.string('title').notNullable();
    table.text('description');
    table.string('fault_type');
    table.enum('priority', ['P1', 'P2', 'P3', 'P4']).defaultTo('P3');
    table.enum('status', ['open', 'assigned', 'in_progress', 'pending_parts', 'resolved', 'closed']).defaultTo('open');
    table.uuid('assigned_to_id').references('id').inTable('users').onDelete('SET NULL');
    table.uuid('contractor_id').references('id').inTable('contractors').onDelete('SET NULL');
    table.timestamp('sla_deadline');
    table.timestamp('resolved_at');
    table.timestamp('closed_at');
    table.jsonb('checklist');
    table.jsonb('timeline');
    table.timestamps(true, true);
  });

  // PM Schedules table
  await knex.schema.createTable('pm_schedules', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.uuid('asset_id').references('id').inTable('assets').onDelete('CASCADE');
    table.uuid('site_id').references('id').inTable('sites').onDelete('CASCADE');
    table.enum('frequency', ['daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'semi-annual', 'annual']).notNullable();
    table.date('last_done_date');
    table.date('next_due_date').notNullable();
    table.enum('status', ['upcoming', 'overdue', 'done']).defaultTo('upcoming');
    table.boolean('auto_create_wo').defaultTo(true);
    table.specificType('checklist', 'text[]');
    table.uuid('assigned_to_id').references('id').inTable('users').onDelete('SET NULL');
    table.integer('estimated_duration').defaultTo(60);
    table.timestamps(true, true);
  });

  // Inventory Items table
  await knex.schema.createTable('inventory_items', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('sku').unique().notNullable();
    table.text('description');
    table.specificType('asset_types', 'text[]');
    table.integer('quantity_on_hand').defaultTo(0);
    table.integer('minimum_stock').defaultTo(0);
    table.decimal('unit_cost', 10, 2);
    table.string('location');
    table.uuid('site_id').references('id').inTable('sites').onDelete('CASCADE');
    table.timestamps(true, true);
  });

  // Alerts table
  await knex.schema.createTable('alerts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.enum('type', ['sla_breach', 'critical_fault', 'low_stock', 'license_expiry', 'pm_overdue']).notNullable();
    table.enum('severity', ['critical', 'warning', 'info']).defaultTo('info');
    table.string('title').notNullable();
    table.text('description');
    table.uuid('related_entity_id');
    table.string('related_entity_type');
    table.timestamp('acknowledged_at');
    table.uuid('acknowledged_by_id').references('id').inTable('users').onDelete('SET NULL');
    table.timestamps(true, true);
  });

  // Attachments table
  await knex.schema.createTable('attachments', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('work_order_id').references('id').inTable('work_orders').onDelete('CASCADE');
    table.string('filename').notNullable();
    table.string('url').notNullable();
    table.string('mime_type');
    table.integer('size');
    table.uuid('uploaded_by_id').references('id').inTable('users').onDelete('SET NULL');
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('attachments');
  await knex.schema.dropTableIfExists('alerts');
  await knex.schema.dropTableIfExists('inventory_items');
  await knex.schema.dropTableIfExists('pm_schedules');
  await knex.schema.dropTableIfExists('work_orders');
  await knex.schema.dropTableIfExists('contractor_sites');
  await knex.schema.dropTableIfExists('contractors');
  await knex.schema.dropTableIfExists('assets');
  await knex.schema.dropTableIfExists('user_sites');
  await knex.schema.dropTableIfExists('users');
  await knex.schema.dropTableIfExists('sites');
}
