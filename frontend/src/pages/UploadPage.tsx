import React, { useState } from 'react';
import { Upload, X, Copy, Check, Lock, Calendar } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const UploadPage: React.FC<{ isAnonymous?: boolean }> = ({ isAnonymous = false }) => {
  const [file, setFile] = useState<File | null>(null);
  const [expiresInDays, setExpiresInDays] = useState<number>(7);
  const [password, setPassword] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [copied, setCopied] = useState(false);

  const { isAuthenticated } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && currentTag.trim()) {
      e.preventDefault();
      if (tags.length >= 5) {
        setError('Maximum 5 tags allowed');
        return;
      }
      if (!tags.includes(currentTag.trim())) {
        setTags([...tags, currentTag.trim()]);
      }
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    setIsUploading(true);
    setError('');
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('expiresInDays', expiresInDays.toString());
    if (password) formData.append('password', password);
    if (tags.length > 0) formData.append('tags', JSON.stringify(tags));

    try {
      const endpoint = isAnonymous ? '/files/upload/anonymous' : '/files/upload';
      const response = await api.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 100));
          setUploadProgress(percentCompleted);
        },
      });

      const url = `${window.location.origin}/d/${response.data.token}`;
      setDownloadLink(url);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(downloadLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          {isAnonymous ? 'Upload Anonyme' : 'Partager un fichier'}
        </h1>

        {!downloadLink ? (
          <form onSubmit={handleUpload} className="space-y-6">
            
            {/* Zone de Drop / File Input */}
            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Sélectionner un fichier</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  {file ? file.name : 'Max 1 Go. Fichiers exécutables interdits.'}
                </p>
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center mb-1">
                  <Calendar className="w-4 h-4 mr-2" /> Expiration (jours)
                </label>
                <input type="number" min="1" max="7" value={expiresInDays} onChange={e => setExpiresInDays(parseInt(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center mb-1">
                  <Lock className="w-4 h-4 mr-2" /> Mot de passe (Optionnel)
                </label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} placeholder="Min 6 caractères" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags (Optionnel, Max 5)</label>
              <input type="text" value={currentTag} onChange={e => setCurrentTag(e.target.value)} onKeyDown={addTag} placeholder="Appuyez sur Entrée pour ajouter" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}

            {isUploading && (
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div><span className="text-xs font-semibold inline-block text-blue-600">Envoi en cours</span></div>
                  <div className="text-right"><span className="text-xs font-semibold inline-block text-blue-600">{uploadProgress}%</span></div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                  <div style={{ width: `${uploadProgress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"></div>
                </div>
              </div>
            )}

            <button type="submit" disabled={isUploading || !file} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
              {isUploading ? 'Upload en cours...' : 'Uploader le fichier'}
            </button>
          </form>
        ) : (
          <div className="text-center space-y-6 py-8">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Upload réussi !</h2>
            <p className="text-gray-500">Voici votre lien de téléchargement unique :</p>
            
            <div className="mt-4 flex rounded-md shadow-sm max-w-lg mx-auto">
              <input type="text" readOnly value={downloadLink} className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 bg-gray-50 text-gray-600" />
              <button onClick={copyToClipboard} className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-100 text-gray-700 hover:bg-gray-200">
                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>

            <div className="mt-8 space-x-4">
              <button onClick={() => { setDownloadLink(''); setFile(null); setTags([]); setPassword(''); }} className="text-blue-600 hover:text-blue-800 font-medium">
                Uploader un autre fichier
              </button>
              {isAuthenticated && !isAnonymous && (
                <a href="/dashboard" className="text-gray-600 hover:text-gray-800 font-medium">
                  Aller au Dashboard
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
