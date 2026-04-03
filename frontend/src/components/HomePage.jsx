import React, { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate, Link } from "react-router-dom";
import secureIcon from '../images/secure.png';
import { 
  RiLockLine, 
  RiCheckLine, 
  RiDeleteBin6Line,
  RiEditLine,
  RiSettings3Line,
  RiUser3Line,
  RiQuestionLine,
  RiLogoutBoxRLine,
  RiImageAddLine,
  RiUploadCloud2Line
} from "react-icons/ri";
import axios from 'axios';
import { Button } from './Button';
import { decryptText } from "../utils/crypto";

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
  
  const [showPasscodePopup, setShowPasscodePopup] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState("");
  const [selectedEncryptedFile, setSelectedEncryptedFile] = useState(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  
  // Profile Reference States
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAddProfileModal, setShowAddProfileModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [isKidsProfile, setIsKidsProfile] = useState(false);

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

  const handleViewNote = (file) => {
    if (file.encrypted) {
      setSelectedEncryptedFile(file);
      setPasscode("");
      setPasscodeError("");
      setShowPasscodePopup(true);
    } else {
      navigate(`/view/${file._id}`);
    }
  };

  const submitPasscode = async () => {
    if (!passcode) {
      setPasscodeError("Passcode is required");
      return;
    }
    setIsDecrypting(true);
    setPasscodeError("");
    try {
      const response = await api.get(`/api/files/${selectedEncryptedFile._id}`);
      const fileData = response.data;
      try {
        const plaintext = await decryptText(fileData.content, fileData.iv, fileData.salt, passcode);
        setShowPasscodePopup(false);
        navigate(`/view/${selectedEncryptedFile._id}`, { state: { decryptedContent: plaintext } });
      } catch (err) {
        setPasscodeError("Invalid passcode or corrupted data.");
      }
    } catch (error) {
      console.error("Error fetching file for decryption:", error);
      setPasscodeError("Unable to fetch file data.");
    } finally {
      setIsDecrypting(false);
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
        <div className="flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium text-white/50 hover:text-white transition-colors duration-300 hidden sm:block" to="/Home">
            Dashboard
          </Link>
          <Link className="text-sm font-medium text-white/50 hover:text-white transition-colors duration-300 hidden sm:block" to="/create">
            Create Note
          </Link>
          
          {/* Profile Dropdown Anchor */}
          <div className="relative ml-2">
            <button 
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center justify-center size-9 rounded-full overflow-hidden border-2 border-transparent hover:border-lime-400 transition-colors focus:outline-none focus:border-lime-400 shrink-0"
            >
              <img 
                src={`https://ui-avatars.com/api/?name=${currentUser?.name || currentUser?.email || 'U'}&background=262626&color=a3e635&font-size=0.4`} 
                alt="User Avatar" 
                className="w-full h-full object-cover"
              />
            </button>

            {/* Dropdown Menu Overlay */}
            {showProfileMenu && (
              <>
                {/* Invisible backdrop to dismiss menu */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute right-0 mt-3 w-64 bg-[#1e1e1e] shadow-2xl z-50 border border-white/10 select-none overflow-hidden" style={{ borderRadius: '8px' }}>
                  {/* Header profile info */}
                  <div className="flex items-center gap-3 p-4 border-b border-white/5">
                    <div className="size-12 rounded-full overflow-hidden shrink-0 filter grayscale">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${currentUser?.name || currentUser?.email || 'U'}&background=333333&color=ffffff&font-size=0.4`} 
                        alt="User" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col truncate overflow-hidden">
                      <span className="font-medium text-white text-[15px]">{currentUser?.name || 'Tammy Park'}</span>
                      <span className="text-sm text-white/40 truncate">{currentUser?.email || '@tamp'}</span>
                    </div>
                  </div>

                  <div className="p-4">
                    <button 
                      onClick={() => {
                        setShowProfileMenu(false);
                        setShowAddProfileModal(true);
                      }}
                      className="w-full bg-[#a3e635] hover:bg-[#8fd323] text-black font-medium py-2.5 rounded transition-colors flex items-center justify-center gap-2 mb-2"
                    >
                      <span className="text-xl leading-none -mt-1">+</span> Add profile
                    </button>
                  </div>

                  <div className="flex flex-col pb-2">
                    <button className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors text-white w-full text-left font-medium">
                      <RiEditLine className="text-xl shrink-0 opacity-80" /> Edit profiles
                    </button>
                    <button className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors text-white w-full text-left font-medium">
                      <RiSettings3Line className="text-xl shrink-0 opacity-80" /> App settings
                    </button>
                    <button className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors text-white w-full text-left font-medium">
                      <RiUser3Line className="text-xl shrink-0 opacity-80" /> Account
                    </button>
                    <button className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors text-white w-full text-left font-medium">
                      <RiQuestionLine className="text-xl shrink-0 opacity-80" /> Help
                    </button>
                    <div className="h-px bg-white/5 my-1 mx-4"></div>
                    <button 
                      onClick={(e) => {
                        setShowProfileMenu(false);
                        handleLogout(e);
                      }}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-white/5 transition-colors text-white w-full text-left font-medium"
                    >
                      <RiLogoutBoxRLine className="text-xl shrink-0 opacity-80" /> Log out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

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
                    onClick={() => handleViewNote(file)}
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

      {showPasscodePopup && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur z-50 flex justify-center items-center p-4">
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-2xl font-medium mb-2">Encrypted Vault</h2>
            <p className="text-white/50 mb-6 text-sm">Enter the passcode to unlock this note.</p>
            <input
              type="password"
              className="w-full p-3 bg-transparent border border-white/15 rounded-xl mb-2 outline-none focus:border-lime-400 text-white placeholder-white/30"
              placeholder="Enter passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              onKeyDown={(e) => { if(e.key === 'Enter') submitPasscode(); }}
            />
            {passcodeError && <p className="text-red-500 text-sm mb-4">{passcodeError}</p>}
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => setShowPasscodePopup(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={submitPasscode}>
                {isDecrypting ? "Unlocking..." : "Unlock"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Profile Modal */}
      {showAddProfileModal && (
        <div className="fixed inset-0 bg-neutral-950/90 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div 
            className="bg-[#1e1e1e] p-8 md:p-10 max-w-[432px] w-full shadow-2xl relative" 
            style={{ borderRadius: '8px' }}
          >
            <button 
              onClick={() => setShowAddProfileModal(false)}
              className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors"
            >
              ✕
            </button>
            
            <h2 className="text-[28px] font-semibold mb-8 text-white tracking-tight">Add profile</h2>

            <div className="flex gap-4 mb-8 items-center">
              <div className="size-[84px] rounded-full bg-[#2a2a2a] flex items-center justify-center shrink-0 border border-transparent hover:border-white/10 transition-colors cursor-pointer">
                <RiImageAddLine className="text-4xl text-white/50" />
              </div>
              <button className="bg-[#2a2a2a] hover:bg-[#333] text-white/90 text-sm py-3.5 px-6 rounded transition-colors flex items-center gap-2 border border-transparent flex-grow justify-center font-medium shadow-sm" type="button">
                <RiUploadCloud2Line className="text-lg opacity-80" /> Upload image
              </button>
            </div>

            <div className="mb-8">
              <input
                type="text"
                placeholder="Profile name"
                className="w-full bg-transparent border border-[#444] hover:border-[#666] focus:border-[#a3e635] text-white p-4 rounded text-base outline-none transition-all placeholder:text-white/40"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-4 mb-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={isKidsProfile}
                  onChange={() => setIsKidsProfile(!isKidsProfile)}
                />
                <div className="w-[42px] h-[24px] bg-[#333] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-[18px] peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#666] peer-checked:after:bg-black peer-checked:bg-[#a3e635] after:border-transparent after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
              <span className="text-base text-white font-medium">Kid's profile</span>
            </div>

            <p className="text-white/50 text-[15px] leading-relaxed mb-10 pr-2">
              A profile with curated content and features, and a simplified user interface.
            </p>

            <button 
              onClick={() => {
                setShowAddProfileModal(false);
                setNewProfileName("");
                setIsKidsProfile(false);
              }}
              className="w-full bg-[#a3e635] hover:bg-[#8fd323] text-black font-semibold py-4 rounded text-lg transition-colors shadow-lg"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {showSharePopup && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur z-50 flex justify-center items-center p-4">
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-2xl font-medium mb-6">Share Access</h2>
            <select
              className="w-full p-3 bg-neutral-950 border border-white/10 rounded-xl mb-6 outline-none focus:border-lime-400"
              value={selectedUser || ""}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">Select an investigator</option>
              {users.map((user) => (
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
                Share Note
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDeletePopup && (
        <div className="fixed inset-0 bg-neutral-950/80 backdrop-blur z-50 flex justify-center items-center p-4">
          <div className="bg-neutral-900 border border-red-500/20 rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <h2 className="text-2xl font-medium mb-4 text-red-400">Destroy Note?</h2>
            <p className="text-white/50 mb-8 text-sm">This action perfectly obliterates the record from our cluster. Are you sure you wish to proceed?</p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowDeletePopup(false)}>
                Retain
              </Button>
              <button 
                onClick={() => deleteFile(deleteFileId)}
                className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300 text-sm font-medium"
              >
                Destroy
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default HomePage;