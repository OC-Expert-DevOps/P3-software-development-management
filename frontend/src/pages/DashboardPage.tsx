import React, { useState, useEffect } from 'react';
import { Trash2, Link as LinkIcon, ExternalLink, Calendar, Search, Lock, Copy } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tagFilter, setTagFilter] = useState('');
  const [searchTag, setSearchTag] = useState('');
  const { logout, user } = useAuth();

  const fetchFiles = async (tag?: string) => {
    setIsLoading(true);
    try {
      const url = tag ? `/files?tag=${encodeURIComponent(tag)}` : '/files';
      const response = await api.get(url);
      setFiles(response.data);
    } catch (error) {
      console.error('Failed to fetch files', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(tagFilter);
  }, [tagFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setTagFilter(searchTag.trim());
  };

  const deleteFile = async (id: string) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce fichier ?')) {
      try {
        await api.delete(`/files/${id}`);
        setFiles(files.filter(f => f.id !== id));
      } catch (error) {
        console.error('Failed to delete file', error);
        alert('Erreur lors de la suppression');
      }
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const copyToClipboard = (token: string) => {
    const url = `${window.location.origin}/d/${token}`;
    navigator.clipboard.writeText(url);
    alert('Lien copié !');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <LinkIcon className="h-8 w-8 text-blue-600 mr-2" />
              <span className="text-xl font-bold text-gray-900">DataShare</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button onClick={logout} className="text-sm text-red-600 hover:text-red-800">
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Mes fichiers</h1>
            <Link to="/upload" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Nouveau fichier
            </Link>
          </div>

          <div className="bg-white p-4 shadow rounded-md mb-6 flex items-center space-x-4">
            <form onSubmit={handleSearch} className="flex flex-1">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTag}
                  onChange={(e) => setSearchTag(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-l-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Filtrer par tag..."
                />
              </div>
              <button type="submit" className="ml-0 px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 text-gray-700">
                Filtrer
              </button>
            </form>
            {tagFilter && (
              <button onClick={() => { setTagFilter(''); setSearchTag(''); }} className="text-sm text-gray-500 hover:text-gray-700">
                Effacer le filtre
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-10 text-gray-500">Chargement...</div>
          ) : files.length === 0 ? (
            <div className="text-center py-10 bg-white shadow rounded-md text-gray-500">
              Aucun fichier trouvé. {tagFilter && `(Tag: ${tagFilter})`}
            </div>
          ) : (
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {files.map((file) => (
                  <li key={file.id}>
                    <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col truncate">
                          <p className="text-sm font-medium text-blue-600 truncate flex items-center">
                            {file.originalName}
                            {file.isPasswordProtected && <Lock className="ml-2 w-3 h-3 text-gray-400" />}
                          </p>
                          <div className="mt-2 flex">
                            <div className="flex items-center text-sm text-gray-500 mr-6">
                              {formatSize(file.sizeBytes)}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              Expire le {new Date(file.expiresAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="mt-2 flex gap-2">
                            {file.tags.map((t: string) => (
                              <span key={t} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button onClick={() => copyToClipboard(file.token)} className="text-gray-400 hover:text-gray-600 flex items-center" title="Copier le lien">
                            <Copy className="h-5 w-5" />
                          </button>
                          <Link to={`/d/${file.token}`} className="text-blue-400 hover:text-blue-600 flex items-center" title="Aller à la page">
                            <ExternalLink className="h-5 w-5" />
                          </Link>
                          <button onClick={() => deleteFile(file.id)} className="text-red-400 hover:text-red-600 flex items-center" title="Supprimer">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
