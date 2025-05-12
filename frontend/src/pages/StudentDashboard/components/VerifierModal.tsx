import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { XIcon, CheckIcon, SearchIcon } from 'lucide-react';

interface VerifierModalProps {
  onClose: () => void;
  onSelect: (verifierId: string,publicKey:string) => void;
}

interface Verifier {
  id: string;
  name: string;
  organization: string;
  publicKey: string;
  email: string;
  address: string;
}

export const VerifierModal: React.FC<VerifierModalProps> = ({ onClose, onSelect }) => {
  const [verifiers, setVerifiers] = useState<Verifier[]>([]);
  const [selectedVerifier, setSelectedVerifier] = useState<Verifier | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVerifiers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/verifiers');
        if (response.data.success) {
          const formattedVerifiers = response.data.verifiers.map((v: any) => ({
            id: v.uniqueId,
            name: v.name,
            organization: v.email, // Or use another field from the API response
            publicKey: v.publicKey,
            email: v.email,
            address: v.address
          }));
          setVerifiers(formattedVerifiers);
        }
      } catch (err) {
        setError('Failed to fetch verifiers');
        console.error('Error fetching verifiers:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVerifiers();
  }, []);

  const filteredVerifiers = verifiers.filter(verifier => 
    verifier.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    verifier.organization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-2xl shadow-purple-500/20 overflow-hidden z-10 animate-modalEntry">
        
        {/* Header */}
        <div className="relative p-6 border-b border-white/10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Select Verifier</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
              <XIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-400">
            Choose a trusted verifier to share your certificate with
          </p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search verifiers..." 
              value={searchQuery} 
              onChange={e => setSearchQuery(e.target.value)} 
              className="w-full py-2 pl-10 pr-4 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500" 
            />
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          </div>
        </div>

        {/* Loading/Error state */}
        {isLoading ? (
          <div className="p-8 text-center text-gray-400">Loading verifiers...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-400">{error}</div>
        ) : (
          /* Verifiers List */
          <div className="max-h-72 overflow-y-auto">
            {filteredVerifiers.map(verifier => (
              <div 
                key={verifier.id} 
                onClick={() => setSelectedVerifier(verifier)}
                className={`
                  p-4 border-b border-white/5 cursor-pointer
                  hover:bg-white/5 transition-colors
                  ${selectedVerifier?.id === verifier.id ? 'bg-purple-900/20 border-l-4 border-l-purple-500' : ''}
                `}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-medium">{verifier.name}</h3>
                    <p className="text-sm text-gray-400">{verifier.organization}</p>
                    <p className="text-xs text-gray-500 mt-1">ID: {verifier.id}</p>
                  </div>
                  {selectedVerifier?.id === verifier.id && (
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                      <CheckIcon className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filteredVerifiers.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                No verifiers found matching your search
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="p-4 border-t border-white/10 flex justify-end space-x-4">
          <button 
            onClick={onClose} 
            className="py-2 px-4 bg-transparent hover:bg-white/5 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => selectedVerifier && onSelect(selectedVerifier.id,selectedVerifier.publicKey)}
            disabled={!selectedVerifier}
            className={`
              py-2 px-4 rounded-lg transition-colors
              ${selectedVerifier ? 'bg-purple-500 hover:bg-purple-600 text-white' : 'bg-gray-800 text-gray-500 cursor-not-allowed'}
            `}
          >
            Share Certificate
          </button>
        </div>
      </div>
    </div>
  );
};