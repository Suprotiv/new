const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const axios = require("axios");
const nodemailer = require("nodemailer");
const dataStore = require('./dataStore');
const app = express();
const PORT = process.env.PORT || 4000;
const SITE_CONTENT_PATH = path.join(__dirname, 'siteContent.json');
const PORTFOLIO_PATH = path.join(__dirname, 'portfolio.json');
const TEAM_PATH = path.join(__dirname, 'team.json');
const CLIENTS_PATH = path.join(__dirname, 'clients.json');
const TEAM_IMAGE_SIZE_LIMIT = 2 * 1024 * 1024;

app.use(cors());
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, 'images')));


const JWT_SECRET = process.env.JWT_SECRET || "new_keyssqww";
const JWT_EXPIRES_IN = '30m'; // Token valid for 10 minutes

function generateToken(user) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const projectId = req.params.project_id || req.body.project_id;
    if (!projectId) return cb(new Error("Project ID is required"));
    const folderPath = path.join(__dirname, 'images/projects', projectId);
    fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

// Accept multiple fields including mainImage
const upload = multer({ storage }).fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'slider1', maxCount: 20 },
  { name: 'slider2', maxCount: 20 },
  { name: 'column1', maxCount: 20 },
  { name: 'column2', maxCount: 20 },
]);

const siteContentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folderPath = path.join(__dirname, 'images/site-content/uploads');
    fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath);
  },
  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});

const siteContentUpload = multer({ storage: siteContentStorage });

const teamStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folderPath = path.join(__dirname, 'images/team');
    fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath);
  },
  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});

const teamUpload = multer({
  storage: teamStorage,
  limits: { fileSize: TEAM_IMAGE_SIZE_LIMIT },
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads are allowed'));
    }
    cb(null, true);
  },
});

const clientStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folderPath = path.join(__dirname, 'images/clients');
    fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath);
  },
  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}-${safeName}`);
  },
});

const clientUpload = multer({
  storage: clientStorage,
  limits: { fileSize: TEAM_IMAGE_SIZE_LIMIT },
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads are allowed'));
    }
    cb(null, true);
  },
}).fields([
  { name: 'bwImage', maxCount: 1 },
  { name: 'colorImage', maxCount: 1 },
]);

function handleMulterError(error, req, res, next) {
  if (!error) return next();

  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Team member images must be 2 MB or smaller' });
  }

  return res.status(400).json({ error: error.message || 'File upload failed' });
}

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, '&')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9&%-]/g, '')
    .replace(/-+/g, '-');
}

function getProjectIdError(value) {
  const projectId = String(value || '').trim();

  if (!projectId) return 'Project ID is required.';
  if (/\s/.test(projectId)) return 'Project ID cannot contain spaces. Use hyphens instead.';
  if (/[A-Z]/.test(projectId)) return 'Project ID can only use lowercase letters.';
  if (/[^a-z-]/.test(projectId)) return 'Project ID can only contain lowercase letters and hyphens.';

  return '';
}

function removeBackendImage(imagePath) {
  if (!imagePath || !imagePath.startsWith('/images/')) return;
  const fullPath = path.join(__dirname, imagePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

function removeBackendImages(imagePaths = []) {
  [...new Set(imagePaths.filter(Boolean))].forEach(removeBackendImage);
}

function getProjectImagePaths(project) {
  const paths = [];
  if (project?.mainImage) paths.push(project.mainImage);

  const imageGroups = project?.images || {};
  for (const images of Object.values(imageGroups)) {
    if (Array.isArray(images)) paths.push(...images);
  }

  return paths;
}

function removeProjectFiles(project) {
  removeBackendImages(getProjectImagePaths(project));

  if (project?.project_id) {
    const folderPath = path.join(__dirname, 'images/projects', project.project_id);
    if (fs.existsSync(folderPath)) {
      fs.rmSync(folderPath, { recursive: true, force: true });
    }
  }
}

function isUploadedSiteContentImage(imagePath) {
  return Boolean(imagePath && imagePath.startsWith('/images/site-content/uploads/'));
}

const defaultSiteContent = {
  text: {
    "home.hero.title.line1": "We don’t",
    "home.hero.title.line2": "just design,",
    "home.hero.title.accent": "we disrupt",
    "home.hero.cta": "See work",
    "home.clients.intro": "At Wysiwyg, we design with heart, mind and a bit of madness.\nBecause when you’re creating something unforgettable, playing it safe isn’t part of the script.\nAs already successfully implemented by 250+ partners:",
    "home.news.heading": "In the news",
    "home.news.opening": "Creativity isn’t a box to fit into;\nit’s a wall to break through.\nWe chase the spark, ride the chaos\nand craft designs\nthat don’t just\nsit there—they shout!",
    "home.news.guts": "Design with guts, not just grids.\nWe listen, we learn, we feel.\nGreat design isn’t just seen;\nit’s experienced.",
    "home.news.precision": "We design with precision but we leave\nroom for the unexpected.",
    "home.news.perfect": "Because perfect is boring.",
    "home.news.colours": "Colours aren’t curated—they explode.\nPalettes are for painters;\nwe mix shades with attitude.\nBold? Always. Basic? Never.",
    "home.news.mainstream": "Design isn’t mainstream.\nIt’s got character. It grabs attention,\nspins it around and leaves a mark.\nIf you want quiet, you’re in the wrong place.",
    "home.news.algorithm": "Trends are cool, but authenticity\nis cooler. We don’t follow the\nalgorithm—we rewrite it.",
    "home.news.vibe": "Symmetry is optional.\nVibe is everything.",
    "home.news.movedOn": "By the time everyone else catches on,\nwe’ve already moved on.",
    "home.news.real": "Real design. Real impact. No filters.",
    "home.featured.title": "featured Udyatt Luxury",
    "home.featured.description": "We partnered with Ambuja Neotia to design the brochure for Udyatt, the final masterpiece of legendary architect BV Doshi. Driven by a minimalist visual language, custom iconography and tactile material explorations, the piece beautifully balances art, science and philosophy. It stands as a timeless, breathing tribute to ultra-luxury living.",
    "home.featured.category": "COLLATERALS",
    "home.featured.type": "Brochure",
    "home.work.heading": "our work",
    "home.work.panel1.caption": "SnoBite | Packaging",
    "home.work.panel2.caption": "ITC Hotels | Poster",
    "home.work.panel3.caption": "VION | Packaging",
    "home.stats.1.value": "1600",
    "home.stats.1.label": "Projects done",
    "home.stats.1.subLabel": "From global campaigns to local identities — and everything in between.",
    "home.stats.2.value": "34",
    "home.stats.2.label": "Years of experience",
    "home.stats.2.subLabel": "Designing with intent since 1992.",
    "home.stats.3.value": "500",
    "home.stats.3.label": "Satisfied clients",
    "home.stats.3.subLabel": "Across industries and continents.",
    "home.stats.4.value": "200",
    "home.stats.4.label": "Leads generated",
    "home.stats.4.subLabel": "Helping clients grow their reach — one lead at a time.",
    "home.accolades.heading": "accolades",
    "home.accolades.1.category": "Best real estate construction",
    "home.accolades.1.award": "eLets India Brand Summit & Awards 2024",
    "home.accolades.1.project": "Ambuja Utalika",
    "home.accolades.1.description": "A unanimous jury decision for the best launch campaign for ‘Utalika—Let this world be yours’.",
    "home.accolades.2.category": "Best fashion brochure",
    "home.accolades.2.award": "Brochure Design that Works",
    "home.accolades.2.project": "Ventures Fashion",
    "home.accolades.2.description": "A compilation by Lisa L Cyr of some of the best brochures in the graphic design industry. It showcases the various textures and patterns in an interesting, tasteful way.",
    "home.accolades.3.category": "Best newsletter",
    "home.accolades.3.award": "2012–13",
    "home.accolades.3.project": "Rotary Club of Calcutta",
    "home.accolades.3.description": "Our exacting standards of copy, design and artwork were applied to create a finished product, month-after-month, that reflects the esteem and prestige of the Rotary Club.",
    "home.accolades.4.category": "Showcase",
    "home.accolades.4.award": "ITC Gold Flake, IFB Home Appliances and Mahadevi Birla World Academy",
    "home.accolades.4.project": "Kyoorius",
    "home.accolades.4.description": "Kyoorius is a design magazine that publishes an annual compilation of the best design work in India.",
    "home.prefooter.copy": "Creativity isn’t clean. It’s messy,\nunpredictable and beautifully chaotic.\nThat’s where the magic happens— and\nwhere the best stories are born.",
  },
  images: {
    "home.hero.image": "/images/site-content/default/Home-Wysiwyg.png",
    "home.news.heroImage": "/images/site-content/default/img-News-Siddha-Serena.jpeg",
    "home.news.bottomImage": "/images/site-content/default/img-News-Siddha-Serena-bottom.jpeg",
    "home.featured.image": "/images/site-content/default/img-Featured-Ambuja-Neotia.jpg",
    "home.work.panel1.image": "/images/site-content/default/work-SnoBite.jpg",
    "home.work.panel2.image": "/images/site-content/default/work-ITC-Hotel.jpg",
    "home.work.panel3.image": "/images/site-content/default/work-VION.jpg",
    "home.accolades.1.image": "/images/site-content/default/accolades-AMBUJA-UTALIKA.png",
    "home.accolades.2.image": "/images/site-content/default/accolades-VENTURES-FASHION.png",
    "home.accolades.3.image": "/images/site-content/default/accolades-ROTARY-CLUB-OF-CALCUTTA.png",
    "home.accolades.4.image": "/images/site-content/default/accolades-KYOORIUS.png",
    "home.prefooter.image": "/images/site-content/default/pre-footer.png",
  },
};

// Helper function to build file paths

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === "admin" && password === "wysi@25") {
    const token = generateToken({ username });
    const decoded = jwt.decode(token);
    return res.json({ accessToken: token , exp:decoded.exp });
  }

  res.status(401).json({ error: "Invalid credentials" });
});

function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
   
  if (!token) return res.status(401).json({ error: "Missing token" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = user;
    next();
  });
}

app.post("/api/contact", async (req, res) => {
  const { name, email, phone, subject, message , captcha } = req.body;

  if (!captcha) {
    return res.status(400).json({ success: false, error: "Missing captcha token" });
  }

  const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=6LfpNG0rAAAAAI0IDSo3upXdhxXZ1ZM4VRf_-G1C&response=${captcha}`;

  try {
    const { data } = await axios.post(verifyURL);
    if (!data.success) {
      return res.status(400).json({ success: false, error: "Failed captcha verification" });
    }

  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "suprotiv.2003@gmail.com",
        pass: "xswi lzzx oyqh jczy", // Consider storing this in an environment variable for security
      },
    });

    // ✅ Email to you (admin)
    await transporter.sendMail({
      from: `"${name}" <suprotiv.2003@gmail.com>`,
      to: "suprotiv.2003@gmail.com",
      subject: `New Contact from ${name}`,
      replyTo: email,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nSubject: ${subject}\n\nMessage:\n${message}`,
    });

    // ✅ Confirmation email to the user
    await transporter.sendMail({
      from: `"WYSIWYG Team" <suprotiv.2003@gmail.com>`,
      to: email,
      subject: "Thanks for contacting WYSIWYG!",
      text: `Hi ${name},

Thank you for reaching out to us. We've received your message and will get back to you shortly.

Here’s what we received from you:
-------------------------------------
Subject: ${subject}
Message: ${message}
-------------------------------------

If this wasn't you, feel free to ignore this email.

Warm regards,  
WYSIWYG Communications  
`,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Mail send failed:", error);
    res.status(500).json({ success: false, error: "Failed to send message" });
  }
}
catch (error) {
  console.error("CAPTCHA verification failed:", error);
  res.status(500).json({ success: false, error: "CAPTCHA verification failed" });
}
});

const buildImagePaths = (projectId, files = []) =>
  files.map(file => `/images/projects/${projectId}/${file.filename}`);

// POST - Create new project
app.post("/projects", verifyToken, upload, async (req, res) => {
  const {
    project_id,
    title,
    summaryTitle,
    projectDescription,
    question,
    answer,
    summary,
    meta,
    category,
    tags,
  } = req.body;

  const projectIdError = getProjectIdError(project_id);
  if (projectIdError) {
    return res.status(400).json({ error: projectIdError });
  }

  const mainImageFile = req.files?.mainImage?.[0];
  const mainImagePath = mainImageFile
    ? `/images/projects/${project_id}/${mainImageFile.filename}`
    : '';

  const newProject = {
    project_id,
    title,
    summaryTitle,
    projectDescription,
    question,
    answer,
    summary,
    meta: JSON.parse(meta),
    category: JSON.parse(category),
    tags: JSON.parse(tags),
    mainImage: mainImagePath,
    images: {
      slider1: buildImagePaths(project_id, req.files?.slider1),
      slider2: buildImagePaths(project_id, req.files?.slider2),
      column1: buildImagePaths(project_id, req.files?.column1),
      column2: buildImagePaths(project_id, req.files?.column2),
    },
  };

  try {
    const project = await dataStore.upsertProject(newProject);
    res.status(201).json({ message: 'Project added successfully', project });
  } catch (error) {
    console.error('Error adding project:', error);
    res.status(500).json({ error: 'Failed to add project' });
  }
});

// GET - Fetch all projects
app.get('/projects', async (req, res) => {
  try {
      const projects = await dataStore.getProjects();
      res.json(projects);
  } catch (parseError) {
    console.error('Error reading projects:', parseError);
    res.status(500).json({ error: 'Failed to read projects' });
  }
});

// PUT - Update existing project
app.put("/projects/:project_id", verifyToken, upload, async (req, res) => {
  const currentProjectId = req.params.project_id;
  const {
    project_id,
    title,
    summaryTitle,
    projectDescription,
    question,
    answer,
    summary,
    meta,
    category,
    tags,
    retainedImages,
    retainedMainImage,
  } = req.body;

  const nextProjectId = String(project_id || currentProjectId).trim();
  const projectIdError = getProjectIdError(nextProjectId);
  if (projectIdError) {
    return res.status(400).json({ error: projectIdError });
  }

  const currentProject = await dataStore.getProject(currentProjectId);
  if (!currentProject) return res.status(404).json({ error: 'Project not found' });

  if (nextProjectId !== currentProjectId) {
    const existingProject = await dataStore.getProject(nextProjectId);
    if (existingProject) {
      return res.status(409).json({ error: 'A project with this Project ID already exists' });
    }
  }

  const oldImages = currentProject.images || {};
  const retained = retainedImages ? JSON.parse(retainedImages) : {};

  const removed = {};

  for (const group of ['slider1', 'slider2', 'column1', 'column2']) {
    const prevGroup = oldImages[group] || [];
    const keepGroup = retained[group] || [];
    removed[group] = prevGroup.filter(img => !keepGroup.includes(img));

    removed[group].forEach((imgPath) => {
      // Check if this image is still used in any group of the same project
      const stillUsedInSameProject = Object.entries(oldImages).some(([g, images]) => {
        if (g === group) return false; // skip the current group being updated
        return images.includes(imgPath);
      });
    
      if (!stillUsedInSameProject) {
        removeBackendImage(imgPath);
      }
    });
  }

  function filterNewFiles(projectId, files = []) {
    const resultPaths = [];
  
    for (const file of files) {
      const destPath = path.join(__dirname, 'images/projects', projectId, file.originalname);
      if (fs.existsSync(destPath)) {
        // File already exists with same name, reference its existing path
        resultPaths.push(`/images/projects/${projectId}/${file.originalname}`);
        // Remove newly uploaded duplicate
        fs.unlinkSync(file.path);
      } else {
        // Rename current random-named upload to its original name
        const newFilePath = path.join(__dirname, 'images/projects', projectId, file.originalname);
        fs.renameSync(file.path, newFilePath);
        resultPaths.push(`/images/projects/${projectId}/${file.originalname}`);
      }
    }
  
    return resultPaths;
  }
  
  const newImages = {
    slider1: [...(retained.slider1 || []), ...filterNewFiles(currentProjectId, req.files?.slider1)],
    slider2: [...(retained.slider2 || []), ...filterNewFiles(currentProjectId, req.files?.slider2)],
    column1: [...(retained.column1 || []), ...filterNewFiles(currentProjectId, req.files?.column1)],
    column2: [...(retained.column2 || []), ...filterNewFiles(currentProjectId, req.files?.column2)],
  };

  // Handle mainImage upload
  const mainImageFile = req.files?.mainImage?.[0];
let newMainImage = currentProject.mainImage;

if (mainImageFile) {
  removeBackendImage(currentProject.mainImage);

  // Set new image path
  newMainImage = `/images/projects/${currentProjectId}/${mainImageFile.filename}`;
} else if (retainedMainImage === '' && currentProject.mainImage) {
  removeBackendImage(currentProject.mainImage);
  newMainImage = '';
}

  const nextProject = {
    ...currentProject,
    project_id: nextProjectId,
    title,
    summaryTitle,
    projectDescription,
    question,
    answer,
    summary,
    meta: meta ? JSON.parse(meta) : currentProject.meta,
    category: category ? JSON.parse(category) : currentProject.category,
    tags: tags ? JSON.parse(tags) : currentProject.tags,
    images: newImages,
    mainImage: newMainImage,
  };

  try {
    const project = await dataStore.updateProject(currentProjectId, nextProject);
    res.json({ message: 'Project updated successfully', project });
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// DELETE - Remove a project
app.delete("/projects/:project_id", verifyToken, async (req, res) => {
  const { project_id } = req.params;

  const deletedProject = await dataStore.deleteProject(project_id);
  if (!deletedProject) return res.status(404).json({ error: 'Project not found' });

  removeProjectFiles(deletedProject);

  res.json({ message: 'Project deleted successfully', deleted: deletedProject });
});

app.get('/site-content', async (req, res) => {
  try {
    res.json(await dataStore.getSiteContent(defaultSiteContent));
  } catch (error) {
    console.error('Error reading site content:', error);
    res.status(500).json({ error: 'Failed to read site content' });
  }
});

app.put('/site-content/text', verifyToken, async (req, res) => {
  const { key, value } = req.body;

  if (!key || typeof value !== 'string') {
    return res.status(400).json({ error: 'A text key and string value are required' });
  }

  try {
    const content = await dataStore.updateSiteText(key, value, defaultSiteContent);
    res.json({ message: 'Text updated successfully', content });
  } catch (error) {
    console.error('Error updating site text:', error);
    res.status(500).json({ error: 'Failed to update site text' });
  }
});

app.post('/site-content/image', verifyToken, siteContentUpload.single('image'), async (req, res) => {
  const { key } = req.body;

  if (!key || !req.file) {
    return res.status(400).json({ error: 'An image key and file are required' });
  }

  try {
    const nextImagePath = `/images/site-content/uploads/${req.file.filename}`;
    const currentContent = await dataStore.getSiteContent(defaultSiteContent);
    const previousImagePath = currentContent.images?.[key];
    const content = await dataStore.updateSiteImage(key, nextImagePath, defaultSiteContent);
    if (previousImagePath !== nextImagePath && isUploadedSiteContentImage(previousImagePath)) {
      removeBackendImage(previousImagePath);
    }
    res.json({ message: 'Image updated successfully', image: nextImagePath, content });
  } catch (error) {
    console.error('Error updating site image:', error);
    res.status(500).json({ error: 'Failed to update site image' });
  }
});

app.get('/categories', async (req, res) => {
  try {
    const categories = await dataStore.getCategories();
    res.json(categories);
  } catch (parseError) {
    console.error('Error reading categories:', parseError);
    res.status(500).json({ error: 'Failed to read categories' });
  }
});

app.post('/categories', verifyToken, async (req, res) => {
  const { name, slug, tags } = req.body;
  const nextName = String(name || '').trim();
  const nextSlug = slugify(slug || nextName);

  if (!nextName || !nextSlug) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  try {
    const existing = await dataStore.getCategory(nextSlug);
    if (existing) {
      return res.status(409).json({ error: 'A category with this slug already exists' });
    }

    const category = {
      name: nextName,
      slug: nextSlug,
      tags: Array.isArray(tags) ? tags.map(tag => String(tag).trim()).filter(Boolean) : [],
    };

    const created = await dataStore.createCategory(category);
    const categories = await dataStore.getCategories();
    res.status(201).json({ message: 'Category added successfully', category: created, categories });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ error: 'Failed to add category' });
  }
});

app.put('/categories/:slug', verifyToken, async (req, res) => {
  const { slug } = req.params;
  const { name, tags } = req.body;
  const nextName = String(name || '').trim();

  if (!nextName) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  try {
    const existing = await dataStore.getCategory(slug);
    if (!existing) return res.status(404).json({ error: 'Category not found' });

    const category = await dataStore.updateCategory(slug, {
      ...existing,
      name: nextName,
      tags: Array.isArray(tags) ? tags.map(tag => String(tag).trim()).filter(Boolean) : [],
    });

    const categories = await dataStore.getCategories();
    res.json({ message: 'Category updated successfully', category, categories });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

app.delete('/categories/:slug', verifyToken, async (req, res) => {
  const { slug } = req.params;

  if (slug === 'all') {
    return res.status(400).json({ error: 'The All category cannot be deleted' });
  }

  try {
    const deleted = await dataStore.deleteCategory(slug);
    if (!deleted) return res.status(404).json({ error: 'Category not found' });

    const categories = await dataStore.getCategories();
    res.json({ message: 'Category deleted successfully', deleted, categories });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

app.get('/team', async (req, res) => {
  try {
    const members = await dataStore.getTeamMembers();
    res.json(members);
  } catch (error) {
    console.error('Error reading team:', error);
    res.status(500).json({ error: 'Failed to read team data' });
  }
});

app.post('/team', verifyToken, teamUpload.single('image'), handleMulterError, async (req, res) => {
  const { name, position, order } = req.body;
  const nextName = String(name || '').trim();
  const nextPosition = String(position || '').trim();

  if (!nextName || !nextPosition) {
    if (req.file) removeBackendImage(`/images/team/${req.file.filename}`);
    return res.status(400).json({ error: 'Name and position are required' });
  }

  try {
    const members = await dataStore.getTeamMembers();
    const member = {
      id: slugify(nextName) || `member-${Date.now()}`,
      name: nextName,
      position: nextPosition,
      image: req.file ? `/images/team/${req.file.filename}` : '',
      order: Number.isFinite(Number(order)) ? Number(order) : members.length,
    };

    if (members.some(existing => existing.id === member.id)) {
      member.id = `${member.id}-${Date.now()}`;
    }

    const created = await dataStore.createTeamMember(member);
    const nextMembers = await dataStore.getTeamMembers();
    res.status(201).json({ message: 'Team member added successfully', member: created, members: nextMembers });
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ error: 'Failed to add team member' });
  }
});

app.put('/team/reorder', verifyToken, async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: 'An ordered ids array is required' });
  }

  try {
    const members = await dataStore.reorderTeamMembers(ids);
    res.json({ message: 'Team order updated successfully', members });
  } catch (error) {
    console.error('Error reordering team:', error);
    res.status(500).json({ error: 'Failed to reorder team members' });
  }
});

app.put('/team/:id', verifyToken, teamUpload.single('image'), handleMulterError, async (req, res) => {
  const { id } = req.params;
  const { name, position, order } = req.body;
  const nextName = String(name || '').trim();
  const nextPosition = String(position || '').trim();

  if (!nextName || !nextPosition) {
    if (req.file) removeBackendImage(`/images/team/${req.file.filename}`);
    return res.status(400).json({ error: 'Name and position are required' });
  }

  try {
    const members = await dataStore.getTeamMembers();
    const current = members.find(member => member.id === id);
    if (!current) {
      if (req.file) removeBackendImage(`/images/team/${req.file.filename}`);
      return res.status(404).json({ error: 'Team member not found' });
    }

    const nextImage = req.file ? `/images/team/${req.file.filename}` : current.image;

    if (req.file && current.image && current.image !== nextImage) {
      removeBackendImage(current.image);
    }

    const member = await dataStore.updateTeamMember(id, {
      ...current,
      name: nextName,
      position: nextPosition,
      image: nextImage,
      order: Number.isFinite(Number(order)) ? Number(order) : current.order,
    });

    const nextMembers = await dataStore.getTeamMembers();
    res.json({ message: 'Team member updated successfully', member, members: nextMembers });
  } catch (error) {
    console.error('Error updating team member:', error);
    res.status(500).json({ error: 'Failed to update team member' });
  }
});

app.delete('/team/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await dataStore.deleteTeamMember(id);
    if (!deleted) return res.status(404).json({ error: 'Team member not found' });

    removeBackendImage(deleted.image);
    const members = await dataStore.getTeamMembers();
    res.json({ message: 'Team member deleted successfully', deleted, members });
  } catch (error) {
    console.error('Error deleting team member:', error);
    res.status(500).json({ error: 'Failed to delete team member' });
  }
});

app.get('/clients', async (req, res) => {
  try {
    const clients = await dataStore.getClients();
    res.json(clients);
  } catch (error) {
    console.error('Error reading clients:', error);
    res.status(500).json({ error: 'Failed to read clients data' });
  }
});

app.post('/clients', verifyToken, clientUpload, handleMulterError, async (req, res) => {
  const { name, link, order } = req.body;
  const nextName = String(name || '').trim();

  if (!nextName) {
    if (req.files?.bwImage?.[0]) removeBackendImage(`/images/clients/${req.files.bwImage[0].filename}`);
    if (req.files?.colorImage?.[0]) removeBackendImage(`/images/clients/${req.files.colorImage[0].filename}`);
    return res.status(400).json({ error: 'Client name is required' });
  }

  try {
    const clients = await dataStore.getClients();
    const bwImage = req.files?.bwImage?.[0]
      ? `/images/clients/${req.files.bwImage[0].filename}`
      : '';
    const colorImage = req.files?.colorImage?.[0]
      ? `/images/clients/${req.files.colorImage[0].filename}`
      : '';
    const client = {
      id: slugify(nextName) || `client-${Date.now()}`,
      name: nextName,
      link: String(link || '').trim(),
      bwImage,
      colorImage,
      order: Number.isFinite(Number(order)) ? Number(order) : clients.length,
    };

    if (clients.some(existing => existing.id === client.id)) {
      client.id = `${client.id}-${Date.now()}`;
    }

    const created = await dataStore.createClientRecord(client);
    const nextClients = await dataStore.getClients();
    res.status(201).json({ message: 'Client added successfully', client: created, clients: nextClients });
  } catch (error) {
    console.error('Error adding client:', error);
    res.status(500).json({ error: 'Failed to add client' });
  }
});

app.put('/clients/reorder', verifyToken, async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids)) {
    return res.status(400).json({ error: 'An ordered ids array is required' });
  }

  try {
    const clients = await dataStore.reorderClients(ids);
    res.json({ message: 'Client order updated successfully', clients });
  } catch (error) {
    console.error('Error reordering clients:', error);
    res.status(500).json({ error: 'Failed to reorder clients' });
  }
});

app.put('/clients/:id', verifyToken, clientUpload, handleMulterError, async (req, res) => {
  const { id } = req.params;
  const { name, link, order } = req.body;
  const nextName = String(name || '').trim();

  if (!nextName) {
    if (req.files?.bwImage?.[0]) removeBackendImage(`/images/clients/${req.files.bwImage[0].filename}`);
    if (req.files?.colorImage?.[0]) removeBackendImage(`/images/clients/${req.files.colorImage[0].filename}`);
    return res.status(400).json({ error: 'Client name is required' });
  }

  try {
    const clients = await dataStore.getClients();
    const current = clients.find(client => client.id === id);
    if (!current) {
      if (req.files?.bwImage?.[0]) removeBackendImage(`/images/clients/${req.files.bwImage[0].filename}`);
      if (req.files?.colorImage?.[0]) removeBackendImage(`/images/clients/${req.files.colorImage[0].filename}`);
      return res.status(404).json({ error: 'Client not found' });
    }

    const nextBwImage = req.files?.bwImage?.[0]
      ? `/images/clients/${req.files.bwImage[0].filename}`
      : current.bwImage;
    const nextColorImage = req.files?.colorImage?.[0]
      ? `/images/clients/${req.files.colorImage[0].filename}`
      : current.colorImage;

    if (req.files?.bwImage?.[0] && current.bwImage && current.bwImage !== nextBwImage) {
      removeBackendImage(current.bwImage);
    }

    if (req.files?.colorImage?.[0] && current.colorImage && current.colorImage !== nextColorImage) {
      removeBackendImage(current.colorImage);
    }

    const client = await dataStore.updateClientRecord(id, {
      ...current,
      name: nextName,
      link: String(link || '').trim(),
      bwImage: nextBwImage,
      colorImage: nextColorImage,
      order: Number.isFinite(Number(order)) ? Number(order) : current.order,
    });

    const nextClients = await dataStore.getClients();
    res.json({ message: 'Client updated successfully', client, clients: nextClients });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ error: 'Failed to update client' });
  }
});

app.delete('/clients/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await dataStore.deleteClientRecord(id);
    if (!deleted) return res.status(404).json({ error: 'Client not found' });

    removeBackendImage(deleted.bwImage);
    removeBackendImage(deleted.colorImage);
    const clients = await dataStore.getClients();
    res.json({ message: 'Client deleted successfully', deleted, clients });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ error: 'Failed to delete client' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
