"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
const emptyCategory = { name: "", tags: "" };
const emptyMember = { name: "", position: "", order: "" };
const emptyClient = { name: "", link: "", order: "" };

function authHeaders(extra = {}) {
  return {
    ...extra,
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };
}

export default function AdminCollectionsSection({ section = "categories" }) {
  const [categories, setCategories] = useState([]);
  const [team, setTeam] = useState([]);
  const [clients, setClients] = useState([]);
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [editingCategorySlug, setEditingCategorySlug] = useState("");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [memberForm, setMemberForm] = useState(emptyMember);
  const [memberImage, setMemberImage] = useState(null);
  const [editingMemberId, setEditingMemberId] = useState("");
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [clientForm, setClientForm] = useState(emptyClient);
  const [clientBwImage, setClientBwImage] = useState(null);
  const [clientColorImage, setClientColorImage] = useState(null);
  const [editingClientId, setEditingClientId] = useState("");
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  const fetchCategories = async () => {
    const res = await axios.get(`${baseUrl}/categories`);
    setCategories(Array.isArray(res.data) ? res.data : []);
  };

  const fetchTeam = async () => {
    const res = await axios.get(`${baseUrl}/team`);
    setTeam(Array.isArray(res.data) ? res.data : []);
  };

  const fetchClients = async () => {
    const res = await axios.get(`${baseUrl}/clients`);
    setClients(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    if (!baseUrl) return;
    fetchCategories();
    fetchTeam();
    fetchClients();
  }, []);

  const saveCategory = async (event) => {
    event.preventDefault();
    const payload = {
      name: categoryForm.name,
      tags: categoryForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    };

    try {
      if (editingCategorySlug) {
        await axios.put(`${baseUrl}/categories/${editingCategorySlug}`, payload, {
          headers: authHeaders(),
        });
      } else {
        await axios.post(`${baseUrl}/categories`, payload, {
          headers: authHeaders(),
        });
      }

      setMessage("Category saved.");
      setCategoryForm(emptyCategory);
      setEditingCategorySlug("");
      setCategoryModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error("Failed to save category:", error);
      setMessage(error.response?.data?.error || "Failed to save category.");
    }
  };

  const editCategory = (category) => {
    setEditingCategorySlug(category.slug);
    setCategoryForm({
      name: category.name || "",
      tags: Array.isArray(category.tags) ? category.tags.join(", ") : "",
    });
    setCategoryModalOpen(true);
  };

  const addCategory = () => {
    setEditingCategorySlug("");
    setCategoryForm(emptyCategory);
    setCategoryModalOpen(true);
  };

  const deleteCategory = async (slug) => {
    if (!confirm("Delete this category? It will be removed from projects too.")) return;

    try {
      await axios.delete(`${baseUrl}/categories/${slug}`, {
        headers: authHeaders(),
      });
      setMessage("Category deleted.");
      fetchCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
      setMessage(error.response?.data?.error || "Failed to delete category.");
    }
  };

  const saveMember = async (event) => {
    event.preventDefault();
    const payload = new FormData();
    payload.append("name", memberForm.name);
    payload.append("position", memberForm.position);
    payload.append("order", memberForm.order);

    if (memberImage) {
      payload.append("image", memberImage);
    }

    try {
      if (editingMemberId) {
        await axios.put(`${baseUrl}/team/${editingMemberId}`, payload, {
          headers: authHeaders({ "Content-Type": "multipart/form-data" }),
        });
      } else {
        await axios.post(`${baseUrl}/team`, payload, {
          headers: authHeaders({ "Content-Type": "multipart/form-data" }),
        });
      }

      setMessage("Team member saved.");
      setMemberForm(emptyMember);
      setMemberImage(null);
      setEditingMemberId("");
      setMemberModalOpen(false);
      fetchTeam();
    } catch (error) {
      console.error("Failed to save team member:", error);
      setMessage(error.response?.data?.error || "Failed to save team member.");
    }
  };

  const editMember = (member) => {
    setEditingMemberId(member.id);
    setMemberForm({
      name: member.name || "",
      position: member.position || "",
      order: String(member.order ?? ""),
    });
    setMemberImage(null);
    setMemberModalOpen(true);
  };

  const addMember = () => {
    setEditingMemberId("");
    setMemberForm(emptyMember);
    setMemberImage(null);
    setMemberModalOpen(true);
  };

  const deleteMember = async (id) => {
    if (!confirm("Delete this team member?")) return;

    try {
      await axios.delete(`${baseUrl}/team/${id}`, {
        headers: authHeaders(),
      });
      setMessage("Team member deleted.");
      fetchTeam();
    } catch (error) {
      console.error("Failed to delete team member:", error);
      setMessage(error.response?.data?.error || "Failed to delete team member.");
    }
  };

  const reorderTeam = async (nextTeam) => {
    const currentIds = team.map((member) => member.id).join("|");
    const nextIds = nextTeam.map((member) => member.id).join("|");
    if (currentIds === nextIds) return;

    const orderedTeam = nextTeam.map((member, index) => ({
      ...member,
      order: index,
    }));
    setTeam(orderedTeam);

    try {
      await axios.put(
        `${baseUrl}/team/reorder`,
        { ids: orderedTeam.map((member) => member.id) },
        { headers: authHeaders() }
      );
    } catch (error) {
      console.error("Failed to reorder team members:", error);
      setMessage(error.response?.data?.error || "Failed to reorder team members.");
      fetchTeam();
    }
  };

  const saveClient = async (event) => {
    event.preventDefault();
    const payload = new FormData();
    payload.append("name", clientForm.name);
    payload.append("link", clientForm.link);
    payload.append("order", clientForm.order);

    if (clientBwImage) {
      payload.append("bwImage", clientBwImage);
    }

    if (clientColorImage) {
      payload.append("colorImage", clientColorImage);
    }

    try {
      if (editingClientId) {
        await axios.put(`${baseUrl}/clients/${editingClientId}`, payload, {
          headers: authHeaders({ "Content-Type": "multipart/form-data" }),
        });
      } else {
        await axios.post(`${baseUrl}/clients`, payload, {
          headers: authHeaders({ "Content-Type": "multipart/form-data" }),
        });
      }

      setMessage("Client saved.");
      setClientForm(emptyClient);
      setClientBwImage(null);
      setClientColorImage(null);
      setEditingClientId("");
      setClientModalOpen(false);
      fetchClients();
    } catch (error) {
      console.error("Failed to save client:", error);
      setMessage(error.response?.data?.error || "Failed to save client.");
    }
  };

  const editClient = (client) => {
    setEditingClientId(client.id);
    setClientForm({
      name: client.name || "",
      link: client.link || "",
      order: String(client.order ?? ""),
    });
    setClientBwImage(null);
    setClientColorImage(null);
    setClientModalOpen(true);
  };

  const addClient = () => {
    setEditingClientId("");
    setClientForm(emptyClient);
    setClientBwImage(null);
    setClientColorImage(null);
    setClientModalOpen(true);
  };

  const deleteClient = async (id) => {
    if (!confirm("Delete this client?")) return;

    try {
      await axios.delete(`${baseUrl}/clients/${id}`, {
        headers: authHeaders(),
      });
      setMessage("Client deleted.");
      fetchClients();
    } catch (error) {
      console.error("Failed to delete client:", error);
      setMessage(error.response?.data?.error || "Failed to delete client.");
    }
  };

  const reorderClients = async (nextClients) => {
    const currentIds = clients.map((client) => client.id).join("|");
    const nextIds = nextClients.map((client) => client.id).join("|");
    if (currentIds === nextIds) return;

    const orderedClients = nextClients.map((client, index) => ({
      ...client,
      order: index,
    }));
    setClients(orderedClients);

    try {
      await axios.put(
        `${baseUrl}/clients/reorder`,
        { ids: orderedClients.map((client) => client.id) },
        { headers: authHeaders() }
      );
    } catch (error) {
      console.error("Failed to reorder clients:", error);
      setMessage(error.response?.data?.error || "Failed to reorder clients.");
      fetchClients();
    }
  };

  return (
    <div className="mt-8">
      {message ? (
        <p className="mb-5 rounded border border-black/10 bg-white px-4 py-2 text-sm">
          {message}
        </p>
      ) : null}

      {section === "categories" ? (
      <section className="rounded border border-black/10 bg-white p-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Categories</h2>
          <button
            type="button"
            onClick={addCategory}
            className="rounded bg-black px-4 py-2 text-sm text-white"
          >
            + Add Category
          </button>
        </div>

        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category.slug}
              className="flex items-start justify-between gap-4 rounded border border-black/10 p-3"
            >
              <div>
                <p className="font-medium">{category.name}</p>
                <p className="text-xs text-gray-500">{category.slug}</p>
                <p className="mt-1 text-sm text-gray-600">
                  {(category.tags || []).join(", ")}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => editCategory(category)}
                  className="rounded bg-blue-500 px-3 py-1 text-white"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={category.slug === "all"}
                  onClick={() => deleteCategory(category.slug)}
                  className="rounded bg-red-500 px-3 py-1 text-white disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
      ) : null}

      {section === "team" ? (
      <section className="rounded border border-black/10 bg-white p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Team Members</h2>
            <p className="text-sm text-gray-500">
              Drag rows to reorder. Photos must be 2 MB or smaller.
            </p>
          </div>
          <button
            type="button"
            onClick={addMember}
            className="rounded bg-black px-4 py-2 text-sm text-white"
          >
            + Add Team Member
          </button>
        </div>

        <ReactSortable
          list={team}
          setList={reorderTeam}
          animation={150}
          handle=".drag-handle"
          className="space-y-3"
        >
          {team.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-4 rounded border border-black/10 p-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="drag-handle cursor-grab select-none rounded bg-gray-100 px-2 py-1 text-sm text-gray-500 active:cursor-grabbing"
                  title="Drag to reorder"
                >
                  Drag
                </span>
                {member.image ? (
                  <img
                    src={`${baseUrl}${member.image}`}
                    alt={member.name}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-gray-200" />
                )}
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-gray-600">{member.position}</p>
                  <p className="text-xs text-gray-500">Order: {member.order}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => editMember(member)}
                  className="rounded bg-blue-500 px-3 py-1 text-white"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteMember(member.id)}
                  className="rounded bg-red-500 px-3 py-1 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </ReactSortable>
      </section>
      ) : null}

      {section === "clients" ? (
      <section className="rounded border border-black/10 bg-white p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Clients</h2>
            <p className="text-sm text-gray-500">
              Drag rows to reorder. Upload one black-and-white logo and one colour logo.
            </p>
          </div>
          <button
            type="button"
            onClick={addClient}
            className="rounded bg-black px-4 py-2 text-sm text-white"
          >
            + Add Client
          </button>
        </div>

        <ReactSortable
          list={clients}
          setList={reorderClients}
          animation={150}
          handle=".drag-handle"
          className="space-y-3"
        >
          {clients.map((client) => (
            <div
              key={client.id}
              className="flex items-center justify-between gap-4 rounded border border-black/10 p-3"
            >
              <div className="flex items-center gap-4">
                <span
                  className="drag-handle cursor-grab select-none rounded bg-gray-100 px-2 py-1 text-sm text-gray-500 active:cursor-grabbing"
                  title="Drag to reorder"
                >
                  Drag
                </span>
                <div className="flex items-center gap-2 rounded bg-[#111010] p-2">
                  {client.bwImage ? (
                    <img
                      src={`${baseUrl}${client.bwImage}`}
                      alt={`${client.name} black and white logo`}
                      className="h-10 w-16 object-contain"
                    />
                  ) : (
                    <div className="h-10 w-16 rounded bg-gray-200" />
                  )}
                  {client.colorImage ? (
                    <img
                      src={`${baseUrl}${client.colorImage}`}
                      alt={`${client.name} colour logo`}
                      className="h-10 w-16 object-contain"
                    />
                  ) : (
                    <div className="h-10 w-16 rounded bg-gray-200" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{client.name}</p>
                  <p className="text-sm text-gray-600">
                    {client.link || "Search link"}
                  </p>
                  <p className="text-xs text-gray-500">Order: {client.order}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => editClient(client)}
                  className="rounded bg-blue-500 px-3 py-1 text-white"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => deleteClient(client.id)}
                  className="rounded bg-red-500 px-3 py-1 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </ReactSortable>
      </section>
      ) : null}

      {categoryModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold">
                {editingCategorySlug ? "Edit Category" : "Add Category"}
              </h3>
              <button
                type="button"
                onClick={() => setCategoryModalOpen(false)}
                className="rounded px-2 py-1 text-xl leading-none hover:bg-gray-100"
                aria-label="Close category form"
              >
                ×
              </button>
            </div>
            <form onSubmit={saveCategory} className="grid gap-3">
              <input
                value={categoryForm.name}
                onChange={(event) =>
                  setCategoryForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Category name"
                required
                className="rounded border px-3 py-2"
              />
              <input
                value={categoryForm.tags}
                onChange={(event) =>
                  setCategoryForm((prev) => ({ ...prev, tags: event.target.value }))
                }
                placeholder="Tags, comma separated"
                className="rounded border px-3 py-2"
              />
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="rounded border px-4 py-2"
                >
                  Cancel
                </button>
                <button className="rounded bg-black px-4 py-2 text-white">
                  {editingCategorySlug ? "Update Category" : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {memberModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">
                  {editingMemberId ? "Edit Team Member" : "Add Team Member"}
                </h3>
                <p className="text-sm text-gray-500">Photos must be 2 MB or smaller.</p>
              </div>
              <button
                type="button"
                onClick={() => setMemberModalOpen(false)}
                className="rounded px-2 py-1 text-xl leading-none hover:bg-gray-100"
                aria-label="Close team member form"
              >
                ×
              </button>
            </div>
            <form onSubmit={saveMember} className="grid gap-3">
              <input
                value={memberForm.name}
                onChange={(event) =>
                  setMemberForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Name"
                required
                className="rounded border px-3 py-2"
              />
              <input
                value={memberForm.position}
                onChange={(event) =>
                  setMemberForm((prev) => ({ ...prev, position: event.target.value }))
                }
                placeholder="Position"
                required
                className="rounded border px-3 py-2"
              />
              <input
                value={memberForm.order}
                onChange={(event) =>
                  setMemberForm((prev) => ({ ...prev, order: event.target.value }))
                }
                placeholder="Display order"
                type="number"
                className="rounded border px-3 py-2"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setMemberImage(event.target.files?.[0] || null)}
                className="rounded border px-3 py-2"
              />
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMemberModalOpen(false)}
                  className="rounded border px-4 py-2"
                >
                  Cancel
                </button>
                <button className="rounded bg-black px-4 py-2 text-white">
                  {editingMemberId ? "Update Member" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {clientModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">
                  {editingClientId ? "Edit Client" : "Add Client"}
                </h3>
                <p className="text-sm text-gray-500">
                  Add both black-and-white and colour logo versions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setClientModalOpen(false)}
                className="rounded px-2 py-1 text-xl leading-none hover:bg-gray-100"
                aria-label="Close client form"
              >
                ×
              </button>
            </div>
            <form onSubmit={saveClient} className="grid gap-3">
              <input
                value={clientForm.name}
                onChange={(event) =>
                  setClientForm((prev) => ({ ...prev, name: event.target.value }))
                }
                placeholder="Client name"
                required
                className="rounded border px-3 py-2"
              />
              <input
                value={clientForm.link}
                onChange={(event) =>
                  setClientForm((prev) => ({ ...prev, link: event.target.value }))
                }
                placeholder="Optional link, e.g. /idlygo"
                className="rounded border px-3 py-2"
              />
              <input
                value={clientForm.order}
                onChange={(event) =>
                  setClientForm((prev) => ({ ...prev, order: event.target.value }))
                }
                placeholder="Display order"
                type="number"
                className="rounded border px-3 py-2"
              />
              <label className="grid gap-1 text-sm font-medium">
                Black-and-white image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setClientBwImage(event.target.files?.[0] || null)
                  }
                  className="rounded border px-3 py-2 font-normal"
                />
              </label>
              <label className="grid gap-1 text-sm font-medium">
                Colour image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setClientColorImage(event.target.files?.[0] || null)
                  }
                  className="rounded border px-3 py-2 font-normal"
                />
              </label>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setClientModalOpen(false)}
                  className="rounded border px-4 py-2"
                >
                  Cancel
                </button>
                <button className="rounded bg-black px-4 py-2 text-white">
                  {editingClientId ? "Update Client" : "Add Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
