import React, { useState, useEffect } from 'react';
import type { Slide } from '../types';
import { NotesIcon } from './icons/NotesIcon';
import { ImageIcon } from './icons/ImageIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface SlidesViewerProps {
  slides: Slide[];
}

const SlidesViewer: React.FC<SlidesViewerProps> = ({ slides }) => {
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [activeDetailTab, setActiveDetailTab] = useState<'notes' | 'visual'>('notes');
  const [animationClass, setAnimationClass] = useState('animate-slideIn');

  useEffect(() => {
    // Reset to the first slide when the slides data changes
    setSelectedSlideIndex(0);
  }, [slides]);
  
  useEffect(() => {
    // When the selected slide changes, reset the active tab back to 'notes'
    if (slides[selectedSlideIndex]?.speakerNotes) {
      setActiveDetailTab('notes');
    } else if (slides[selectedSlideIndex]?.visualSuggestion) {
      setActiveDetailTab('visual');
    }
  }, [selectedSlideIndex, slides]);
  
  const selectedSlide = slides[selectedSlideIndex];
  
  const goToNext = () => {
    if (selectedSlideIndex < slides.length - 1) {
      setAnimationClass('animate-slideOut');
      setTimeout(() => {
        setSelectedSlideIndex(prev => prev + 1);
        setAnimationClass('animate-slideIn');
      }, 150);
    }
  };

  const goToPrevious = () => {
    if (selectedSlideIndex > 0) {
      setAnimationClass('animate-slideOut');
      setTimeout(() => {
        setSelectedSlideIndex(prev => prev - 1);
        setAnimationClass('animate-slideIn');
      }, 150);
    }
  };

  if (!selectedSlide) {
    return null; // Should not happen if slides array is not empty
  }

  const isFirstSlide = selectedSlideIndex === 0;
  const isLastSlide = selectedSlideIndex === slides.length - 1;

  return (
    <div className="flex flex-col h-full p-4 md:p-6 lg:p-10 justify-center">
      <div className="flex-grow flex flex-col min-h-0">
          <div className={`bg-white rounded-xl shadow-lg border border-slate-200 w-full max-w-5xl mx-auto flex flex-col h-full ${animationClass}`}>
            <div className="overflow-y-auto p-6 md:p-8">
                {/* Slide Title */}
                <p className="text-sm font-semibold text-indigo-600 mb-2">SLIDE {selectedSlideIndex + 1} / {slides.length}</p>
                <h2 className="text-3xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-200">{selectedSlide.title}</h2>

                {/* Main Content */}
                <div className="space-y-3 mb-8 min-h-[150px]">
                    {selectedSlide.content && selectedSlide.content.map((point, pointIndex) => (
                      <div key={pointIndex} className="flex items-start">
                        <span className="text-indigo-500 mr-3 mt-1 text-lg">&#9670;</span>
                        <p className="text-slate-700 text-lg leading-relaxed">{point}</p>
                      </div>
                    ))}
                </div>
                
                {/* Presenter Details Panel with Tabs */}
                {(selectedSlide.speakerNotes || selectedSlide.visualSuggestion) && (
                  <div className="mt-8 pt-6 border-t border-slate-200/80">
                    <div className="flex border-b border-slate-200 -mx-1">
                      {selectedSlide.speakerNotes && (
                        <button
                          onClick={() => setActiveDetailTab('notes')}
                          className={`flex items-center text-sm font-semibold px-4 py-2.5 mx-1 transition-colors duration-200 outline-none ${
                            activeDetailTab === 'notes'
                              ? 'border-b-2 border-indigo-600 text-indigo-600'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <NotesIcon className="w-5 h-5 mr-2" />
                          Ghi chú cho người trình bày
                        </button>
                      )}
                      {selectedSlide.visualSuggestion && (
                        <button
                          onClick={() => setActiveDetailTab('visual')}
                          className={`flex items-center text-sm font-semibold px-4 py-2.5 mx-1 transition-colors duration-200 outline-none ${
                            activeDetailTab === 'visual'
                              ? 'border-b-2 border-indigo-600 text-indigo-600'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <ImageIcon className="w-5 h-5 mr-2" />
                          Gợi ý hình ảnh
                        </button>
                      )}
                    </div>
                    <div className="pt-5 min-h-[100px]">
                      {activeDetailTab === 'notes' && selectedSlide.speakerNotes && (
                        <div className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
                            {selectedSlide.speakerNotes}
                        </div>
                      )}
                      {activeDetailTab === 'visual' && selectedSlide.visualSuggestion && (
                        <div>
                            <blockquote className="space-y-2">
                                <p className="text-slate-700 font-medium text-sm italic">"{selectedSlide.visualSuggestion.suggestion}"</p>
                                <p className="text-slate-600 leading-relaxed text-sm pt-2 pl-3 border-l-2 border-slate-200">{selectedSlide.visualSuggestion.rationale}</p>
                            </blockquote>
                        </div>
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>
      </div>

      {/* Navigation */}
      <div className="flex-shrink-0 flex items-center justify-center space-x-4 pt-6 w-full max-w-5xl mx-auto">
         <button
            onClick={goToPrevious}
            disabled={isFirstSlide}
            className="flex items-center justify-center p-3 rounded-full bg-white border border-slate-300 shadow-sm hover:bg-slate-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
            aria-label="Slide trước"
         >
            <ChevronLeftIcon className="w-5 h-5" />
         </button>

         <span className="font-medium text-slate-600 text-sm tabular-nums">
            {selectedSlideIndex + 1} / {slides.length}
         </span>

         <button
            onClick={goToNext}
            disabled={isLastSlide}
            className="flex items-center justify-center p-3 rounded-full bg-white border border-slate-300 shadow-sm hover:bg-slate-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
            aria-label="Slide tiếp theo"
         >
            <ChevronRightIcon className="w-5 h-5" />
         </button>
      </div>

      <style>{`
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(10px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-slideIn {
            animation: slideIn 0.3s ease-out forwards;
          }
          @keyframes slideOut {
            from { opacity: 1; transform: translateY(0) scale(1); }
            to { opacity: 0; transform: translateY(-10px) scale(0.98); }
          }
          .animate-slideOut {
            animation: slideOut 0.15s ease-in forwards;
          }
        `}</style>
    </div>
  );
};

export default SlidesViewer;
