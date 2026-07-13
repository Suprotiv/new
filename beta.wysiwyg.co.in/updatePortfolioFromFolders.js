const fs = require("fs");
const path = require("path");

// Paths
const imageFolderPath = path.join(__dirname, "public/images/projects");
const portfolioPath = path.join(__dirname, "app/constants/portfolio.json");

// Helper to format titles
function formatTitle(str) {
  return str
    .replace(/[-_]/g, " ")
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Load existing portfolio
let portfolio = { projects: [] };
if (fs.existsSync(portfolioPath)) {
  portfolio = JSON.parse(fs.readFileSync(portfolioPath, "utf-8"));
}

// Read all project folders
const folders = fs
  .readdirSync(imageFolderPath, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

// Remove orphaned projects
const folderSet = new Set(folders);
portfolio.projects = portfolio.projects.filter(project => {
  const exists = folderSet.has(project.project_id);
  if (!exists) {
    console.log(`🗑️ Removed orphaned project: ${project.project_id}`);
  }
  return exists;
});

// Rebuild the project map after removing orphans
const existingProjectsMap = new Map(
  portfolio.projects.map(p => [p.project_id, p])
);

let newOrUpdatedProjects = [];

function handleNewOrUpdatedProject(folderName) {
  const folderPath = path.join(imageFolderPath, folderName);

  // Read all image files
  const files = fs.readdirSync(folderPath);
  const imageFiles = files.filter(file =>
    /\.(jpg|jpeg|png|webp|gif|mp4|mov)$/i.test(file)
  );
  const images = imageFiles.map(
    file => `/images/projects/${folderName}/${file}`
  );

  const existing = existingProjectsMap.get(folderName);

  if (existing) {
    // Check if images have changed
    const currentImages = existing.images || [];
    const currentImageSet = new Set(currentImages);
    const imagesChanged =
      images.length !== currentImages.length ||
      images.some(img => !currentImageSet.has(img));

    if (imagesChanged) {
      console.log(`🔄 Updated images for: ${folderName}`);
      existing.images = images;
      newOrUpdatedProjects.push(existing);
    } else {
      console.log(`✅ No image changes in: ${folderName}`);
    }
    return;
  }

  // Create new project with blank metadata
  console.log(`🆕 Adding new project: ${folderName}`);
  const title = formatTitle(folderName);

  const newEntry = {
    project_id: folderName,
    title,
    summaryTitle: "",
    projectDescription: "",
    question: "",
    answer: "",
    summary: "",
    meta: {
      services: "",
      client: "",
      sector: "",
    },
    category: [],
    tags: [],
    images,
  };

  newOrUpdatedProjects.push(newEntry);
}

// Process all folders
folders.forEach(folderName => {
  handleNewOrUpdatedProject(folderName);
});

// Merge updated projects
const finalProjectsMap = new Map();
portfolio.projects.forEach(p => finalProjectsMap.set(p.project_id, p));
newOrUpdatedProjects.forEach(p => finalProjectsMap.set(p.project_id, p));

// Save final result
portfolio.projects = Array.from(finalProjectsMap.values());
fs.writeFileSync(
  portfolioPath,
  JSON.stringify(portfolio, null, 2),
  "utf-8"
);

console.log(`✅ portfolio.json updated with ${newOrUpdatedProjects.length} added or updated projects.`);
