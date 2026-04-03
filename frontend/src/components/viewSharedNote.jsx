import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { decryptText } from "../utils/crypto";
import api from "../utils/api";
import secureIcon from '../images/secure.png';
import { Button } from './Button';

const viewSharedNote = () => {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [fileData, setFileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEncrypted, setIsEncrypted] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [decryptedContent, setDecryptedContent] = useState("");
  const [cryptoError, setCryptoError] = useState("");

  useEffect(() => {
    const fetchFileData = async () => {
      try {
        const response = await api.get(`/api/files/${fileId}`);
        const data = response.data;
        setFileData(data);
        if (data.encryption) {
          setIsEncrypted(true);
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
  }, [fileId]);

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-medium text-white/50 animate-pulse font-label tracking-widest uppercase">Intercepting Signal...</div>
      </div>
    );
  }

  if (!fileData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="text-2xl font-bold font-headline text-error">
          Signal Lost or Access Denied
        </div>
        <Button variant="secondary" onClick={() => navigate('/Home')}>Return to Command Center</Button>
      </div>
    );
  }

  if (isEncrypted) {
    return (
      <main className="w-full min-h-screen font-body antialiased overflow-y-auto flex items-center justify-center p-4">
        <div className="bg-surface-container-highest border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
          <button onClick={() => navigate('/Home')} className="absolute top-4 right-4 text-white/30 hover:text-white transition-colors">
            ✕
          </button>
          <h2 className="text-2xl font-bold font-headline mb-2 text-center mt-2">Classified Data</h2>
          <p className="text-white/50 mb-8 text-sm text-center">E2E Protected. Passcode required.</p>
          <input 
            type="password" 
            placeholder="Enter secure passcode"
            className="w-full p-3 bg-transparent border border-outline-variant rounded-xl mb-4 outline-none focus:border-primary text-white placeholder-white/30 font-label"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            onKeyDown={(e) => { if(e.key === 'Enter') handleDecrypt(); }}
          />
          {cryptoError && <p className="text-error text-sm mb-4 text-center">{cryptoError}</p>}
          <Button variant="primary" className="w-full justify-center" onClick={handleDecrypt}>
            Unlock Content
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="w-full min-h-screen text-on-surface font-body antialiased overflow-y-auto">
      {/* App Header */}
      <nav className="sticky top-0 bg-[#131313]/70 backdrop-blur border-b border-white/10 z-40 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img src={secureIcon} alt="icon" className="h-7 w-7 opacity-90" />
          <h3 className="text-xl font-medium tracking-tight text-primary">Secure-NoteBook</h3>
        </div>
        <div className="flex gap-6 items-center">
          <Link className="text-sm font-medium text-white/50 hover:text-primary transition-colors duration-300 hidden sm:block" to="/Home">
            Dashboard
          </Link>
          <Button variant="secondary" size="sm" onClick={() => navigate('/Home')}>
            Close Signal
          </Button>
        </div>
      </nav>

      {/* Note Content Base */}
      <div className="container max-w-4xl mx-auto px-4 py-8 md:py-12">
        <div className="bg-surface-container/60 glass-panel border border-outline-variant/15 p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] pointer-events-none"></div>

          {/* Note Title & Meta */}
          <div className="border-b border-outline-variant/10 pb-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 relative z-10">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white">
                {fileData.fileName}
              </h1>
              <h4 className="text-on-surface-variant font-label text-xs tracking-widest mt-3 uppercase">
                Created on {new Date(fileData.createdAt).toLocaleDateString()}
              </h4>
            </div>
            
            <div className="flex flex-col items-end gap-2 text-right">
              <span className="bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full font-label text-[10px] uppercase tracking-widest font-bold">
                Shared Access
              </span>
              <span className="text-xs text-white/40 font-label tracking-widest">
                Owner: {fileData.email}
              </span>
            </div>
          </div>

          {/* Actual File Content */}
          <div className="bg-[#0b0b0b]/60 rounded-2xl border border-white/5 p-6 md:p-8 min-h-[300px] relative z-10">
            <p className="text-white/90 leading-relaxed whitespace-pre-wrap font-body text-lg">
              {decryptedContent}
            </p>
          </div>

          {/* Action Footer Button Group */}
          <div className="flex justify-between items-center pt-8 mt-4 relative z-10">
            <Button variant="secondary" onClick={() => navigate('/Home')}>
              Return to Control Center
            </Button>
          </div>
          
        </div>
      </div>
    </main>
  );
};

export default viewSharedNote;
