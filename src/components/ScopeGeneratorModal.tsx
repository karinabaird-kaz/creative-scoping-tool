import { useState, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import { generateScopeDescription, refineScope, queryBrief } from '../lib/scopeGenerator';

// Use CDN worker so we don't have to bundle the large worker file
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;

const isDemo = () => {
  const key = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
  return !key || key === 'sk-ant-YOUR_KEY_HERE' || key.trim() === '';
};

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
  const [isRefining, setIsRefining] = useState(false);
  const [refinementInput, setRefinementInput] = useState('');
  const [bottomMode, setBottomMode] = useState<'refine' | 'query'>('refine');
  const [queryInput, setQueryInput] = useState('');
  const [queryResponse, setQueryResponse] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [error, setError] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
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
      setRefinementInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate scope description');
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleRefine() {
    if (!refinementInput.trim()) return;
    setError('');
    setIsRefining(true);
    try {
      const result = await refineScope({
        currentScope: generatedText,
        instruction: refinementInput,
        brief: briefInput,
        clientName,
        projectName,
      });
      setGeneratedText(result);
      setRefinementInput('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refine scope description');
    } finally {
      setIsRefining(false);
    }
  }

  async function handleQuery() {
    if (!queryInput.trim()) return;
    setIsQuerying(true);
    setQueryResponse('');
    try {
      const result = await queryBrief({
        brief: briefInput,
        question: queryInput,
        clientName,
        projectName,
      });
      setQueryResponse(result);
    } catch (err) {
      setQueryResponse(err instanceof Error ? err.message : 'Failed to answer query');
    } finally {
      setIsQuerying(false);
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
    setRefinementInput('');
    setQueryInput('');
    setQueryResponse('');
    setBottomMode('refine');
    setError('');
    setInputMode('brief');
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError('');

    const fileName = file.name.toLowerCase();
    const isPdf = file.type === 'application/pdf' || fileName.endsWith('.pdf');
    const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx');

    if (isPdf) {
      setIsExtracting(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const pageTexts: string[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const pageText = content.items
            .map((item) => ('str' in item ? item.str : ''))
            .join(' ');
          pageTexts.push(pageText);
        }
        setBriefInput(pageTexts.join('\n\n'));
      } catch {
        setError('Could not extract text from this PDF. Try copying the text manually and using Paste Brief instead.');
      } finally {
        setIsExtracting(false);
      }
    } else if (isDocx) {
      setIsExtracting(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setBriefInput(result.value);
      } catch {
        setError('Could not extract text from this Word document. Try saving as .txt or copying the text and using Paste Brief instead.');
      } finally {
        setIsExtracting(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setBriefInput(text ?? '');
      };
      reader.readAsText(file);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-[840px] w-full max-h-[90vh] min-h-[580px] overflow-hidden flex flex-col shadow-2xl">

        {/* Header */}
        <div className="bg-[#0a0a0a] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-[15px] font-bold text-white">Generate Scope Description</h2>
            <p className="text-[12px] text-white/50 mt-0.5">
              {isDemo() ? 'Demo mode — showing example output' : 'Create client-facing scope text from a brief'}
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

          {/* Step 1: Input (hidden once generated) */}
          {!generatedText && (
            <>
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
                  rows={10}
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
                  {isExtracting ? (
                    <div>
                      <p className="text-[13px] font-medium text-black mb-1">Extracting text…</p>
                      <p className="text-[11px] text-gray-400">Reading {fileName}</p>
                    </div>
                  ) : fileName ? (
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
            </>
          )}

          {/* Step 2: Generated output + refinement */}
          {generatedText && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                  Generated Scope Description
                </p>
                <button
                  onClick={() => { setGeneratedText(''); setRefinementInput(''); setError(''); }}
                  className="text-[11px] text-gray-400 hover:text-gray-700 transition-colors"
                >
                  ← Start over
                </button>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 h-[320px] overflow-y-auto mb-4">
                <p className="text-[12px] text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {generatedText}
                </p>
              </div>

              {/* Refine / Query tabs */}
              <div>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setBottomMode('refine')}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                      bottomMode === 'refine'
                        ? 'bg-[#0a0a0a] text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    Refine
                  </button>
                  <button
                    onClick={() => setBottomMode('query')}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                      bottomMode === 'query'
                        ? 'bg-[#0a0a0a] text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    Query Brief
                  </button>
                </div>

                {bottomMode === 'refine' && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={refinementInput}
                      onChange={(e) => setRefinementInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !isRefining) handleRefine(); }}
                      placeholder='e.g. "make it shorter" or "remove the strategy section"'
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-black focus:outline-none focus:border-gray-400 placeholder-gray-300"
                      disabled={isRefining}
                    />
                    <button
                      onClick={handleRefine}
                      disabled={isRefining || !refinementInput.trim()}
                      className={`text-xs font-semibold rounded-lg px-4 py-2 transition-colors whitespace-nowrap ${
                        isRefining || !refinementInput.trim()
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-[#0a0a0a] hover:bg-gray-800 text-white'
                      }`}
                    >
                      {isRefining ? 'Refining…' : 'Refine'}
                    </button>
                  </div>
                )}

                {bottomMode === 'query' && (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={queryInput}
                        onChange={(e) => setQueryInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !isQuerying) handleQuery(); }}
                        placeholder='e.g. "What is the budget?" or "Who is the target audience?"'
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-[13px] text-black focus:outline-none focus:border-gray-400 placeholder-gray-300"
                        disabled={isQuerying}
                      />
                      <button
                        onClick={handleQuery}
                        disabled={isQuerying || !queryInput.trim()}
                        className={`text-xs font-semibold rounded-lg px-4 py-2 transition-colors whitespace-nowrap ${
                          isQuerying || !queryInput.trim()
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-[#0a0a0a] hover:bg-gray-800 text-white'
                        }`}
                      >
                        {isQuerying ? 'Asking…' : 'Ask'}
                      </button>
                    </div>
                    {queryResponse && (
                      <div className="mt-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-[12px] text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {queryResponse}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-3 px-3 py-2.5 bg-red-50 border border-red-200 rounded-lg text-[12px] text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
          {generatedText ? (
            <>
              <button
                onClick={handleClose}
                className="text-gray-600 hover:text-black text-xs border border-gray-200 rounded-full px-4 py-1.5 transition-colors"
              >
                Cancel
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
                disabled={isGenerating || isExtracting || !briefInput.trim()}
                className={`text-xs font-semibold rounded-full px-5 py-1.5 transition-colors ${
                  isGenerating || isExtracting || !briefInput.trim()
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-[#fff230] hover:bg-yellow-300 text-black'
                }`}
              >
                {isGenerating ? 'Generating…' : isExtracting ? 'Reading file…' : isDemo() ? 'Preview Example' : 'Generate Scope'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
