const { getSupabase } = require('./db');

function projectFromRow(row) {
  return {
    project_id: row.project_id,
    title: row.title || '',
    summaryTitle: row.summary_title || '',
    projectDescription: row.project_description || '',
    question: row.question || '',
    answer: row.answer || '',
    summary: row.summary || '',
    meta: row.meta || {},
    category: row.categories || [],
    tags: row.tags || [],
    mainImage: row.main_image || '',
    images: row.images || {
      slider1: [],
      slider2: [],
      column1: [],
      column2: [],
    },
  };
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
    images: project.images || {},
  };
}

function homeHeroImageFromRow(row) {
  return {
    id: row.id,
    image: row.image || '',
    order: row.display_order || 0,
  };
}

function categoryFromRow(row) {
  return {
    name: row.name,
    slug: row.slug,
    tags: row.tags || [],
  };
}

function teamMemberFromRow(row) {
  return {
    id: row.id,
    name: row.name,
    position: row.position,
    image: row.image || '',
    order: row.display_order || 0,
  };
}

function teamMemberToRow(member) {
  return {
    id: member.id,
    name: member.name,
    position: member.position,
    image: member.image || '',
    display_order: Number.isFinite(Number(member.order)) ? Number(member.order) : 0,
  };
}

function clientFromRow(row) {
  return {
    id: row.id,
    name: row.name,
    link: row.link || '',
    bwImage: row.bw_image || '',
    colorImage: row.color_image || '',
    order: row.display_order || 0,
  };
}

function clientToRow(client) {
  return {
    id: client.id,
    name: client.name,
    link: client.link || '',
    bw_image: client.bwImage || '',
    color_image: client.colorImage || '',
    display_order: Number.isFinite(Number(client.order)) ? Number(client.order) : 0,
  };
}

function accoladeFromRow(row) {
  return {
    id: row.id,
    category: row.category,
    award: row.award,
    project: row.project,
    description: row.description,
    image: row.image || '',
    order: row.display_order || 0,
  };
}

function accoladeToRow(accolade) {
  return {
    id: accolade.id,
    category: accolade.category,
    award: accolade.award,
    project: accolade.project,
    description: accolade.description,
    image: accolade.image || '',
    display_order: Number.isFinite(Number(accolade.order)) ? Number(accolade.order) : 0,
  };
}

function throwIfError(error) {
  if (error) throw error;
}

async function getProjects() {
  const { data, error } = await getSupabase()
    .from('projects')
    .select('*')
    .order('title', { ascending: true });
  throwIfError(error);
  return (data || []).map(projectFromRow);
}

async function getHomeHeroImages() {
  const { data, error } = await getSupabase()
    .from('home_hero_images')
    .select('*')
    .order('display_order', { ascending: true })
    .order('id', { ascending: true });
  throwIfError(error);
  return (data || []).map(homeHeroImageFromRow);
}

async function createHomeHeroImages(images) {
  const rows = images.map(item => ({ image: item.image, display_order: item.order }));
  const { data, error } = await getSupabase()
    .from('home_hero_images')
    .insert(rows)
    .select();
  throwIfError(error);
  return (data || []).map(homeHeroImageFromRow);
}

async function updateHomeHeroImage(id, image) {
  const { data, error } = await getSupabase()
    .from('home_hero_images')
    .update({ image: image.image, display_order: image.order })
    .eq('id', id)
    .select()
    .single();
  throwIfError(error);
  return homeHeroImageFromRow(data);
}

async function deleteHomeHeroImage(id) {
  const { data, error } = await getSupabase()
    .from('home_hero_images')
    .delete()
    .eq('id', id)
    .select()
    .maybeSingle();
  throwIfError(error);
  return data ? homeHeroImageFromRow(data) : null;
}

async function getProject(projectId) {
  const { data, error } = await getSupabase()
    .from('projects')
    .select('*')
    .eq('project_id', projectId)
    .maybeSingle();
  throwIfError(error);
  return data ? projectFromRow(data) : null;
}

async function upsertProject(project) {
  const { data, error } = await getSupabase()
    .from('projects')
    .upsert(projectToRow(project), { onConflict: 'project_id' })
    .select()
    .single();
  throwIfError(error);
  return projectFromRow(data);
}

async function updateProject(projectId, project) {
  const { data, error } = await getSupabase()
    .from('projects')
    .update(projectToRow(project))
    .eq('project_id', projectId)
    .select()
    .single();
  throwIfError(error);
  return projectFromRow(data);
}

async function deleteProject(projectId) {
  const { data, error } = await getSupabase()
    .from('projects')
    .delete()
    .eq('project_id', projectId)
    .select()
    .maybeSingle();
  throwIfError(error);
  return data ? projectFromRow(data) : null;
}

async function getCategories() {
  const { data, error } = await getSupabase()
    .from('categories')
    .select('*')
    .order('name', { ascending: true });
  throwIfError(error);
  return (data || []).map(categoryFromRow);
}

async function getCategory(slug) {
  const { data, error } = await getSupabase()
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  throwIfError(error);
  return data ? categoryFromRow(data) : null;
}

async function createCategory(category) {
  const { data, error } = await getSupabase()
    .from('categories')
    .insert({
      slug: category.slug,
      name: category.name,
      tags: category.tags || [],
    })
    .select()
    .single();
  throwIfError(error);
  return categoryFromRow(data);
}

async function updateCategory(slug, category) {
  const { data, error } = await getSupabase()
    .from('categories')
    .update({
      name: category.name,
      tags: category.tags || [],
    })
    .eq('slug', slug)
    .select()
    .single();
  throwIfError(error);
  return categoryFromRow(data);
}

async function deleteCategory(slug) {
  const { data, error } = await getSupabase()
    .from('categories')
    .delete()
    .eq('slug', slug)
    .select()
    .maybeSingle();
  throwIfError(error);

  if (data) {
    const projects = await getProjects();
    await Promise.all(
      projects
        .filter(project => Array.isArray(project.category) && project.category.includes(slug))
        .map(project =>
          updateProject(project.project_id, {
            ...project,
            category: project.category.filter(categorySlug => categorySlug !== slug),
          })
        )
    );
  }

  return data ? categoryFromRow(data) : null;
}

async function getTeamMembers() {
  const { data, error } = await getSupabase()
    .from('team_members')
    .select('*')
    .order('display_order', { ascending: true });
  throwIfError(error);
  return (data || []).map(teamMemberFromRow);
}

async function createTeamMember(member) {
  const { data, error } = await getSupabase()
    .from('team_members')
    .insert(teamMemberToRow(member))
    .select()
    .single();
  throwIfError(error);
  return teamMemberFromRow(data);
}

async function updateTeamMember(id, member) {
  const { data, error } = await getSupabase()
    .from('team_members')
    .update(teamMemberToRow({ ...member, id }))
    .eq('id', id)
    .select()
    .single();
  throwIfError(error);
  return teamMemberFromRow(data);
}

async function deleteTeamMember(id) {
  const { data, error } = await getSupabase()
    .from('team_members')
    .delete()
    .eq('id', id)
    .select()
    .maybeSingle();
  throwIfError(error);
  return data ? teamMemberFromRow(data) : null;
}

async function reorderTeamMembers(ids) {
  const results = await Promise.all(
    ids.map((id, index) =>
      getSupabase()
        .from('team_members')
        .update({ display_order: index })
        .eq('id', id)
    )
  );
  results.forEach(({ error }) => throwIfError(error));
  return getTeamMembers();
}

async function getClients() {
  const { data, error } = await getSupabase()
    .from('clients')
    .select('*')
    .order('display_order', { ascending: true });
  throwIfError(error);
  return (data || []).map(clientFromRow);
}

async function createClientRecord(client) {
  const { data, error } = await getSupabase()
    .from('clients')
    .insert(clientToRow(client))
    .select()
    .single();
  throwIfError(error);
  return clientFromRow(data);
}

async function updateClientRecord(id, client) {
  const { data, error } = await getSupabase()
    .from('clients')
    .update(clientToRow({ ...client, id }))
    .eq('id', id)
    .select()
    .single();
  throwIfError(error);
  return clientFromRow(data);
}

async function deleteClientRecord(id) {
  const { data, error } = await getSupabase()
    .from('clients')
    .delete()
    .eq('id', id)
    .select()
    .maybeSingle();
  throwIfError(error);
  return data ? clientFromRow(data) : null;
}

async function reorderClients(ids) {
  const results = await Promise.all(
    ids.map((id, index) =>
      getSupabase()
        .from('clients')
        .update({ display_order: index })
        .eq('id', id)
    )
  );
  results.forEach(({ error }) => throwIfError(error));
  return getClients();
}

async function getAccolades() {
  const { data, error } = await getSupabase()
    .from('accolades')
    .select('*')
    .order('display_order', { ascending: true });
  throwIfError(error);
  return (data || []).map(accoladeFromRow);
}

async function createAccolade(accolade) {
  const { data, error } = await getSupabase()
    .from('accolades')
    .insert(accoladeToRow(accolade))
    .select()
    .single();
  throwIfError(error);
  return accoladeFromRow(data);
}

async function updateAccolade(id, accolade) {
  const { data, error } = await getSupabase()
    .from('accolades')
    .update(accoladeToRow({ ...accolade, id }))
    .eq('id', id)
    .select()
    .single();
  throwIfError(error);
  return accoladeFromRow(data);
}

async function deleteAccolade(id) {
  const { data, error } = await getSupabase()
    .from('accolades')
    .delete()
    .eq('id', id)
    .select()
    .maybeSingle();
  throwIfError(error);
  return data ? accoladeFromRow(data) : null;
}

async function getSiteContent(defaultSiteContent) {
  const { data, error } = await getSupabase()
    .from('site_content')
    .select('*');
  throwIfError(error);

  const content = {
    text: { ...defaultSiteContent.text },
    images: { ...defaultSiteContent.images },
  };

  for (const row of data || []) {
    if (row.type === 'image') content.images[row.key] = row.value;
    if (row.type === 'text') content.text[row.key] = row.value;
  }

  return content;
}

async function updateSiteText(key, value, defaultSiteContent) {
  const { error } = await getSupabase()
    .from('site_content')
    .upsert({ key, type: 'text', value }, { onConflict: 'key' });
  throwIfError(error);
  return getSiteContent(defaultSiteContent);
}

async function updateSiteImage(key, value, defaultSiteContent) {
  const { error } = await getSupabase()
    .from('site_content')
    .upsert({ key, type: 'image', value }, { onConflict: 'key' });
  throwIfError(error);
  return getSiteContent(defaultSiteContent);
}

module.exports = {
  createHomeHeroImages,
  createAccolade,
  createCategory,
  createClientRecord,
  createTeamMember,
  deleteAccolade,
  deleteCategory,
  deleteClientRecord,
  deleteHomeHeroImage,
  deleteProject,
  deleteTeamMember,
  getCategories,
  getAccolades,
  getCategory,
  getClients,
  getHomeHeroImages,
  getProject,
  getProjects,
  getSiteContent,
  getTeamMembers,
  reorderClients,
  reorderTeamMembers,
  updateCategory,
  updateAccolade,
  updateClientRecord,
  updateHomeHeroImage,
  updateProject,
  updateSiteImage,
  updateSiteText,
  updateTeamMember,
  upsertProject,
};
