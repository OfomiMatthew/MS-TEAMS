import React, { useState } from 'react';
import { FileText, Sparkles, Download, Eye, Clock, User as UserIcon, X, Check } from 'lucide-react';
import { askCopilot } from '../../services/geminiService';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: string;
  modified: string;
  modifiedBy: string;
  summary: string;
  keyPoints: string[];
}

export const FilesView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const files: FileItem[] = [
    {
      id: 'file-1',
      name: 'Q4_Mesh_3D_Architecture_Specification.pdf',
      type: 'PDF Document',
      size: '2.4 MB',
      modified: 'Today at 08:30 AM',
      modifiedBy: 'Alex Mercer',
      summary: 'Detailed Three.js PBR rendering standards, composite 3-12 part procedural models, ACESFilmicToneMapping, and software-WebGL guard implementations.',
      keyPoints: [
        'Enforces zero unhosted 404 dependencies via procedural canvas textures',
        'Implements ACESFilmicToneMapping with RoomEnvironment PBR reflections',
        'Limits bottom control dock footprint to <= 15% with zero backdrop-filter over WebGL',
      ],
    },
    {
      id: 'file-2',
      name: 'Power_Automate_Workflow_Rules.docx',
      type: 'Word Document',
      size: '840 KB',
      modified: 'Yesterday at 04:15 PM',
      modifiedBy: 'Marcus Brody',
      summary: 'Specifications for automated incident triage, keyword escalation triggers, and AI-driven daily standup digests.',
      keyPoints: [
        'Automatic severity classification using Gemini 3.8 Flash',
        'Direct dispatch of priority notifications to SRE on-call rotation',
        'Zero-latency execution stream with persistent audit logging',
      ],
    },
    {
      id: 'file-3',
      name: 'Executive_Boardroom_Presentation_Deck.pptx',
      type: 'PowerPoint Deck',
      size: '5.1 MB',
      modified: 'Today at 09:12 AM',
      modifiedBy: 'Elena Rostova',
      summary: 'Interactive slides mapped directly onto the 3D presentation screen in the Mesh auditorium space.',
      keyPoints: [
        'Slide 1: Microsoft Teams Spatial Collaboration & Autonomous Workflows',
        'Slide 2: Three.js PBR Rendering & Hardware Acceleration',
        'Slide 3: Real-Time Enterprise Metrics & 99.99% SLA Uptime',
      ],
    },
    {
      id: 'file-4',
      name: 'Incident_Audit_Log_Q3.csv',
      type: 'Excel Sheet',
      size: '420 KB',
      modified: 'Oct 20, 2026',
      modifiedBy: 'Power Automate Bot',
      summary: 'Historical metrics of automated chaos drills, database replica promotions, and response times.',
      keyPoints: [
        'Mean time to resolve: 3.4 minutes',
        '100% automated replica failover success rate',
      ],
    },
  ];

  const handleInspectFile = async (file: FileItem) => {
    setSelectedFile(file);
    setIsAnalyzing(true);
    setAiAnalysis(null);

    try {
      const res = await askCopilot({
        action: 'chat',
        prompt: `Provide an executive brief of document "${file.name}": Summary: ${file.summary}. Key Points: ${file.keyPoints.join('; ')}`,
      });
      setAiAnalysis(res.result);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="flex-1 h-full bg-[#f3f4f6] dark:bg-slate-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <span>Files &amp; Cloud Documents</span>
          </h1>
          <p className="text-xs text-slate-500">OneDrive &amp; SharePoint synchronized repository</p>
        </div>
      </div>

      {/* Main Files Table */}
      <div className="flex-1 overflow-y-auto p-6 max-w-5xl">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3 hidden sm:table-cell">Modified</th>
                <th className="px-5 py-3 hidden md:table-cell">Modified By</th>
                <th className="px-5 py-3 hidden sm:table-cell">Size</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {files.map((file) => (
                <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5 flex items-center gap-2.5 font-medium">
                    <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="truncate max-w-xs">{file.name}</span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell">{file.modified}</td>
                  <td className="px-5 py-3.5 text-slate-500 hidden md:table-cell">{file.modifiedBy}</td>
                  <td className="px-5 py-3.5 text-slate-500 hidden sm:table-cell">{file.size}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => handleInspectFile(file)}
                      className="px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold hover:bg-indigo-100 flex items-center gap-1.5 ml-auto cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Copilot AI Summary</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI File Inspector Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-xl shadow-2xl p-6 text-slate-900 dark:text-white text-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h2 className="text-sm font-bold truncate max-w-md">{selectedFile.name}</h2>
              </div>
              <button
                onClick={() => setSelectedFile(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Overview:</span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedFile.summary}</p>
              </div>

              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Key Takeaways:</span>
                <ul className="list-disc pl-5 space-y-1 text-slate-600 dark:text-slate-300">
                  {selectedFile.keyPoints.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>

              {/* Copilot Insights */}
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Copilot Intelligent Briefing</span>
                </div>
                {isAnalyzing ? (
                  <div className="text-slate-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    <span>Analyzing document with Gemini 3.8 Flash...</span>
                  </div>
                ) : (
                  <div className="bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded-lg p-3 text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {aiAnalysis || 'Document validated for enterprise compliance and architecture compatibility.'}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedFile(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
