"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import withAuth from "../../components/withAuth";
import CategoryMultiSelect from "../../components/CategoryMultiSelect";

const getProjectIdError = (value: string) => {
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

const AddProject = () => {
  const [formData, setFormData] = useState({
    project_id: "",
    title: "",
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
    category: [] as string[],
    tags: "",
  });

  const [slider1Images, setSlider1Images] = useState<File[]>([]);
  const [slider2Images, setSlider2Images] = useState<File[]>([]);
  const [column1Images, setColumn1Images] = useState<File[]>([]);
  const [column2Images, setColumn2Images] = useState<File[]>([]);
  const [mainImage, setMainImage] = useState<File | null>(null);

  const [message, setMessage] = useState("");
  const [projectIdError, setProjectIdError] = useState("");
  const [categories, setCategories] = useState<
    { name: string; slug: string }[]
  >([]);
  const router = useRouter();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/categories`
        );
        setCategories(
          (res.data || []).filter((category: { slug?: string }) => {
            return category.slug !== "all";
          })
        );
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "project_id") {
      setProjectIdError("");
    }

    if (name.startsWith("meta.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        meta: {
          ...prev.meta,
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCategoryChange = (selectedCategories: string[]) => {
    setFormData((prev) => ({
      ...prev,
      category: selectedCategories,
    }));
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File[]>>
  ) => {
    if (e.target.files) {
      setter(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: any) => {
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
      JSON.stringify(
        formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      )
    );

    if (mainImage) {
      payload.append("mainImage", mainImage);
    }

    slider1Images.forEach((file) => payload.append("slider1", file));
    slider2Images.forEach((file) => payload.append("slider2", file));
    column1Images.forEach((file) => payload.append("column1", file));
    column2Images.forEach((file) => payload.append("column2", file));

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/projects`,
        payload,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setMessage("✅ Project added successfully!");
      setFormData({
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

      setSlider1Images([]);
      setSlider2Images([]);
      setColumn1Images([]);
      setColumn2Images([]);
      setMainImage(null);

      router.push("/admin");
    } catch (error) {
      alert("Creation failed Login again");
      router.push("/admin/login");
      setMessage("❌ Failed to add project");
      console.error(error);
    }
  };

  return (
    <div className="bg-[#fefdf8] relative z-10">
      <div className="max-w-xl mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Add New Project</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {[
            { name: "project_id", label: "Project ID", required: true },
            { name: "title", label: "Title" },
            { name: "summary", label: "Summary" },
          ].map(({ name, label, required }) => (
            <div key={name}>
              <label className="block font-medium mb-1">{label}</label>
              <input
                name={name}
                placeholder={label}
                value={(formData as any)[name]}
                onChange={handleChange}
                required={required}
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

          {[
            { name: "services", label: "Meta: Collaterals" },
            { name: "sector", label: "Meta: Sector" },
          ].map(({ name, label }) => (
            <div key={name}>
              <label className="block font-medium mb-1">{label}</label>
              <input
                name={`meta.${name}`}
                placeholder={label}
                value={(formData.meta as any)[name]}
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
            <label className="block font-medium mb-1">
              Tags (comma-separated)
            </label>
            <input
              name="tags"
              placeholder="strategy, tech, design"
              onChange={handleChange}
              value={formData.tags}
              className="input"
            />
          </div>

          {/* 🔽 File Uploads */}
          <div>
            <label className="block font-medium mb-1">Slider 1 Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageChange(e, setSlider1Images)}
              className="input"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Slider 2 Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageChange(e, setSlider2Images)}
              className="input"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Column 1 Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageChange(e, setColumn1Images)}
              className="input"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Column 2 Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageChange(e, setColumn2Images)}
              className="input"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Main Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setMainImage(e.target.files?.[0] || null)}
              className="input"
            />
          </div>

          <button
            type="submit"
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Submit
          </button>

          {message && (
            <p className="mt-4 font-medium text-center text-green-700">
              {message}
            </p>
          )}
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
    </div>
  );
};

export default withAuth(AddProject);
