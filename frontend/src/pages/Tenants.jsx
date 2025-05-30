import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaSearch, FaFilter } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import { useRooms } from "../context/RoomContext";
import TenantCard from "../components/TenantCard";

const Tenants = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { fetchRooms } = useRooms(); // Get fetchRooms from RoomContext

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const res = await axios.get("/tenants");
        if (res.data.success) {
          setTenants(res.data.data);
        } else {
          setTenants([]);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching tenants:", err);
        toast.error("Failed to fetch tenants");
        setTenants([]);
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this tenant?")) {
      try {
        const res = await axios.delete(`/tenants/${id}`);
        if (res.data.success) {
          setTenants(tenants.filter((tenant) => tenant._id !== id));
          toast.success("Tenant deleted successfully");

          // Refresh rooms data to update occupiedBeds count
          fetchRooms();
        } else {
          toast.error(res.data.error || "Failed to delete tenant");
        }
      } catch (err) {
        console.error("Error deleting tenant:", err);
        toast.error(err.response?.data?.error || "Failed to delete tenant");
      }
    }
  };

  // Filter and search tenants
  const filteredTenants = tenants.filter((tenant) => {
    // Search by name, phone, or email
    const matchesSearch =
      searchTerm === "" ||
      tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tenant.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tenant.email &&
        tenant.email.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filter by status
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && tenant.active) ||
      (filterStatus === "inactive" && !tenant.active);

    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-gray-600">Loading tenants...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Tenants</h1>
        <Link to="/tenants/add" className="btn btn-primary flex items-center">
          <FaPlus className="mr-2" /> Add Tenant
        </Link>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, phone or email..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        <div className="flex space-x-2">
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Status:</span>
          </div>

          <select
            className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Tenants</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Tenant Cards Grid */}
      <div className="tenant-cards-container">
        {filteredTenants.map((tenant) => (
          <TenantCard
            key={tenant._id}
            tenant={tenant}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Show message when no tenants match filters */}
      {filteredTenants.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-md p-8 text-center mt-6">
          <p className="text-gray-600">
            {tenants.length === 0
              ? "No tenants found. Add your first tenant to get started."
              : "No tenants match your search criteria. Try adjusting your filters."}
          </p>
          {tenants.length === 0 && (
            <Link
              to="/tenants/add"
              className="btn btn-primary inline-flex items-center mt-4"
            >
              <FaPlus className="mr-2" /> Add Your First Tenant
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Tenants;
