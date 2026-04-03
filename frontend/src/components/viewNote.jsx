import React, { useEffect, useState } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { decryptText } from "../utils/crypto";
import api from "../utils/api";
import secureIcon from '../images/secure.png';
import { Button } from './Button';

const ViewNote = () => {
  const { fileId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [decryptedContent, setDecryptedContent] = useState("");
  const [cryptoError, setCryptoError] = useState("");

  const preDecryptedContent = location.state?.decryptedContent;

  useEffect(() => {
    const fetchFileData = async () => {
      try {
        const response = await api.get(`/api/files/${fileId}`);
        const data = response.data;
        setFileData(data);
        if (data.encryption) {
          if (preDecryptedContent) {
            setDecryptedContent(preDecryptedContent);
            setIsEncrypted(false);
          } else {
            setIsEncrypted(true);
          }
        } else {
          setDecryptedContent(data.content);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching file:", error);
        setLoading(false);
      }
    };

    fetchFileData();
  }, [fileId, preDecryptedContent]);

  const handleDecrypt = async () => {
    try {
      setCryptoError("");
      const plaintext = await decryptText(fileData.content, fileData.iv, fileData.salt, passcode);
      setDecryptedContent(plaintext);
      setIsEncrypted(false);
    } catch (err) {
      setCryptoError("Invalid passcode or corrupted data.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950">
        <div className="text-xl font-medium text-white/50 animate-pulse">Decrypting content...</div>
      </div>
    );
  }

  if (!fileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 space-y-4">
        <div className="text-2xl font-medium text-white/50">
          File not found or access denied.
        </div>
        <Button variant="secondary" onClick={() => navigate('/Home')}>Back to Dashboard</Button>
      </div>
    );
  }

  if (isEncrypted) {
    return (
      <main className="w-full min-h-screen bg-neutral-950 text-white font-sans antialiased overflow-y-auto flex items-center justify-center p-4">
        <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
          <button onClick={() => navigate('/Home')} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors">
            ✕
          </button>
          <h2 className="text-2xl font-medium mb-2 text-center mt-2">Encrypted Note</h2>
          <p className="text-white/50 mb-8 text-sm text-center">E2E Protected. Enter the passcode to unlock.</p>
          <input 
            type="password" 
            placeholder="Enter secure passcode"
            className="w-full p-3 bg-transparent border border-white/15 rounded-xl mb-4 outline-none focus:border-lime-400 text-white placeholder-white/30"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter') handleDecrypt(); }}
          />
          {cryptoError && <p className="text-red-500 text-sm mb-4 text-center">{cryptoError}</p>}
          <Button variant="primary" className="w-full justify-center" onClick={handleDecrypt}>
            Unlock Content
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="w-full min-h-screen bg-neutral-950 text-white font-sans antialiased overflow-y-auto">
      {/* App Header */}
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
          <Button variant="secondary" size="sm" onClick={() => navigate('/Home')}>
            Close
          </Button>
        </div>
      </nav>

      {/* Note Content Base */}
      <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="bg-neutral-900 border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl">
          
          {/* Note Title & Meta */}
          <div className="border-b border-white/10 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-medium">
                {fileData.fileName}
              </h1>
              <h4 className="text-white/30 text-sm mt-3">
                Created on {new Date(fileData.createdAt).toLocaleDateString()}
              </h4>
            </div>
            {preDecryptedContent && (
              <span className="bg-lime-400/10 text-lime-400 border border-lime-400/20 px-3 py-1 rounded-full text-xs font-medium">
                Decrypted via Dashboard
              </span>
            )}
          </div>

          {/* Actual File Content */}
          <div className="bg-neutral-950/50 rounded-2xl border border-white/5 p-6 md:p-8 min-h-[300px]">
            <p className="text-white/90 leading-relaxed whitespace-pre-wrap font-sans text-lg">
              {decryptedContent}
            </p>
          </div>

          {/* Action Footer Button Group */}
          <div className="flex justify-between items-center pt-8 mt-4">
            <Button variant="secondary" onClick={() => navigate('/Home')}>
              Back to list
            </Button>
            <Button variant="primary" onClick={() => navigate(`/edit/${fileId}`)}>
              Edit Note
            </Button>
          </div>
          
        </div>
      </div>
    </main>
  );
};

export default ViewNote;
