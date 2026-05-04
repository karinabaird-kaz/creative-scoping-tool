import { useState, useRef } from 'react';
import { generateScopeDescription } from '../lib/scopeGenerator';

interface ScopeGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (text: string) => void;
  clientName: string;
  projectName: string;
}

export function ScopeGeneratorModal({
  isOpen,
  onClose,
  onInsert,
  clientName,
  projectName,
}: ScopeGeneratorModalProps) {
  const [inputMode, setInputMode] = useState<'brief' | 'file'>('brief');
  const [briefInput, setBriefInput] = useState('');
  const [fileName, setFileName] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleGenerate() {
    if (!briefInput.trim()) {
      setError('Please enter a brief or project description');
      return;
    }
    setError('');
    setIsGenerating(true);
    try {
      const result = await generateScopeDescription({
        brief: briefInput,
        clientName,
        projectName,
      });
      setGeneratedText(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate scope description');
    } finally {
      setIsGenerating(false);
    }
  }

  function handleInsert() {
    if (generatedText.trim()) {
      onInsert(generatedText);
      handleClose();
    }
  }

  function handleClose() {
    onClose();
    setBriefInput('');
    setFileName('');
    setGeneratedText('');
    setError('');
    setInputMode('brief');
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setBriefInput(text ?? '');
    };
    reader.readAsText(file);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">

        {/* Header */}
        <div className="bg-[#0a0a0a] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-bold text-white">Generate Scope Description</h2>
            <p className="text-[12px] text-white/50 mt-0.5">
              Create client-facing scope text from a brief
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-white/40 hover:text-white transition-colors text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* Input mode tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => { setInputMode('brief'); setError(''); }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                inputMode === 'brief'
                  ? 'bg-[#fff230] text-black'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Paste Brief
            </button>
            <button
              onClick={() => { setInputMode('file'); setError(''); }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                inputMode === 'file'
                  ? 'bg-[#fff230] text-black'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Upload File
            </button>
          </div>

          {/* Input area */}
          {inputMode === 'brief' ? (
            <textarea
              value={briefInput}
              onChange={(e) => setBriefInput(e.target.value)}
              placeholder="Paste your project brief, deliverables list, or existing scope notes here…"
              rows={8}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-[13px] text-black focus:outline-none focus:border-gray-400 placeholder-gray-300 resize-none"
            />
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.doc,.docx,.pdf,.csv"
                onChange={handleFileChange}
                className="hidden"
              />
              {fileName ? (
                <div>
                  <p className="text-[13px] font-medium text-black mb-1">{fileName}</p>
                  <p className="text-[11px] text-gray-400">Click to change file</p>
                </div>
              ) : (
                <div>
                  <p className="text-[13px] text-gray-600 mb-1">Click to select a file</p>
                  <p className="text-[11px] text-gray-400">.txt, .doc, .docx, .pdf, or .csv</p>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-3 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-[12px] text-red-700">
              {error}
            </div>
          )}

          {/* Generated output */}
          {generatedText && (
            <div className="mt-5">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Generated Scope Description
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 max-h-56 overflow-y-auto">
                <p className="text-[12px] text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {generatedText}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          {generatedText ? (
            <>
              <button
                onClick={() => setGeneratedText('')}
                className="text-gray-600 hover:text-black text-xs border border-gray-200 rounded-full px-4 py-1.5 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleInsert}
                className="text-black bg-[#fff230] hover:bg-yellow-300 text-xs font-semibold rounded-full px-5 py-1.5 transition-colors"
              >
                Insert into Proposal
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleClose}
                className="text-gray-600 hover:text-black text-xs border border-gray-200 rounded-full px-4 py-1.5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !briefInput.trim()}
                className={`text-xs font-semibold rounded-full px-5 py-1.5 transition-colors ${
                  isGenerating || !briefInput.trim()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#fff230] hover:bg-yellow-300 text-black'
                }`}
              >
                {isGenerating ? 'Generating…' : 'Generate Scope'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
