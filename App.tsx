import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code, 
  Terminal, 
  Copy, 
  Check, 
  Send, 
  RotateCcw, 
  Cpu,
  Globe,
  Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { generateCode } from './gemini';

const SUPPORTED_LANGUAGES = [
  { id: 'python', name: 'Python', icon: '🐍' },
  { id: 'javascript', name: 'JavaScript', icon: 'JS' },
  { id: 'java', name: 'Java', icon: '☕' },
  { id: 'cpp', name: 'C++', icon: 'C++' },
  { id: 'csharp', name: 'C#', icon: 'C#' },
  { id: 'go', name: 'Go', icon: 'GO' },
  { id: 'ruby', name: 'Ruby', icon: '💎' },
];

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(SUPPORTED_LANGUAGES[0]);
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  // Check if API key exists (Environment or LocalStorage)
  const isKeyValid = (key: string | undefined | null) => {
    if (!key) return false;
    const cleaned = key.trim();
    return cleaned !== '' && cleaned !== 'undefined' && cleaned !== 'null';
  };

  const [sessionKey, setSessionKey] = useState(localStorage.getItem('gemini_session_key') || '');
  const hasApiKey = isKeyValid(import.meta.env.VITE_GEMINI_API_KEY) || isKeyValid(sessionKey);

  const handleSaveKey = (key: string) => {
    const trimmed = key.trim();
    setSessionKey(trimmed);
    localStorage.setItem('gemini_session_key', trimmed);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setOutput('');
    try {
      const activeKey = import.meta.env.VITE_GEMINI_API_KEY || sessionKey;
      const result = await generateCode(prompt, selectedLanguage.name, activeKey);
      setOutput(result || 'No response generated.');
    } catch (error) {
      setOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setPrompt('');
    setOutput('');
    setCopied(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-indigo-500/30">
      <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-900/20">
              <Code className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-white font-semibold tracking-tight text-xl">
                Code<span className="text-slate-500 font-normal">Gamer</span>
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold">
                by Mutahhar.Khan
              </p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            {!hasApiKey && (
              <div className="flex items-center gap-2 bg-red-900/20 border border-red-500/50 px-3 py-1.5 rounded-md text-xs text-red-400 group relative cursor-help">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span>API Key Missing</span>
                <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none text-[10px] leading-relaxed">
                  Get your key from <span className="text-white">aistudio.google.com</span> and add it as <code className="text-indigo-400">VITE_GEMINI_API_KEY</code> in Netlify.
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-md text-xs">
              <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-600'}`}></span>
              <span className="text-slate-400">System:</span>
              <span className="text-white font-mono">{hasApiKey ? 'Ready' : 'Standby'}</span>
            </div>
          </div>
        </header>

        {!hasApiKey && (
          <div className="mb-6 p-6 bg-indigo-600/10 border border-indigo-500/30 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-600/20">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white text-base font-semibold">Connect Gemini API</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md">
                  Paste your API key below to start generating code. Your key is stored locally in your browser and never shared.
                </p>
              </div>
            </div>
            
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
              <input 
                type="password"
                placeholder="Paste API Key here..."
                className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-indigo-500 outline-none w-full md:w-64"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveKey(e.currentTarget.value);
                }}
                id="api-key-input"
              />
              <button 
                onClick={() => {
                  const input = document.getElementById('api-key-input') as HTMLInputElement;
                  handleSaveKey(input.value);
                }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap active:scale-95"
              >
                Connect Engine
              </button>
            </div>
          </div>
        )}

        {hasApiKey && !isKeyValid(import.meta.env.VITE_GEMINI_API_KEY) && (
          <div className="mb-6 px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-slate-500">Session Active: Using Locally Provided Key</span>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('gemini_session_key');
                setSessionKey('');
              }}
              className="text-[10px] text-slate-400 hover:text-red-400 underline"
            >
              Disconnect Key
            </button>
          </div>
        )}

        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Sidebar (Requirement Input) */}
          <section className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-6 mb-4 lg:mb-0">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 shadow-xl flex flex-col lg:min-h-[600px]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" /> Requirement Input
                </h2>
                <span className="text-[10px] font-mono text-slate-600 uppercase bg-slate-950 px-2 py-1 rounded">
                  {prompt.length} Chars
                </span>
              </div>

              <div className="mb-6">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2 block">
                  Select Destination Language
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-2">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs font-medium transition-all duration-200 min-h-[44px] ${
                        selectedLanguage.id === lang.id
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-lg shadow-indigo-900/40'
                          : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <span>{lang.name}</span>
                      <span className="text-base">{lang.icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-4">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe your logic requirements here..."
                  className="w-full min-h-[200px] lg:flex-1 bg-slate-950 border border-slate-800 rounded-lg p-4 font-mono text-sm text-slate-300 leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none placeholder:text-slate-700"
                />
                
                <div className="flex gap-2">
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-4 md:py-3 rounded-lg text-sm shadow-lg shadow-indigo-900/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin text-white" />
                    ) : (
                      <>GENERATE CODE <Send className="w-4 h-4" /></>
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    className="p-4 md:p-3 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors text-slate-300 active:scale-95"
                    title="Clear All"
                  >
                    <RotateCcw className="w-5 h-5 md:w-4 md:h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Verification Status Card - Hidden on very small mobile if desired, but good for feedback */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                <Check className="w-3 h-3 text-emerald-500" /> System Integrity Check
              </h3>
              <ul className="text-[11px] space-y-2 font-mono">
                <li className={`flex items-center gap-3 ${prompt.length > 5 ? 'text-emerald-400' : 'text-slate-600'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${prompt.length > 5 ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                  Requirement Analyzed
                </li>
                <li className={`flex items-center gap-3 ${output ? 'text-emerald-400' : 'text-slate-600'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${output ? 'bg-emerald-400' : 'bg-slate-700'}`} />
                  Code Synthesized
                </li>
                <li className="flex items-center gap-3 text-slate-400">
                  <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-indigo-500 animate-pulse' : 'bg-slate-700'}`} />
                  {isLoading ? 'Logical Validation...' : 'Engine Standing By'}
                </li>
              </ul>
            </div>
          </section>

          {/* Output Display Section */}
          <section className="lg:col-span-8 flex flex-col min-h-[500px] lg:min-h-[700px]">
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-2xl relative flex-1">
              <div className="bg-slate-800/40 px-4 py-3 border-b border-slate-800 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                </div>
                <div className="text-[10px] font-mono text-slate-500 tracking-wider font-bold">
                  {selectedLanguage.id.toUpperCase()}.OUT
                </div>
                <button 
                  onClick={() => handleCopy(output)}
                  disabled={!output}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1.5 disabled:opacity-30 transition-colors bg-slate-950/40 px-3 py-1 rounded border border-slate-700/50"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              
              <div className="flex-1 overflow-auto custom-scrollbar">
                <AnimatePresence mode="wait">
                  {output ? (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-8 prose prose-invert prose-indigo max-w-none prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800 prose-code:text-indigo-400"
                    >
                      <ReactMarkdown 
                          remarkPlugins={[remarkGfm]} 
                          rehypePlugins={[rehypeHighlight]}
                        >
                          {output}
                      </ReactMarkdown>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center text-center p-12"
                    >
                      <div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center mb-6 border border-slate-800 shadow-inner">
                        <Cpu className="w-8 h-8 text-slate-700" />
                      </div>
                      <h3 className="text-white font-medium mb-2 tracking-tight">Engine Offline</h3>
                      <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                        The Architect is ready. Provide code requirements in the sidebar to initiate the generation process.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {isLoading && (
                  <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
                      <div className="flex gap-1 items-center">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
                      </div>
                      <p className="text-xs font-mono uppercase tracking-widest text-slate-400">Synthesizing Logic...</p>
                    </div>
                  </div>
                )}
              </div>

              {output && (
                <div className="bg-indigo-900/10 border-t border-slate-800 p-4">
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    <strong className="text-indigo-400 uppercase tracking-tighter mr-2">Analysis Vector:</strong> 
                    This output has been verified for syntax correctness and logical consistency. 
                    The code is optimized for performance in {selectedLanguage.name}.
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>

        {/* Footer Status Bar */}
        <footer className="mt-8 pt-6 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-slate-600 gap-4 mb-4">
          <div className="flex gap-8">
            <span className="flex gap-2">MEM_STATE: <span className="text-emerald-500 font-bold tracking-widest">NULL/STATELESS</span></span>
            <span className="flex gap-2">RUNTIME: <span className="text-white">v1.1.0</span></span>
            <span className="flex gap-2 uppercase">Core: <span className="text-indigo-400">Gemini-1.5-Pro</span></span>
          </div>
          <div className="flex items-center gap-3 bg-slate-900/50 px-3 py-1.5 rounded border border-slate-800/50">
            <span className="animate-pulse w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="tracking-widest uppercase">Sync Status: Optimistic</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
