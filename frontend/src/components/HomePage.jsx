import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate, Link } from "react-router-dom";
import secureIcon from '../images/secure.png';
import { 
  RiLockLine, 
  RiCheckLine, 
  RiDeleteBin6Line, 
} from "react-icons/ri";
import axios from 'axios';
import { Button } from './Button';

const HomePage = () => {
  const [files, setFiles] = useState([]);
  const [sortedFiles, setSortedFiles] = useState([]);
  const [fileId, setFileId] = useState(null);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteFileId, setDeleteFileId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/api/files")
      .then((response) => {
        setFiles(response.data);
        setSortedFiles(response.data);
      })
      .catch((error) => {
        console.error("Error fetching files:", error);
        navigate("/login");
      });
  }, [navigate]);

  useEffect(() => {
    const fetchSharedFiles = async () => {
      try {
        const response = await api.get("/api/shared-files");
        setSharedFiles(response.data);
      } catch (error) {
        console.error("Error fetching shared files:", error);
      }
    };
    fetchSharedFiles();
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await api.get("/api/current-user");
        setCurrentUser(response.data);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    fetchCurrentUser();
  }, []);

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const response = await api.get("/api/logout");
      if (response.data === "Logged out") {
        navigate("/login");
      } else {
        console.log(response.data);
      }
    } catch (error) {
      console.error(error.response?.data || "Logout failed");
    }
  };

  const handleDeleteFileConfirmation = (fileId) => {
    setDeleteFileId(fileId);
    setShowDeletePopup(true); 
  };

  const deleteFile = async (fileId) => {
    try {
      await api.delete(`/api/files/${fileId}`);
      setFiles(files.filter(file => file._id !== fileId));
      setSortedFiles(sortedFiles.filter(file => file._id !== fileId));
      setShowDeletePopup(false);
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get("/api/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleShareFile = async () => {
    if (!selectedUser) {
      alert("Please select a user to share with.");
      return;
    }
    try {
      const response = await api.post(
        "/api/shareFile", 
        { fileId, email: selectedUser, senderEmail: currentUser?.email }, 
      );
      if (response.data.success) {
        alert("File shared successfully!");
        setShowSharePopup(false);
      } else {
        alert("Failed to share file. Try again.");
      }
    } catch (error) {
      console.error("Error sharing file:", error);
      alert("Error occurred while sharing the file.");
    }
  };

  return (
    <main className="w-full min-h-screen bg-neutral-950 text-white font-sans antialiased overflow-y-auto">
      {/* Dashboard App Header */}
      <nav className="sticky top-0 bg-neutral-950/80 backdrop-blur border-b border-white/10 z-40 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img src={secureIcon} alt="icon" className="h-7 w-7 opacity-90" />
          <h3 className="text-xl font-medium tracking-tight">Secure-NoteBook</h3>
        </div>
        <div className="flex gap-6 items-center">
          <Link className="text-sm font-medium text-white/50 hover:text-white transition-colors duration-300 hidden sm:block" to="/Home">
            Dashboard
          </Link>
          <Link className="text-sm font-medium text-white/50 hover:text-white transition-colors duration-300 hidden sm:block" to="/create">
            Create Note
          </Link>
          <Button variant="secondary" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </nav>

      <div className="container max-w-6xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="mb-12 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-4xl lg:text-5xl font-medium">Dashboard</h1>
          <Button variant="primary" onClick={() => navigate('/create')}>
            + New Note
          </Button>
        </div>

        {/* Shared Files Content */}
        <div className="bg-neutral-900/50 backdrop-blur border border-white/10 rounded-3xl p-6 md:p-8 mb-16 shadow-2xl">
          <h2 className="text-2xl font-medium mb-6 flex items-center gap-2">
            <span className="bg-lime-400 size-3 rounded-full inline-block"></span>
            Shared Files
          </h2>
          
          {sharedFiles.length === 0 ? (
            <p className="text-white/30 text-center py-8 px-4 rounded-2xl border border-white/5 border-dashed">
              No securely shared files available.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <ul className="divide-y divide-white/10">
                {sharedFiles.map((file) => {
                  const remainingTime = (expiry) => {
                    const diff = new Date(expiry) - new Date();
                    if (diff <= 0) return "Expired";
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

                    if (hours > 0) return `${hours}h ${minutes}m`;
                    if (minutes > 0) return `${minutes}m ${seconds}s`;
                    return `${seconds}s`;
                  };

                  return (
                    <li
                      key={file._id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-colors duration-300 group gap-4"
                    >
                      <div className="flex items-center space-x-4 flex-grow">
                        <span className="text-lg font-medium">
                          {file.fileName}
                        </span>
                        <span className="text-white/50 text-sm">
                          Sent by: <span className="text-lime-400">{file.email}</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 flex-none w-full sm:w-auto">
                        {file.expiry && (
                          <span className="text-amber-400 text-xs px-3 py-1 bg-amber-400/10 rounded-full border border-amber-400/20">
                            {remainingTime(file.expiry)} left
                          </span>
                        )}
                        <button
                          onClick={() => navigate(`/sharedView/${file._id}`)}
                          className="text-white/70 hover:text-white hover:underline transition-colors duration-300 text-sm font-medium"
                        >
                          View Secret
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* Owned Files grid */}
        <h2 className="text-2xl font-medium mb-6">Your Notes Vault</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedFiles.length > 0 ? (
            sortedFiles.map((file) => (
              <div 
                key={file._id} 
                className="bg-neutral-900 border border-white/10 p-6 rounded-3xl hover:border-lime-400 hover:scale-[1.02] transition-all duration-500 relative group overflow-hidden shadow-xl"
              >
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0 text-white/50 hover:text-red-400">
                  <button onClick={() => handleDeleteFileConfirmation(file._id)}>
                    <RiDeleteBin6Line className="text-xl" />
                  </button>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${file.encrypted ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-lime-400/20 text-lime-400 border border-lime-400/30"}`}>
                    {file.encrypted ? (
                      <><RiLockLine className="mr-1.5" /> Encrypted</>
                    ) : (
                      <><RiCheckLine className="mr-1.5" /> Available</>
                    )}
                  </span>
                  <span className="text-white/30 text-xs">{file.createdAt?.substring(0,10)}</span>
                </div>
                <h3 className="text-xl font-medium mb-8 truncate">{file.fileName}</h3>
                
                <div className="flex justify-between items-center border-t border-white/10 pt-4 mt-auto">
                  <button
                    onClick={() => navigate(`/view/${file._id}`)}
                    className="text-sm font-medium text-white/50 hover:text-white transition-colors"
                  >
                    View contents
                  </button>
                  {file.shareable && (
                    <button
                      onClick={() => {
                        setFileId(file._id);
                        fetchUsers();
                        setShowSharePopup(true);
                      }}
                      className="text-sm font-medium text-lime-400 hover:text-lime-300 transition-colors"
                    >
                      Share access
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full border border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center gap-4 text-white/30">
              <span className="text-4xl text-white/10">🗂️</span>
              <h3 className="text-lg">Your vault is empty.</h3>
              <p className="text-sm">Create an encrypted file to get started.</p>
            </div>
          )}
        </div>
      </div>

      {showSharePopup && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur z-50 flex justify-center items-center p-4">
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-2xl font-medium mb-6">Share Securely</h2>
            <select
              className="w-full p-3 bg-transparent border border-white/15 rounded-xl mb-6 outline-none focus:border-lime-400 text-white [&>option]:text-black"
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Select a user...</option>
              {users
                .filter((user) => user._id !== currentUser?._id)
                .map((user) => (
                  <option key={user._id} value={user.email}>
                    {user.email}
                  </option>
                ))}
            </select>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowSharePopup(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleShareFile}>
                Share
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDeletePopup && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur z-50 flex justify-center items-center p-4">
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-xl font-medium mb-6 text-center">Delete this note?</h2>
            <p className="text-white/50 text-center text-sm mb-8">This action is permanent and cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <Button variant="secondary" onClick={() => setShowDeletePopup(false)}>
                Cancel
              </Button>
              <Button variant="primary" className="!bg-red-500 !border-red-500 !text-white hover:!bg-red-600" onClick={() => deleteFile(deleteFileId)}>
                Delete Permanently
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default HomePage;