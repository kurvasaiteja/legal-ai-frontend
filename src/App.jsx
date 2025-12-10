import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  CloudArrowUpIcon, 
  DocumentMagnifyingGlassIcon, 
  ChatBubbleLeftRightIcon,
  ShieldExclamationIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

const API_URL = "https://legal-ai-backend-6kw0.onrender.com"; 


const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000); 
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg animate-slide-in ${
      type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'
    }`}>
      {type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <XCircleIcon className="w-5 h-5" />}
      <span className="font-medium">{message}</span>
    </div>
  );
};


const Typewriter = ({ text }) => {
  const [displayedText, setDisplayedText] = useState("");
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) {
        setDisplayedText(text);
        return;
    }
    let index = 0;
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => {
        if (index >= text.length) {
            clearInterval(intervalId);
            hasRun.current = true;
            return text;
        }
        return text.slice(0, index + 1);
      });
      index++;
    }, 2); 
    return () => clearInterval(intervalId);
  }, [text]);

  return <span>{displayedText}</span>;
};


const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

function App() {
  const [file, setFile] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [risks, setRisks] = useState([]);
  const [chatQuery, setChatQuery] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [rewritingId, setRewritingId] = useState(null);
  const [notification, setNotification] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, chatLoading, activeTab]);

  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const handleUpload = async () => {
    if (!file) return showToast("Please select a file first", "error");
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setLoading(true);
      
      const res = await axios.post(`${API_URL}/upload`, formData, {
        timeout: 300000 
      });
      
      setSessionId(res.data.session_id);
      showToast("Document processed successfully!"); 
      setTimeout(() => {
        setActiveTab('analysis'); 
      }, 1000);

    } catch (err) {
      console.error(err);
      if (err.code === 'ECONNABORTED') {
        showToast("Upload timed out. File is too large/complex.", "error");
      } else {
        showToast("Upload failed. Check backend console.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      
      const res = await axios.post(`${API_URL}/analyze`, { session_id: sessionId }, { timeout: 120000 });
      const parsed = JSON.parse(res.data.risks);
      setRisks(parsed.risks || []);
      showToast("Risk analysis complete!");
    } catch (err) {
      showToast("Analysis failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRewrite = async (riskIndex, clauseText) => {
    setRewritingId(riskIndex);
    try {
      const res = await axios.post(`${API_URL}/rewrite`, { clause_text: clauseText });
      const updatedRisks = [...risks];
      updatedRisks[riskIndex].rewritten_text = res.data.rewritten;
      setRisks(updatedRisks);
      showToast("Clause rewritten in client's favor!");
    } catch (err) {
      showToast("Rewrite failed", "error");
    } finally {
      setRewritingId(null);
    }
  };

  const handleChat = async () => {
    if (!chatQuery) return;
    const userMsg = { role: 'user', content: chatQuery };
    
    setChatHistory(prev => [...prev, userMsg]);
    setChatQuery("");
    setChatLoading(true);
    
    try {
      const res = await axios.post(`${API_URL}/chat`, { 
        session_id: sessionId, 
        query: userMsg.content 
      });
      setChatHistory(prev => [...prev, { role: 'ai', content: res.data.response }]);
    } catch (err) {
      showToast("Chat error", "error");
    } finally {
      setChatLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans text-slate-800 bg-slate-50">
      
      {notification && (
        <Toast 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col gap-6 shadow-xl z-20">
        <h1 className="text-2xl font-bold tracking-wider flex items-center gap-2">
          <ShieldExclamationIcon className="w-8 h-8 text-sky-400" />
          Legal<span className="text-sky-400">AI</span>
        </h1>
        
        <nav className="flex flex-col gap-2 mt-8">
          <button onClick={() => setActiveTab('upload')} className={`p-3 rounded-lg text-left flex items-center gap-3 transition ${activeTab === 'upload' ? 'bg-sky-600' : 'hover:bg-slate-800'}`}>
            <CloudArrowUpIcon className="w-5 h-5" /> Upload
          </button>
          
          <button onClick={() => setActiveTab('analysis')} disabled={!sessionId} className={`p-3 rounded-lg text-left flex items-center gap-3 transition ${activeTab === 'analysis' ? 'bg-sky-600' : 'hover:bg-slate-800'} ${!sessionId && 'opacity-50 cursor-not-allowed'}`}>
            <DocumentMagnifyingGlassIcon className="w-5 h-5" /> Risk Analysis
          </button>
          
          <button onClick={() => setActiveTab('chat')} disabled={!sessionId} className={`p-3 rounded-lg text-left flex items-center gap-3 transition ${activeTab === 'chat' ? 'bg-sky-600' : 'hover:bg-slate-800'} ${!sessionId && 'opacity-50 cursor-not-allowed'}`}>
            <ChatBubbleLeftRightIcon className="w-5 h-5" /> Legal Assistant
          </button>
        </nav>
        
        <div className="mt-auto pt-6 border-t border-slate-700 text-xs text-slate-400">
          Status: {sessionId ? <span className="text-green-400">Active Session</span> : "No File"}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 overflow-y-auto relative">
        
        {/* UPLOAD VIEW */}
        <div className={activeTab === 'upload' ? 'block animate-fade-in' : 'hidden'}>
          <div className="max-w-xl mx-auto mt-20 text-center">
            <h2 className="text-3xl font-bold mb-4">Start your Analysis</h2>
            <p className="text-slate-500 mb-8">Upload a legal contract (*PDF) to identify risks and ask questions.</p>
            
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 bg-white shadow-sm hover:border-sky-500 transition group">
              <input type="file" onChange={(e) => setFile(e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 mb-4 cursor-pointer" />
              <button onClick={handleUpload} disabled={loading} className="w-full py-3 bg-sky-600 text-white rounded-lg font-bold shadow-lg hover:bg-sky-700 transition disabled:bg-slate-300 flex justify-center items-center gap-2">
                {loading && <Spinner />} {loading ? "Processing (Large files take time)..." : "Upload & Begin"}
              </button>
            </div>
          </div>
        </div>

        {/* RISK ANALYSIS VIEW */}
        <div className={activeTab === 'analysis' ? 'block animate-fade-in' : 'hidden'}>
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Risk Detection Report</h2>
              <button onClick={handleAnalyze} disabled={loading} className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700 flex items-center gap-2 disabled:bg-slate-300">
                 {loading && <Spinner />} {loading ? "Scanning..." : "Run New Scan"}
              </button>
            </div>

            {loading && risks.length === 0 && (
                <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse"></div>)}</div>
            )}

            {risks.length === 0 && !loading && (
              <div className="text-center py-20 bg-white rounded-lg border border-dashed">
                <p className="text-slate-400">No risks detected yet. Click "Run New Scan".</p>
              </div>
            )}

            <div className="space-y-6">
              {risks.map((risk, idx) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500 transition hover:shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-red-100 text-red-700 py-1 px-3 rounded-full text-xs font-bold uppercase tracking-wide">High Risk</span>
                    <h3 className="font-bold text-lg">{risk.clause_title}</h3>
                  </div>

                  <p className="text-slate-600 italic mb-4 bg-slate-50 p-3 rounded border border-slate-100">"{risk.original_text}"</p>
                  <p className="text-slate-800 font-medium mb-4"><span className="text-red-500 font-bold">Why it's risky:</span> {risk.risk_explanation}</p>

                  {risk.rewritten_text ? (
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg mt-4 animate-fade-in">
                      <div className="flex justify-between items-start mb-2">
                          <h4 className="text-green-800 font-bold text-sm flex items-center gap-2">✅ Suggested Revision (Client Favor)</h4>
                          <button onClick={() => copyToClipboard(risk.rewritten_text)} title="Copy Text" className="text-green-700 hover:text-green-900"><ClipboardDocumentIcon className="w-4 h-4" /></button>
                      </div>
                      <p className="text-green-900 font-serif text-sm leading-relaxed border-l-2 border-green-400 pl-3">
                          <Typewriter text={risk.rewritten_text} />
                      </p>
                    </div>
                  ) : (
                    <button onClick={() => handleRewrite(idx, risk.original_text)} disabled={rewritingId === idx} className="text-sky-600 text-sm font-bold flex items-center gap-2 hover:underline disabled:opacity-50">
                      {rewritingId === idx ? <Spinner /> : <ArrowPathIcon className="w-4 h-4" />}
                      {rewritingId === idx ? "Drafting new clause..." : "Rewrite to be more favorable"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CHAT VIEW */}
        <div className={activeTab === 'chat' ? 'block h-[85vh] flex flex-col' : 'hidden'}>
          <div className="max-w-4xl mx-auto w-full h-full flex flex-col bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
            <div className="bg-slate-100 p-4 border-b border-slate-200"><h3 className="font-bold text-slate-700">Legal Assistant</h3></div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth">
              {chatHistory.length === 0 && <div className="text-center text-slate-400 mt-20"><ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-2 opacity-20" /><p>Ask questions about termination, payment terms, or liability.</p></div>}
              
              {chatHistory.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-sky-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                    {msg.role === 'ai' ? <Typewriter text={msg.content} /> : msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && <div className="flex justify-start"><div className="bg-slate-100 text-slate-500 p-4 rounded-2xl rounded-bl-none italic flex items-center gap-2"><Spinner /> Thinking...</div></div>}
              <div ref={chatEndRef} />
            </div>
            
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
              <input className="flex-1 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" placeholder="Type your question..." value={chatQuery} onChange={(e) => setChatQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleChat()} disabled={chatLoading} />
              <button onClick={handleChat} disabled={chatLoading} className="bg-slate-900 text-white px-6 rounded-lg font-bold hover:bg-slate-800 disabled:opacity-50">Send</button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default App;