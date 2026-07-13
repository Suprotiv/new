"use client";

import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState, useMemo } from "react";
import withAuth from "../components/withAuth";
import { useRouter } from "next/navigation";
import AdminCollectionsSection from "../components/AdminCollectionsSection";

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("projects");
  const router = useRouter();

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/projects`);
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      console.error("Failed to fetch projects:", err);
    }
  };

  const deleteProject = async (project_id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BASE_URL}/projects/${project_id}`
      );
      fetchProjects();
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // Filtered projects based on search query
  const filteredProjects = useMemo(() => {
    return projects.filter((project) =>
      project.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [projects, searchQuery]);

  return (
    <div className="p-20 bg-[#fefdf8] min-h-screen relative z-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <div className="flex gap-2">
          <Link href="/">
            <div className="bg-black text-white px-4 py-2 rounded hover:bg-neutral-800 transition">
              Edit Site Content
            </div>
          </Link>

          <div
            className="bg-red-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-red-700 transition"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("exp");
              router.replace("/admin/login");
            }}
          >
            Signout
          </div>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2 border-b border-black/10">
        {[
          { key: "projects", label: "Projects" },
          { key: "team", label: "Team Members" },
          { key: "categories", label: "Categories" },
          { key: "clients", label: "Clients" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-t px-5 py-3 text-sm font-semibold transition ${
              activeTab === tab.key
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "projects" ? (
        <>
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Link href="/admin/add-projects">
              <div className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                + Add Project
              </div>
            </Link>
          </div>

          {filteredProjects.length === 0 ? (
            <p>No projects found.</p>
          ) : (
            <ul className="space-y-4">
              {filteredProjects.map((project) => (
                <li
                  key={project.project_id}
                  className="border rounded p-4 shadow flex justify-between items-center"
                >
                  <div>
                    <h2 className="text-xl font-semibold">{project.title}</h2>
                    <p className="text-sm text-gray-600">{project.summaryTitle}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/admin/${project.project_id}`}>
                      <div className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                        Edit
                      </div>
                    </Link>
                    <button
                      onClick={() => deleteProject(project.project_id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : null}

      {activeTab === "team" ? <AdminCollectionsSection section="team" /> : null}
      {activeTab === "categories" ? (
        <AdminCollectionsSection section="categories" />
      ) : null}
      {activeTab === "clients" ? (
        <AdminCollectionsSection section="clients" />
      ) : null}
    </div>
  );
};

export default withAuth(ProjectsPage);
