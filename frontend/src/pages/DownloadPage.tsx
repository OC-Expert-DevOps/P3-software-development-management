import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, Lock, AlertCircle, FileText } from 'lucide-react';
import api from '../services/api';

export const DownloadPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [fileInfo, setFileInfo] = useState<any>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const response = await api.get(`/files/download/${token}`);
        setFileInfo(response.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Fichier introuvable ou expiré');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetadata();
  }, [token]);

  const handleDownload = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setIsDownloading(true);

    try {
      const response = await api.post(`/files/download/${token}/file`, 
        { password: password || undefined },
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileInfo?.originalName || 'download');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      if (err.response?.data instanceof Blob) {
        // Axios parse le JSON comme Blob vu le responseType, il faut le lire
        const text = await err.response.data.text();
        const data = JSON.parse(text);
        setError(data.message || 'Erreur lors du téléchargement');
      } else {
        setError('Erreur inattendue');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (error && !fileInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900">Erreur</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-blue-500" />
          <h2 className="mt-4 text-2xl font-bold text-gray-900 break-all">
            {fileInfo?.originalName}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {fileInfo ? formatSize(fileInfo.sizeBytes) : ''}
          </p>
          <div className="mt-2 flex justify-center gap-2 flex-wrap">
            {fileInfo?.tags?.map((tag: string) => (
               <span key={tag} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                 {tag}
               </span>
            ))}
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {fileInfo?.isPasswordProtected ? (
            <form onSubmit={handleDownload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center mb-1">
                  <Lock className="w-4 h-4 mr-2" /> Fichier protégé par mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Saisissez le mot de passe"
                />
              </div>
              <button
                type="submit"
                disabled={isDownloading || !password}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
              >
                {isDownloading ? 'Téléchargement...' : 'Déverrouiller et télécharger'}
              </button>
            </form>
          ) : (
            <button
              onClick={() => handleDownload()}
              disabled={isDownloading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              <Download className="w-5 h-5 mr-2" />
              {isDownloading ? 'Téléchargement...' : 'Télécharger le fichier'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
