import React, { useState, useEffect, useRef } from 'react';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { SlideshowIcon } from './icons/SlideshowIcon';
import { EditIcon } from './icons/EditIcon';
import SlidesViewer from './SlidesViewer';
import type { Slide } from '../types';

interface OutputDisplayProps {
  script: string;
  isLoading: boolean;
  error: string | null;
  topic: string;
  slides: Slide[];
  isGeneratingSlides: boolean;
  slideError: string | null;
  onGenerateSlides: () => void;
  onScriptUpdate: (updatedScript: string) => void;
}

const OutputDisplay: React.FC<OutputDisplayProps> = ({ 
  script, 
  isLoading, 
  error, 
  topic,
  slides,
  isGeneratingSlides,
  slideError,
  onGenerateSlides,
  onScriptUpdate
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'script' | 'slides'>('script');
  const [isEditing, setIsEditing] = useState(false);
  const [editedScript, setEditedScript] = useState(script);
  const scriptContainerRef = useRef<HTMLDivElement>(null);
  
  const [progress, setProgress] = useState(0);
  const [progressTitle, setProgressTitle] = useState('');
  const [progressSubtitle, setProgressSubtitle] = useState('');

  useEffect(() => {
    // When the script from props changes (e.g., new generation),
    // update the local edited script and exit editing mode.
    setEditedScript(script);
    setIsEditing(false);
  }, [script]);

  // Effect for a more realistic progress bar
  useEffect(() => {
    const isWorking = isLoading || isGeneratingSlides;
    let intervalId: number | undefined;

    if (isWorking) {
        let title = '';
        let subtitle = '';
        let estimatedDuration = 10000; // Default 10s

        if (isLoading) {
            title = 'Đang tạo kịch bản của bạn...';
            subtitle = 'AI đang soạn những lời hoàn hảo cho bài học của bạn.';
            estimatedDuration = 15000; // 15 seconds for script generation
        } else if (isGeneratingSlides) {
            title = 'Đang tạo slides...';
            subtitle = 'AI đang phân tích kịch bản để tạo dàn bài.';
            estimatedDuration = 8000; // 8 seconds for slide generation
        }
        
        setProgressTitle(title);
        setProgressSubtitle(subtitle);
        setProgress(0);

        const intervalTime = 50; // Update every 50ms for smooth animation
        const increment = 100 / (estimatedDuration / intervalTime);

        intervalId = window.setInterval(() => {
            setProgress(oldProgress => {
                if (oldProgress >= 95) {
                    clearInterval(intervalId as number);
                    return 95;
                }
                return Math.min(oldProgress + increment, 95);
            });
        }, intervalTime);
    }

    return () => {
        if (intervalId) {
            clearInterval(intervalId);
        }
    };
}, [isLoading, isGeneratingSlides]);

  const handleCopy = async () => {
    if (!scriptContainerRef.current) return;

    const htmlContent = scriptContainerRef.current.innerHTML;
    const plainTextContent = scriptContainerRef.current.innerText;

    const styledHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body { font-family: Calibri, sans-serif; font-size: 11pt; color: #333; }
                h2 { font-size: 18pt; font-weight: bold; text-align: center; color: #1E293B; margin-top: 20px; margin-bottom: 15px; }
                h3 { font-size: 14pt; font-weight: bold; color: #4338CA; margin-top: 20px; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #E2E8F0; }
                table { border-collapse: collapse; width: 100%; margin-bottom: 15px; border: 1px solid #E2E8F0; }
                th, td { border: 1px solid #E2E8F0; padding: 8px 12px; text-align: left; vertical-align: top; }
                th { background-color: #F8FAFC; font-weight: bold; color: #1E293B; }
                td { line-height: 1.5; color: #4B5563; }
                strong { font-weight: bold; }
                ul { list-style-type: disc; margin-left: 20px; }
                li { margin-bottom: 5px; }
            </style>
        </head>
        <body>
            ${htmlContent}
        </body>
        </html>
    `;

    try {
        const htmlBlob = new Blob([styledHtml], { type: 'text/html' });
        const textBlob = new Blob([plainTextContent], { type: 'text/plain' });
        const clipboardItem = new ClipboardItem({
            'text/html': htmlBlob,
            'text/plain': textBlob,
        });
        await navigator.clipboard.write([clipboardItem]);
        
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    } catch (err) {
        console.error('Không thể sao chép dưới dạng rich text, đang thử lại với văn bản thuần:', err);
        try {
            await navigator.clipboard.writeText(plainTextContent);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (fallbackErr) {
            console.error('Sao chép văn bản thuần cũng thất bại:', fallbackErr);
            alert('Không thể sao chép vào clipboard.');
        }
    }
  };
  
  const getFileName = (baseName: string) => {
    return `${baseName}-${topic.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'bai-giang'}.txt`;
  }

  const handleDownloadScript = () => {
    const blob = new Blob([`Chủ đề: ${topic}\n\n` + script], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = getFileName('kich-ban');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const handleDownloadSlides = () => {
    let content = `Chủ đề: ${topic}\n\n`;
    slides.forEach((slide, index) => {
        // Slide Header
        content += `--- SLIDE ${index + 1}: ${slide.title} ---\n\n`;

        // Content
        content += `[ NỘI DUNG ]\n`;
        if (slide.content && slide.content.length > 0) {
            slide.content.forEach(point => {
                content += `- ${point}\n`;
            });
        } else {
            content += "(Không có nội dung)\n";
        }
        content += `\n`;

        // Speaker Notes
        if (slide.speakerNotes) {
            content += `[ GHI CHÚ CHO NGƯỜI TRÌNH BÀY ]\n`;
            content += `${slide.speakerNotes}\n\n`;
        }

        // Visual Suggestion
        if (slide.visualSuggestion) {
            content += `[ GỢI Ý HÌNH ẢNH ]\n`;
            content += `  Gợi ý: ${slide.visualSuggestion.suggestion}\n`;
            content += `  Lý do: ${slide.visualSuggestion.rationale}\n\n`;
        }
        
        // Separator
        content += `==================================================\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = getFileName('slides');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const handleSaveChanges = () => {
    onScriptUpdate(editedScript);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedScript(script); // Revert local changes
    setIsEditing(false);
  };
  
  const renderProgressBar = () => (
    <div className="w-full max-w-md mx-auto">
       <p className="text-lg font-semibold text-slate-800 mb-2">{progressTitle}</p>
       <p className="text-sm text-slate-500 mb-6">{progressSubtitle}</p>
       <div className="relative h-4 w-full bg-indigo-100 rounded-full overflow-hidden">
         <div 
           style={{ width: `${progress}%` }} 
           className="absolute top-0 left-0 h-full bg-indigo-500 rounded-full transition-all duration-500 ease-out"
         ></div>
         <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
           <span className={`text-xs font-bold transition-colors duration-300 ${progress < 45 ? 'text-indigo-800' : 'text-white'}`}>
             {Math.round(progress)}%
           </span>
         </div>
       </div>
    </div>
  );

  const renderScriptContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
          {renderProgressBar()}
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-red-700 bg-red-50 p-6 rounded-lg border border-red-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-semibold">Đã xảy ra lỗi</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      );
    }
    if (isEditing) {
      return (
        <div className="flex flex-col h-full">
            <textarea
                value={editedScript}
                onChange={(e) => setEditedScript(e.target.value)}
                className="w-full flex-grow bg-slate-50 border border-slate-300 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow text-base leading-relaxed font-mono"
                aria-label="Trình chỉnh sửa kịch bản"
                style={{ minHeight: '400px' }}
            />
        </div>
      );
    }
    if (script) {
      const renderInlineMarkdown = (text: string): React.ReactNode => {
        const parts = text.split(/(\*\*.*?\*\*)/g).filter(Boolean);
        return parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.substring(2, part.length - 2)}</strong>;
          }
          return part;
        });
      };

      const renderCellContent = (text: string): React.ReactNode => {
        return text.split(/<br\s*\/?>/i).map((line, lineIndex, arr) => {
          const lineContent = renderInlineMarkdown(line);
          if (lineIndex < arr.length - 1) {
            return <React.Fragment key={lineIndex}>{lineContent}<br /></React.Fragment>;
          }
          return <React.Fragment key={lineIndex}>{lineContent}</React.Fragment>;
        });
      };
      
      const lines = script.split('\n');
      const elements: React.ReactElement[] = [];
      let tableRows: string[][] = [];
      let listItems: string[] = [];

      const flushTable = () => {
        if (tableRows.length < 1) return;
        const header = tableRows[0];
        const body = tableRows.slice(1);
        elements.push(
          <div key={`table-${elements.length}`} className="overflow-x-auto my-6 rounded-lg border border-slate-200 shadow-sm">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr>
                  {header.map((cell, cellIndex) => (
                    <th key={cellIndex} className="w-1/2 px-4 py-3 text-left text-sm font-semibold text-slate-700 border-b-2 border-slate-200">{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {body.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-slate-50">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3 text-sm text-slate-600 leading-relaxed align-top whitespace-pre-wrap">
                        {renderCellContent(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      };

      const flushList = () => {
        if (listItems.length < 1) return;
        elements.push(
          <ul key={`list-${elements.length}`} className="list-disc list-inside space-y-2 my-4 pl-5">
            {listItems.map((item, itemIndex) => (
              <li key={itemIndex} className="text-slate-600 leading-relaxed">
                {renderInlineMarkdown(item)}
              </li>
            ))}
          </ul>
        );
        listItems = [];
      };

      lines.forEach((line) => {
        const trimmedLine = line.trim();

        if (trimmedLine.startsWith('|')) {
          flushList();
          if (trimmedLine.includes('---')) return;
          const cells = trimmedLine.split('|').slice(1, -1).map(cell => cell.trim());
          tableRows.push(cells);
        } else if (trimmedLine.startsWith('* ') || trimmedLine.startsWith('- ')) {
          flushTable();
          listItems.push(trimmedLine.substring(trimmedLine.indexOf(' ') + 1));
        } else {
          flushTable();
          flushList();
          
          if (!trimmedLine) return; // Skip empty lines

          if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
            elements.push(<h3 key={elements.length} className="text-xl font-bold text-indigo-700 mt-8 mb-4 pb-2 border-b border-slate-200">{trimmedLine.replaceAll('**', '')}</h3>);
          } else {
            elements.push(<p key={elements.length} className="my-2">{renderInlineMarkdown(trimmedLine)}</p>);
          }
        }
      });
  
      flushTable();
      flushList();
  
      return <div className="max-w-none" ref={scriptContainerRef}>{elements}</div>;
    }
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-8">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-5">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
           </svg>
        </div>
        <p className="font-semibold text-slate-700 text-lg">Kịch bản của bạn sẽ xuất hiện ở đây</p>
        <p className="text-sm mt-1 max-w-xs mx-auto">Hoàn thành các bước bên trái và nhấp vào "Tạo kịch bản" để bắt đầu.</p>
      </div>
    );
  };
  
  const renderSlidesContent = () => {
    if (isGeneratingSlides) {
       return (
        <div className="flex flex-col items-center justify-center h-full text-center text-slate-500">
          {renderProgressBar()}
        </div>
      );
    }
    
    if (slideError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center text-red-700 bg-red-50 p-6 rounded-lg border border-red-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="font-semibold">Không thể tạo Slides</p>
          <p className="text-sm mt-1">{slideError}</p>
        </div>
      );
    }
    
    if (slides.length > 0) {
      return <SlidesViewer slides={slides} />;
    }
    
    return (
       <div className="flex flex-col items-center justify-center h-full text-center text-slate-500 p-8">
        <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-5">
            <SlideshowIcon className="h-10 w-10 text-indigo-300" />
        </div>
        <p className="font-semibold text-slate-700 text-lg">Tạo dàn bài trình bày</p>
        <p className="text-sm mt-2 max-w-sm mx-auto">Sử dụng AI để tự động tạo các slide thuyết trình từ kịch bản của bạn, giúp bạn tiết kiệm thời gian chuẩn bị.</p>
        <button
            onClick={onGenerateSlides}
            disabled={isGeneratingSlides}
            className="mt-6 bg-indigo-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all duration-300 ease-in-out flex items-center justify-center disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
        >
            <SlideshowIcon className="w-5 h-5 mr-2" />
            Tạo Slides
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col min-h-[500px] lg:min-h-[85vh] sticky top-20">
       <div className="px-4 pt-2 border-b border-slate-200 flex justify-between items-center flex-shrink-0">
        <div className="flex items-center space-x-2">
            <button 
                onClick={() => setActiveTab('script')}
                className={`py-3 px-4 font-medium text-sm transition-colors ${activeTab === 'script' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Kịch bản
            </button>
            {script && !error && !isLoading && (
                 <button 
                    onClick={() => setActiveTab('slides')}
                    className={`py-3 px-4 font-medium text-sm transition-colors ${activeTab === 'slides' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Slides
                </button>
            )}
        </div>
        <div className="flex items-center space-x-2">
            {activeTab === 'script' && script && !isLoading && !error && !isEditing && (
                <>
                    <button 
                        onClick={() => setIsEditing(true)}
                        className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium py-1.5 px-3 rounded-lg flex items-center transition-colors text-sm"
                        aria-label="Chỉnh sửa kịch bản"
                    >
                        <EditIcon className="w-4 h-4 mr-2" />
                        Chỉnh sửa
                    </button>
                    <button 
                        onClick={handleDownloadScript}
                        className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium py-1.5 px-3 rounded-lg flex items-center transition-colors text-sm"
                        aria-label="Tải xuống kịch bản"
                    >
                        <DownloadIcon className="w-4 h-4 mr-2" />
                        Tải xuống
                    </button>
                    <button 
                    onClick={handleCopy}
                    className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium py-1.5 px-3 rounded-lg flex items-center transition-colors text-sm w-28 justify-center"
                    aria-label="Sao chép kịch bản"
                    >
                    <ClipboardIcon className="w-4 h-4 mr-2" />
                    {copied ? 'Đã sao chép!' : 'Sao chép'}
                    </button>
                </>
            )}
             {activeTab === 'slides' && slides.length > 0 && !isGeneratingSlides && !slideError && (
                 <button 
                    onClick={handleDownloadSlides}
                    className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium py-1.5 px-3 rounded-lg flex items-center transition-colors text-sm"
                    aria-label="Tải xuống slides"
                >
                    <DownloadIcon className="w-4 h-4 mr-2" />
                    Tải xuống Slides
                </button>
            )}
        </div>
       </div>
       <div className={`flex-grow overflow-y-auto ${activeTab === 'slides' ? 'bg-slate-50' : ''}`}>
         <div className={`${activeTab === 'script' ? 'p-6 lg:p-8' : ''} h-full`}>
            {activeTab === 'script' ? renderScriptContent() : renderSlidesContent()}
         </div>
       </div>
       {activeTab === 'script' && isEditing && (
          <div className="flex-shrink-0 p-4 border-t border-slate-200 bg-white/80 backdrop-blur-sm flex justify-end space-x-3">
            <button 
                onClick={handleCancelEdit}
                className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
            >
                Hủy
            </button>
            <button 
                onClick={handleSaveChanges}
                className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all"
            >
                Lưu thay đổi
            </button>
          </div>
        )}
    </div>
  );
};

export default OutputDisplay;