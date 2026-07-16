const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const axios = require("axios");
const nodemailer = require("nodemailer");
const dataStore = require('./dataStore');
const {
  UPLOAD_DIR,
  UploadStorageError,
  ensureUploadDirectory,
  getUploadRelativePath,
  publicUploadPath,
  relocateStorageImage,
  removeStorageImage,
  removeStorageImages,
  removeUploadFolder,
  uploadImageFile,
} = require('./storage');
const app = express();
const PORT = process.env.PORT || 4000;
const SITE_CONTENT_PATH = path.join(__dirname, 'siteContent.json');
const PORTFOLIO_PATH = path.join(__dirname, 'portfolio.json');
const TEAM_PATH = path.join(__dirname, 'team.json');
const CLIENTS_PATH = path.join(__dirname, 'clients.json');
const TEAM_IMAGE_SIZE_LIMIT = 2 * 1024 * 1024;

app.use(cors());
app.use(express.json());
ensureUploadDirectory();
app.use('/uploads', express.static(UPLOAD_DIR));


const JWT_SECRET = process.env.JWT_SECRET || "new_keyssqww";
const JWT_EXPIRES_IN = '30m'; // Token valid for 10 minutes

function generateToken(user) {
  return jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

const storage = multer.memoryStorage();

// Accept multiple fields including mainImage
const upload = multer({ storage }).fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'slider1', maxCount: 20 },
  { name: 'slider2', maxCount: 20 },
  { name: 'column1', maxCount: 20 },
  { name: 'column2', maxCount: 20 },
]);

const siteContentUpload = multer({ storage });
const accoladeUpload = multer({
  storage,
  limits: { fileSize: TEAM_IMAGE_SIZE_LIMIT },
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) return cb(new Error('Only image uploads are allowed'));
    cb(null, true);
  },
});

const teamUpload = multer({
  storage,
  limits: { fileSize: TEAM_IMAGE_SIZE_LIMIT },
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads are allowed'));
    }
    cb(null, true);
  },
});

const clientUpload = multer({
  storage,
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

async function removeImage(imagePath) {
  await removeStorageImage(imagePath);
}

async function removeImages(imagePaths = []) {
  await removeStorageImages(imagePaths);
}

function sendUploadStorageError(error, res, fallbackMessage) {
  if (error instanceof UploadStorageError) {
    console.error(error.message, error.cause || error);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }

  console.error(fallbackMessage, error);
  return res.status(500).json({ error: fallbackMessage });
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

function getImageIdentity(imagePath) {
  if (!imagePath || typeof imagePath !== 'string') return '';

  const uploadRelativePath = getUploadRelativePath(imagePath);
  if (uploadRelativePath) return `/uploads/${uploadRelativePath}`;

  return imagePath;
}

function getRemovedProjectImagePaths(previousProject, nextProject) {
  const nextImageIdentities = new Set(
    getProjectImagePaths(nextProject)
      .map(getImageIdentity)
      .filter(Boolean)
  );

  return getProjectImagePaths(previousProject).filter(imagePath => {
    const identity = getImageIdentity(imagePath);
    return identity && !nextImageIdentities.has(identity);
  });
}

async function removeProjectFiles(project) {
  await removeImages(getProjectImagePaths(project));

  if (project?.project_id) {
    removeUploadFolder('projects', project.project_id);
  }
}

function isUploadedSiteContentImage(imagePath) {
  return Boolean(
    imagePath &&
      imagePath.startsWith('/uploads/site-content/uploads/')
  );
}

function isManagedAccoladeImage(imagePath) {
  return Boolean(
    imagePath &&
      (imagePath.startsWith('/uploads/accolades/') ||
        imagePath.startsWith('/uploads/site-content/uploads/'))
  );
}

async function relocateAccoladeImages(items) {
  let changed = false;
  const relocated = [];

  for (const item of items) {
    if (item.image?.startsWith('/uploads/') && !item.image.startsWith('/uploads/accolades/')) {
      const image = await relocateStorageImage(item.image, 'accolades');
      changed = changed || image !== item.image;
      relocated.push({ ...item, image });
    } else {
      relocated.push(item);
    }
  }

  return { items: relocated, changed };
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
    "home.prefooter.copy": "Creativity isn’t clean. It’s messy,\nunpredictable and beautifully chaotic.\nThat’s where the magic happens— and\nwhere the best stories are born.",
  },
  images: {
    "home.hero.image": publicUploadPath("site-content/default/Home-Wysiwyg.png"),
    "home.news.heroImage": publicUploadPath("site-content/default/img-News-Siddha-Serena.jpeg"),
    "home.news.bottomImage": publicUploadPath("site-content/default/img-News-Siddha-Serena-bottom.jpeg"),
    "home.featured.image": publicUploadPath("site-content/default/img-Featured-Ambuja-Neotia.jpg"),
    "home.work.panel1.image": publicUploadPath("site-content/default/work-SnoBite.jpg"),
    "home.work.panel2.image": publicUploadPath("site-content/default/work-ITC-Hotel.jpg"),
    "home.work.panel3.image": publicUploadPath("site-content/default/work-VION.jpg"),
    "home.prefooter.image": publicUploadPath("site-content/default/pre-footer.png"),
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

async function uploadImageFiles(files = [], folder) {
  return Promise.all(files.map(file => uploadImageFile(file, folder)));
}

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

  const uploadedPaths = [];
  try {
    const mainImageFile = req.files?.mainImage?.[0];
    const mainImagePath = mainImageFile
      ? await uploadImageFile(mainImageFile, `projects/${project_id}`)
      : '';
    if (mainImagePath) uploadedPaths.push(mainImagePath);

    const slider1 = await uploadImageFiles(req.files?.slider1, `projects/${project_id}`);
    const slider2 = await uploadImageFiles(req.files?.slider2, `projects/${project_id}`);
    const column1 = await uploadImageFiles(req.files?.column1, `projects/${project_id}`);
    const column2 = await uploadImageFiles(req.files?.column2, `projects/${project_id}`);
    uploadedPaths.push(...slider1, ...slider2, ...column1, ...column2);

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
        slider1,
        slider2,
        column1,
        column2,
      },
    };

    const project = await dataStore.upsertProject(newProject);
    res.status(201).json({ message: 'Project added successfully', project });
  } catch (error) {
    await removeImages(uploadedPaths);
    return sendUploadStorageError(error, res, 'Failed to add project');
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

  const retained = retainedImages ? JSON.parse(retainedImages) : {};

  const uploadedPaths = [];
  
  try {
    const uploadedImages = {
      slider1: await uploadImageFiles(req.files?.slider1, `projects/${nextProjectId}`),
      slider2: await uploadImageFiles(req.files?.slider2, `projects/${nextProjectId}`),
      column1: await uploadImageFiles(req.files?.column1, `projects/${nextProjectId}`),
      column2: await uploadImageFiles(req.files?.column2, `projects/${nextProjectId}`),
    };
    uploadedPaths.push(
      ...uploadedImages.slider1,
      ...uploadedImages.slider2,
      ...uploadedImages.column1,
      ...uploadedImages.column2
    );

    const newImages = {
      slider1: [...(retained.slider1 || []), ...uploadedImages.slider1],
      slider2: [...(retained.slider2 || []), ...uploadedImages.slider2],
      column1: [...(retained.column1 || []), ...uploadedImages.column1],
      column2: [...(retained.column2 || []), ...uploadedImages.column2],
    };

    const mainImageFile = req.files?.mainImage?.[0];
    let newMainImage = currentProject.mainImage;

    if (mainImageFile) {
      newMainImage = await uploadImageFile(mainImageFile, `projects/${nextProjectId}`);
      uploadedPaths.push(newMainImage);
    } else if (retainedMainImage === '' && currentProject.mainImage) {
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

    const imagesToRemove = getRemovedProjectImagePaths(currentProject, nextProject);
    const project = await dataStore.updateProject(currentProjectId, nextProject);
    await removeImages(imagesToRemove);
    res.json({ message: 'Project updated successfully', project });
  } catch (error) {
    await removeImages(uploadedPaths);
    return sendUploadStorageError(error, res, 'Failed to update project');
  }
});

// DELETE - Remove a project
app.delete("/projects/:project_id", verifyToken, async (req, res) => {
  const { project_id } = req.params;

  try {
    const deletedProject = await dataStore.deleteProject(project_id);
    if (!deletedProject) return res.status(404).json({ error: 'Project not found' });

    await removeProjectFiles(deletedProject);

    res.json({ message: 'Project deleted successfully', deleted: deletedProject });
  } catch (error) {
    return sendUploadStorageError(error, res, 'Failed to delete project');
  }
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
    const nextImagePath = await uploadImageFile(req.file, 'site-content/uploads');
    const currentContent = await dataStore.getSiteContent(defaultSiteContent);
    const previousImagePath = currentContent.images?.[key];
    const content = await dataStore.updateSiteImage(key, nextImagePath, defaultSiteContent);
    if (previousImagePath !== nextImagePath && isUploadedSiteContentImage(previousImagePath)) {
      await removeImage(previousImagePath);
    }
    res.json({ message: 'Image updated successfully', image: nextImagePath, content });
  } catch (error) {
    return sendUploadStorageError(error, res, 'Failed to update site image');
  }
});

app.get('/accolades', async (req, res) => {
  try {
    const currentItems = await dataStore.getAccolades();
    const { items, changed } = await relocateAccoladeImages(currentItems);
    if (changed) {
      await Promise.all(items.map(item => dataStore.updateAccolade(item.id, item)));
    }
    res.json({ items });
  } catch (error) {
    console.error('Error reading accolades:', error);
    res.status(500).json({ error: 'Failed to read accolades' });
  }
});

app.post('/accolades', verifyToken, accoladeUpload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'An image is required' });
  let imagePath;
  try {
    imagePath = await uploadImageFile(req.file, 'accolades');
    const items = await dataStore.getAccolades();
    const item = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      category: String(req.body.category || '').trim(),
      award: String(req.body.award || '').trim(),
      project: String(req.body.project || '').trim(),
      description: String(req.body.description || '').trim(),
      image: imagePath,
      order: items.length,
    };
    if (!item.category || !item.award || !item.project || !item.description) {
      await removeImage(imagePath);
      return res.status(400).json({ error: 'All text fields are required' });
    }
    const created = await dataStore.createAccolade(item);
    res.status(201).json({ item: created });
  } catch (error) {
    if (imagePath) await removeImage(imagePath);
    return sendUploadStorageError(error, res, 'Failed to create accolade');
  }
});

app.put('/accolades/:id', verifyToken, accoladeUpload.single('image'), async (req, res) => {
  let uploadedPath;
  try {
    const items = await dataStore.getAccolades();
    const previous = items.find(item => String(item.id) === req.params.id);
    if (!previous) return res.status(404).json({ error: 'Accolade not found' });
    if (req.file) uploadedPath = await uploadImageFile(req.file, 'accolades');
    const next = {
      ...previous,
      category: String(req.body.category || '').trim(),
      award: String(req.body.award || '').trim(),
      project: String(req.body.project || '').trim(),
      description: String(req.body.description || '').trim(),
      image: uploadedPath || previous.image,
    };
    if (!next.category || !next.award || !next.project || !next.description) {
      if (uploadedPath) await removeImage(uploadedPath);
      return res.status(400).json({ error: 'All text fields are required' });
    }
    const updated = await dataStore.updateAccolade(req.params.id, next);
    if (uploadedPath && isManagedAccoladeImage(previous.image)) await removeImage(previous.image);
    res.json({ item: updated });
  } catch (error) {
    if (uploadedPath) await removeImage(uploadedPath);
    return sendUploadStorageError(error, res, 'Failed to update accolade');
  }
});

app.delete('/accolades/:id', verifyToken, async (req, res) => {
  try {
    const item = await dataStore.deleteAccolade(req.params.id);
    if (!item) return res.status(404).json({ error: 'Accolade not found' });
    if (isManagedAccoladeImage(item.image)) await removeImage(item.image);
    res.json({ message: 'Accolade deleted' });
  } catch (error) {
    return sendUploadStorageError(error, res, 'Failed to delete accolade');
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
    return res.status(400).json({ error: 'Name and position are required' });
  }

  let uploadedImage = '';
  try {
    const members = await dataStore.getTeamMembers();
    uploadedImage = req.file ? await uploadImageFile(req.file, 'team') : '';
    const member = {
      id: slugify(nextName) || `member-${Date.now()}`,
      name: nextName,
      position: nextPosition,
      image: uploadedImage,
      order: Number.isFinite(Number(order)) ? Number(order) : members.length,
    };

    if (members.some(existing => existing.id === member.id)) {
      member.id = `${member.id}-${Date.now()}`;
    }

    const created = await dataStore.createTeamMember(member);
    const nextMembers = await dataStore.getTeamMembers();
    res.status(201).json({ message: 'Team member added successfully', member: created, members: nextMembers });
  } catch (error) {
    await removeImage(uploadedImage);
    return sendUploadStorageError(error, res, 'Failed to add team member');
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
    return res.status(400).json({ error: 'Name and position are required' });
  }

  let uploadedImage = '';
  try {
    const members = await dataStore.getTeamMembers();
    const current = members.find(member => member.id === id);
    if (!current) {
      return res.status(404).json({ error: 'Team member not found' });
    }

    uploadedImage = req.file ? await uploadImageFile(req.file, 'team') : '';
    const nextImage = uploadedImage || current.image;

    const member = await dataStore.updateTeamMember(id, {
      ...current,
      name: nextName,
      position: nextPosition,
      image: nextImage,
      order: Number.isFinite(Number(order)) ? Number(order) : current.order,
    });

    const nextMembers = await dataStore.getTeamMembers();
    if (uploadedImage && current.image && current.image !== nextImage) {
      await removeImage(current.image);
    }
    res.json({ message: 'Team member updated successfully', member, members: nextMembers });
  } catch (error) {
    await removeImage(uploadedImage);
    return sendUploadStorageError(error, res, 'Failed to update team member');
  }
});

app.delete('/team/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await dataStore.deleteTeamMember(id);
    if (!deleted) return res.status(404).json({ error: 'Team member not found' });

    await removeImage(deleted.image);
    const members = await dataStore.getTeamMembers();
    res.json({ message: 'Team member deleted successfully', deleted, members });
  } catch (error) {
    return sendUploadStorageError(error, res, 'Failed to delete team member');
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
    return res.status(400).json({ error: 'Client name is required' });
  }

  const uploadedImages = [];
  try {
    const clients = await dataStore.getClients();
    const bwImage = req.files?.bwImage?.[0]
      ? await uploadImageFile(req.files.bwImage[0], 'clients')
      : '';
    const colorImage = req.files?.colorImage?.[0]
      ? await uploadImageFile(req.files.colorImage[0], 'clients')
      : '';
    uploadedImages.push(bwImage, colorImage);
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
    await removeImages(uploadedImages);
    return sendUploadStorageError(error, res, 'Failed to add client');
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
    return res.status(400).json({ error: 'Client name is required' });
  }

  const uploadedImages = [];
  try {
    const clients = await dataStore.getClients();
    const current = clients.find(client => client.id === id);
    if (!current) {
      return res.status(404).json({ error: 'Client not found' });
    }

    const nextBwImage = req.files?.bwImage?.[0]
      ? await uploadImageFile(req.files.bwImage[0], 'clients')
      : current.bwImage;
    const nextColorImage = req.files?.colorImage?.[0]
      ? await uploadImageFile(req.files.colorImage[0], 'clients')
      : current.colorImage;
    uploadedImages.push(
      req.files?.bwImage?.[0] ? nextBwImage : '',
      req.files?.colorImage?.[0] ? nextColorImage : ''
    );

    const client = await dataStore.updateClientRecord(id, {
      ...current,
      name: nextName,
      link: String(link || '').trim(),
      bwImage: nextBwImage,
      colorImage: nextColorImage,
      order: Number.isFinite(Number(order)) ? Number(order) : current.order,
    });

    const nextClients = await dataStore.getClients();
    if (req.files?.bwImage?.[0] && current.bwImage && current.bwImage !== nextBwImage) {
      await removeImage(current.bwImage);
    }

    if (req.files?.colorImage?.[0] && current.colorImage && current.colorImage !== nextColorImage) {
      await removeImage(current.colorImage);
    }
    res.json({ message: 'Client updated successfully', client, clients: nextClients });
  } catch (error) {
    await removeImages(uploadedImages);
    return sendUploadStorageError(error, res, 'Failed to update client');
  }
});

app.delete('/clients/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await dataStore.deleteClientRecord(id);
    if (!deleted) return res.status(404).json({ error: 'Client not found' });

    await removeImages([deleted.bwImage, deleted.colorImage]);
    const clients = await dataStore.getClients();
    res.json({ message: 'Client deleted successfully', deleted, clients });
  } catch (error) {
    return sendUploadStorageError(error, res, 'Failed to delete client');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
