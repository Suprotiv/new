const fs = require('fs');
const path = require('path');
const { getSupabase } = require('../db');

const root = path.join(__dirname, '..');

function readJson(fileName, fallback) {
  const filePath = path.join(root, fileName);
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function projectToRow(project) {
  return {
    project_id: project.project_id,
    title: project.title || '',
    summary_title: project.summaryTitle || '',
    project_description: project.projectDescription || '',
    question: project.question || '',
    answer: project.answer || '',
    summary: project.summary || '',
    meta: project.meta || {},
    categories: Array.isArray(project.category) ? project.category : [],
    tags: Array.isArray(project.tags) ? project.tags : [],
    main_image: project.mainImage || '',
    images: project.images || {
      slider1: [],
      slider2: [],
      column1: [],
      column2: [],
    },
  };
}

function teamMemberToRow(member) {
  return {
    id: member.id,
    name: member.name || '',
    position: member.position || '',
    image: member.image || '',
    display_order: Number.isFinite(Number(member.order)) ? Number(member.order) : 0,
  };
}

function clientToRow(client) {
  return {
    id: client.id,
    name: client.name || '',
    link: client.link || '',
    bw_image: client.bwImage || '',
    color_image: client.colorImage || '',
    display_order: Number.isFinite(Number(client.order)) ? Number(client.order) : 0,
  };
}

async function upsertBatch(table, rows, onConflict) {
  if (!rows.length) return;

  const { error } = await getSupabase()
    .from(table)
    .upsert(rows, { onConflict });

  if (error) throw error;
}

async function migrate() {
  const portfolio = readJson('portfolio.json', { categories: [], projects: [] });
  const team = readJson('team.json', { members: [] });
  const clients = readJson('clients.json', { clients: [] });
  const siteContent = readJson('siteContent.json', { text: {}, images: {} });

  const categoryRows = (portfolio.categories || []).map(category => ({
    slug: category.slug,
    name: category.name || category.slug,
    tags: Array.isArray(category.tags) ? category.tags : [],
  }));

  const projectRows = (portfolio.projects || []).map(projectToRow);
  const teamRows = (team.members || []).map(teamMemberToRow);
  const clientRows = (clients.clients || []).map(clientToRow);
  const siteRows = [
    ...Object.entries(siteContent.text || {}).map(([key, value]) => ({
      key,
      type: 'text',
      value: String(value ?? ''),
    })),
    ...Object.entries(siteContent.images || {}).map(([key, value]) => ({
      key,
      type: 'image',
      value: String(value ?? ''),
    })),
  ];

  await upsertBatch('categories', categoryRows, 'slug');
  await upsertBatch('projects', projectRows, 'project_id');
  await upsertBatch('team_members', teamRows, 'id');
  await upsertBatch('clients', clientRows, 'id');
  await upsertBatch('site_content', siteRows, 'key');

  console.log('Migration complete.');
  console.log(`Categories: ${categoryRows.length}`);
  console.log(`Projects: ${projectRows.length}`);
  console.log(`Team members: ${teamRows.length}`);
  console.log(`Clients: ${clientRows.length}`);
  console.log(`Site content entries: ${siteRows.length}`);
}

migrate().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
