import React, { useState } from 'react';
import { 
  XMarkIcon, 
  DocumentTextIcon, 
  DocumentArrowDownIcon,
  ShareIcon,
  ClipboardIcon
} from '@heroicons/react/24/outline';
import { DataService } from '../utils/dataService';

const ExportModal = ({ isOpen, onClose, meetingData, clientName, meetingDate }) => {
  const [exportFormat, setExportFormat] = useState('markdown');
  const [includeOptions, setIncludeOptions] = useState({
    bigWins: true,
    scorecard: true,
    todoRecap: true,
    campaigns: true,
    ids: true,
    headlines: true,
    newTodos: true,
    meetingScore: true
  });
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateExport = () => {
    // Filter data based on selected options
    const filteredData = {
      bigWins: includeOptions.bigWins ? meetingData.bigWins : '',
      scorecard: includeOptions.scorecard ? meetingData.scorecard : [],
      todoRecap: includeOptions.todoRecap ? meetingData.todoRecap : [],
      campaigns: includeOptions.campaigns ? meetingData.campaigns : [],
      ids: includeOptions.ids ? meetingData.ids : { identify: '', discuss: '', solve: '' },
      headlines: includeOptions.headlines ? meetingData.headlines : { nextMeetingDate: '', teamUpdates: '' },
      newTodos: includeOptions.newTodos ? meetingData.newTodos : [],
      meetingScore: includeOptions.meetingScore ? meetingData.meetingScore : 0
    };

    if (exportFormat === 'markdown') {
      return DataService.export.generateSummary(filteredData, clientName, meetingDate);
    } else {
      return JSON.stringify({
        client: clientName,
        meetingDate,
        data: filteredData,
        exportedAt: new Date().toISOString()
      }, null, 2);
    }
  };

  const handleDownload = () => {
    const content = generateExport();
    const extension = exportFormat === 'markdown' ? 'md' : 'json';
    const filename = `cmo-meeting-${clientName.toLowerCase().replace(/\s+/g, '-')}-${meetingDate}.${extension}`;
    
    if (exportFormat === 'markdown') {
      DataService.export.downloadAsText(content, filename);
    } else {
      DataService.export.downloadAsJson(JSON.parse(content), filename);
    }
  };

  const handleCopyToClipboard = async () => {
    const content = generateExport();
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const toggleAllSections = (value) => {
    setIncludeOptions(Object.fromEntries(
      Object.keys(includeOptions).map(key => [key, value])
    ));
  };

  const sectionLabels = {
    bigWins: 'Big Wins',
    scorecard: 'Scorecard',
    todoRecap: 'To-do Recap',
    campaigns: 'Campaign Progress',
    ids: 'IDS (Identify, Discuss, Solve)',
    headlines: 'Headlines & Admin',
    newTodos: 'New To-dos',
    meetingScore: 'Meeting Score'
  };

  const preview = generateExport();
  const isMarkdown = exportFormat === 'markdown';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <ShareIcon className="h-6 w-6 mr-2 text-blue-600" />
              Export Meeting Summary
            </h2>
            <p className="text-gray-600 mt-1">
              {clientName} • {new Date(meetingDate).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-full">
          {/* Options Panel */}
          <div className="w-80 border-r border-gray-200 p-6 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Export Options</h3>
            
            {/* Format Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="markdown"
                    checked={exportFormat === 'markdown'}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="mr-2 text-blue-600"
                  />
                  <DocumentTextIcon className="h-4 w-4 mr-1" />
                  Markdown (.md)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="json"
                    checked={exportFormat === 'json'}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="mr-2 text-blue-600"
                  />
                  <DocumentArrowDownIcon className="h-4 w-4 mr-1" />
                  JSON Data (.json)
                </label>
              </div>
            </div>

            {/* Section Selection */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Include Sections
                </label>
                <div className="text-xs space-x-2">
                  <button
                    onClick={() => toggleAllSections(true)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={() => toggleAllSections(false)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    None
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Object.entries(sectionLabels).map(([key, label]) => (
                  <label key={key} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={includeOptions[key]}
                      onChange={(e) => setIncludeOptions({
                        ...includeOptions,
                        [key]: e.target.checked
                      })}
                      className="mr-2 text-blue-600"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>

            {/* Export Actions */}
            <div className="space-y-3">
              <button
                onClick={handleDownload}
                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Download File
              </button>
              
              <button
                onClick={handleCopyToClipboard}
                className={`w-full flex items-center justify-center px-4 py-2 border rounded-md transition-colors ${
                  copied 
                    ? 'bg-green-50 border-green-200 text-green-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ClipboardIcon className="h-4 w-4 mr-2" />
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="flex-1 p-6 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Preview</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 border">
              {isMarkdown ? (
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {preview}
                </pre>
              ) : (
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {preview}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;