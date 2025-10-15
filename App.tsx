
import React, { useState, useEffect, useMemo } from 'react';
import { Paper } from './types';
import { fetchAndParseSheetData } from './services/googleSheetService';
import PaperTable from './components/PaperTable';
import Pagination from './components/Pagination';
import LoadingSpinner from './components/LoadingSpinner';

// --- IMPORTANT ---
// 1. Go to your Google Sheet.
// 2. Click `File` > `Share` > `Publish to web`.
// 3. In the dialog, select `Entire Document` and `Comma-separated values (.csv)`.
// 4. Click `Publish`.
// 5. Copy the generated URL and paste it below.
const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSHAAiPFIlWiXooENqd4nDAqOzUfUNUlQoH-qQlCdnFTVmtnyeh1fbS-HNvnCtWb2Xp4YP0Ws8Xm_xS/pub?output=csv'; // REPLACE WITH YOUR URL

const ITEMS_PER_PAGE = 20;

const App: React.FC = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        if (!GOOGLE_SHEET_CSV_URL || GOOGLE_SHEET_CSV_URL.includes('YOUR_URL_HERE')) {
            throw new Error("Please replace the placeholder Google Sheet URL in App.tsx.");
        }
        const data = await fetchAndParseSheetData(GOOGLE_SHEET_CSV_URL);
        setPapers(data);
      } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError('An unknown error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredPapers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      return papers;
    }
    return papers.filter(paper =>
      paper.Title.toLowerCase().includes(query) ||
      paper.Authors.toLowerCase().includes(query) ||
      paper.Journal.toLowerCase().includes(query)
    );
  }, [papers, searchQuery]);

  // Reset to page 1 when search query changes for better UX
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);
  
  const totalPages = Math.ceil(filteredPapers.length / ITEMS_PER_PAGE);
  
  const paginatedPapers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredPapers.slice(startIndex, endIndex);
  }, [filteredPapers, currentPage]);


  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <main className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
              Vietnamese medical research paper Database
            </span>
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Browse and search through a curated list of research publications in more than 10 open access Journals. Publised from 1997 to 2025, lastest updated on 07/2025!
          </p>
        </header>

        <div className="sticky top-4 z-10 mb-8 px-2 py-3 bg-slate-900/80 backdrop-blur-sm rounded-lg">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title, author, or journal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
              aria-label="Search papers"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        {isLoading && <LoadingSpinner />}
        
        {error && (
            <div className="text-center p-8 bg-red-900/50 border border-red-700 rounded-lg">
                <h2 className="text-2xl font-bold text-red-300 mb-2">Error Loading Data</h2>
                <p className="text-red-400">{error}</p>
            </div>
        )}

        {!isLoading && !error && (
          <>
            {filteredPapers.length > 0 ? (
              <>
                <PaperTable papers={paginatedPapers} />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            ) : (
              <div className="text-center p-8 bg-slate-800 rounded-lg">
                <h2 className="text-2xl font-bold text-slate-300">No Results Found</h2>
                <p className="text-slate-400 mt-2">Try adjusting your search query.</p>
              </div>
            )}
          </>
        )}
      </main>
      <footer className="text-center py-6 mt-8 border-t border-slate-800">
        <div className="flex justify-center items-center flex-wrap gap-x-6 gap-y-2 mb-4">
            <a href="https://www.facebook.com/stata.soulmate" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-sky-400 transition-colors">
                Follow me on Facebook
            </a>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <a href="https://www.youtube.com/@thuchanhthongkeysinh" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-sky-400 transition-colors">
                Follow me on YouTube
            </a>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <a href="https://docs.google.com/forms/d/e/1FAIpQLSclXivM6D00GDIgUqsKItO6e1zBKapx-fFPBdVeVmmfH-OjcA/viewform?usp=dialog" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-sky-400 transition-colors">
                Send Feedback
            </a>
        </div>
        <p className="text-slate-500 text-sm">Developed by- CuDao - MPH</p>
      </footer>
    </div>
  );
};

export default App;
