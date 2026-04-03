import React, { useState } from 'react';
import { Link } from "react-router-dom";
import api from '../utils/api';
import { useNavigate } from "react-router-dom";
import { encryptText } from '../utils/crypto';
import secureIcon from '../images/secure.png';
import { Button } from './Button';

const Create = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  const [encryption, setEncryption] = useState(false);
  const [shareable, setShareable] = useState(false);
  const [passcode, setPasscode] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      setMessage("Title and Content are required.");
      return;
    }

    let finalContent = content;
    let finalIv, finalSalt;

    if (encryption) {
      if (!passcode) {
        setMessage("Passcode is required for encrypted notes.");
        return;
      }
      try {
        const encryptedParams = await encryptText(content, passcode);
        finalContent = encryptedParams.ciphertext;
        finalIv = encryptedParams.iv;
        finalSalt = encryptedParams.salt;
      } catch (err) {
        console.error("Encryption failed:", err);
        setMessage("Failed to encrypt note.");
        return;
      }
    }

    const fileData = {
      fileName: title,
      content: finalContent,
      encryption,
      shareable,
      iv: finalIv,
      salt: finalSalt
    };

    try {
      const response = await api.post("/api/upload", fileData);
      const { fileId, message } = response.data;
      
      if (fileId) {
        console.log("File uploaded with ID:", fileId);
      }

      setMessage(message || "Uploaded Successfully");
      navigate("/Home");
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      setMessage("An error occurred while uploading the file.");
    }
  };

  return (
    <main className="w-full min-h-screen font-body antialiased overflow-y-auto">
      {/* App Header */}
      <nav className="sticky top-0 bg-[#131313]/70 backdrop-blur border-b border-white/10 z-40 px-6 py-4 flex justify-between items-center">
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
          <Button variant="secondary" size="sm" onClick={() => navigate('/Home')}>
            Cancel
          </Button>
        </div>
      </nav>

      <div className="container max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl lg:text-5xl font-medium mb-12">Create Vault Note</h1>
        
        <div className="bg-neutral-900 border border-white/10 p-8 md:p-10 rounded-3xl shadow-2xl">
          <form onSubmit={handleSubmit}>
            <input
              name="title"
              className="bg-transparent border border-white/15 rounded-xl px-5 py-4 w-full outline-none focus:border-lime-400 transition-colors placeholder-white/30 text-xl font-medium mb-6"
              placeholder="Give an epic title..."
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            
            <textarea
              name="content"
              className="bg-transparent border border-white/15 rounded-xl px-5 py-4 w-full outline-none focus:border-lime-400 transition-colors placeholder-white/30 text-lg min-h-[300px] resize-y mb-8"
              placeholder="Start jotting down your sensitive information..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            ></textarea>

            <div className="bg-neutral-950/50 rounded-2xl border border-white/5 p-6 mb-8">
              <h4 className="text-lg font-medium mb-4">Security Settings</h4>
              <div className="flex flex-col sm:flex-row gap-8">
                {/* Encryption Checkbox */}
                <label className="flex items-center cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={encryption}
                      onChange={() => setEncryption(!encryption)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${encryption ? "bg-lime-400 border-lime-400" : "bg-transparent border-white/20 group-hover:border-white/50"}`}>
                      {encryption && (
                        <svg className="w-4 h-4 text-neutral-950 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="ml-3 font-medium text-white/80 group-hover:text-white transition-colors">E2E Encryption</span>
                </label>

                {/* Shareable Checkbox */}
                <label className="flex items-center cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={shareable}
                      onChange={() => setShareable(!shareable)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${shareable ? "bg-lime-400 border-lime-400" : "bg-transparent border-white/20 group-hover:border-white/50"}`}>
                      {shareable && (
                        <svg className="w-4 h-4 text-neutral-950 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="ml-3 font-medium text-white/80 group-hover:text-white transition-colors">Shareable</span>
                </label>
              </div>

              {/* Passcode Input Area */}
              <div className={`mt-6 transition-all duration-300 overflow-hidden ${encryption ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <label className="block text-sm font-medium text-white/50 mb-2 pl-2">Passcode required to unlock</label>
                <input
                  type="password"
                  className="bg-transparent border border-white/15 rounded-xl px-4 py-3 w-full outline-none focus:border-red-400 transition-colors placeholder-white/30"
                  placeholder="Set your secure passcode..."
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full flex justify-center !py-4 text-lg">
              Create Secure Note
            </Button>
            
            {message && (
              <p className="text-red-400 text-center mt-6 font-medium bg-red-400/10 py-3 rounded-lg border border-red-400/20">{message}</p>
            )}
          </form>
        </div>
      </div>
    </main>
  );
};

export default Create;
