"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { ReactSortable } from "react-sortablejs";
import withAuth from "./withAuth";
import CategoryMultiSelect from "./CategoryMultiSelect";

const getProjectIdError = (value) => {
  if (!value.trim()) {
    return "Project ID is required.";
  }

  if (/\s/.test(value)) {
    return "Project ID cannot contain spaces. Use hyphens instead.";
  }

  if (/[A-Z]/.test(value)) {
    return "Project ID can only use lowercase letters.";
  }

  if (/[^a-z-]/.test(value)) {
    return "Project ID can only contain lowercase letters and hyphens.";
  }

  return "";
};

const EditPageComponent = () => {
  const { project_id } = useParams();
  const router = useRouter();

  const [formData, setFormData] = useState({
    project_id: "",
    title: "",
    summaryTitle: "",
    projectDescription: "",
    question: "",
    answer: "",
    summary: "",
    meta: { services: "", client: "", sector: "" },
    category: [],
    tags: "",
  });

  const [existingMainImage, setExistingMainImage] = useState("");
  const [newMainImage, setNewMainImage] = useState(null);
  const [message, setMessage] = useState("");
  const [projectIdError, setProjectIdError] = useState("");
  const [categories, setCategories] = useState([]);

  const [existingImages, setExistingImages] = useState({
    slider1: [],
    slider2: [],
    column1: [],
    column2: [],
  });

  const [newImages, setNewImages] = useState({
    slider1: [],
    slider2: [],
    column1: [],
    column2: [],
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/projects`
        );
        const project = res.data.find((p) => p.project_id === project_id);
        if (!project) return;

        setFormData({
          project_id: project.project_id,
          title: project.title,
          summaryTitle: project.summaryTitle,
          projectDescription: project.projectDescription,
          question: project.question,
          answer: project.answer,
          summary: project.summary,
          meta: project.meta,
          category: Array.isArray(project.category) ? project.category : [],
          tags: Array.isArray(project.tags) ? project.tags.join(", ") : "",
        });

        setExistingMainImage(project.mainImage);
        setExistingImages(project.images || {});
      } catch (err) {
        console.log(err);
      }
    };

    fetchProject();
  }, [project_id]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/categories`
        );
        setCategories(
          (res.data || []).filter((category) => category.slug !== "all")
        );
      } catch (err) {
        console.log(err);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "project_id") {
      setProjectIdError("");
    }

    if (name.startsWith("meta.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        meta: { ...prev.meta, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryChange = (selectedCategories) => {
    setFormData((prev) => ({ ...prev, category: selectedCategories }));
  };

  const handleNewImageChange = (e, group) => {
    if (e.target.files) {
      setNewImages((prev) => ({
        ...prev,
        [group]: Array.from(e.target.files),
      }));
    }
  };

  const handleRemoveExistingImage = (group, url) => {
    setExistingImages((prev) => ({
      ...prev,
      [group]: prev[group].filter((img) => img !== url),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextProjectIdError = getProjectIdError(formData.project_id);

    if (nextProjectIdError) {
      setProjectIdError(nextProjectIdError);
      return;
    }

    const payload = new FormData();
    payload.append("project_id", formData.project_id.trim());
    payload.append("title", formData.title);
    payload.append("summaryTitle", formData.summaryTitle);
    payload.append("projectDescription", formData.projectDescription);
    payload.append("question", formData.question);
    payload.append("answer", formData.answer);
    payload.append("summary", formData.summary);
    payload.append("meta", JSON.stringify(formData.meta));
    payload.append(
      "category",
      JSON.stringify(formData.category.filter(Boolean))
    );
    payload.append(
      "tags",
      JSON.stringify(formData.tags.split(",").map((t) => t.trim()))
    );

    if (newMainImage) {
      payload.append("mainImage", newMainImage);
    }

    // Retain existing images
    payload.append("retainedImages", JSON.stringify(existingImages));
    payload.append("retainedMainImage", existingMainImage);

    // Append new images
    Object.entries(newImages).forEach(([group, files]) => {
      files.forEach((file) => {
        payload.append(group, file);
      });
    });

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/projects/${project_id}`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMessage("✅ Project updated successfully.");
      router.push("/admin");
    } catch (err) {
      alert("Update failed Login again");
      router.push("/admin/login");

      setMessage("❌ Failed to update project.");
    }
  };

  const renderSortableGroup = (group) => (
    <div key={group}>
      <label className="block font-medium mt-6 capitalize">
        {group} Images
      </label>
      <p className="text-sm text-gray-500 mb-2">Drag to reorder.</p>
      <ReactSortable
        list={existingImages[group]}
        setList={(list) =>
          setExistingImages((prev) => ({ ...prev, [group]: list }))
        }
        className="flex flex-wrap gap-4"
      >
        {existingImages[group]?.map((img) => (
          <div key={img} className="relative">
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_URL}${img}`}
              alt=""
              className="w-24 h-24 object-cover rounded"
            />
            <button
              type="button"
              onClick={() => handleRemoveExistingImage(group, img)}
              className="absolute top-1 right-1 bg-red-500 text-white rounded px-2 py-1 text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </ReactSortable>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e) => handleNewImageChange(e, group)}
        className="mt-2 py-1 inline-block w-[200px] rounded-md bg-black text-white"
      />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 bg-[#fefdf8]">
      <h1 className="text-2xl font-bold mb-4">Edit Project</h1>
      {message && <p className="mb-4">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {[
          "project_id",
          "title",
          "summary",
        ].map((name) => (
          <div key={name}>
            <label className="block font-medium mb-1">
              {name === "project_id" ? "Project ID" : name}
            </label>
            <input
              name={name}
              value={formData[name]}
              onChange={handleChange}
              aria-invalid={name === "project_id" && !!projectIdError}
              aria-describedby={
                name === "project_id" ? "project-id-error" : undefined
              }
              className="input"
            />
            {name === "project_id" && projectIdError && (
              <p id="project-id-error" className="mt-1 text-sm text-red-600">
                {projectIdError}
              </p>
            )}
          </div>
        ))}

        {["services", "sector"].map((name) => (
          <div key={name}>
            <label className="block font-medium mb-1">
              Meta: {name === "services" ? "Collaterals" : name}
            </label>
            <input
              name={`meta.${name}`}
              value={formData.meta[name]}
              onChange={handleChange}
              className="input"
            />
          </div>
        ))}

        <div>
          <label className="block font-medium mb-1">Categories</label>
          <CategoryMultiSelect
            categories={categories}
            value={formData.category}
            onChange={handleCategoryChange}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Tags</label>
          <input
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="input"
          />
        </div>

        {["slider1", "slider2", "column1", "column2"].map(renderSortableGroup)}

        {/* Main Image */}
        <div>
          <label className="block font-medium mb-1">Main Image</label>
          {existingMainImage && (
            <div className="mb-2 relative w-32">
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_URL}${existingMainImage}`}
                className="w-32 h-32 object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => setExistingMainImage("")}
                className="absolute top-1 right-1 bg-red-500 text-white rounded px-2 py-1 text-xs"
              >
                ✕
              </button>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setNewMainImage(e.target.files?.[0])}
            className="input"
          />
        </div>

        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Update Project
        </button>
      </form>

      <style jsx>{`
        .input {
          display: block;
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 0.95rem;
        }

        label {
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  );
};

export default withAuth(EditPageComponent);
