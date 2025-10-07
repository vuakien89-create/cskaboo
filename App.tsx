
import React, { useState, useCallback, useEffect } from 'react';
import type { LessonDetails, Slide } from './types';
import { generatePresentationScript, extractObjectivesFromFiles, extractKeyConceptsFromFiles, extractActivitiesFromFiles, generateSlidesFromScript } from './services/geminiService';
import Header from './components/Header';
import InputForm from './components/InputForm';
import OutputDisplay from './components/OutputDisplay';

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
        if (typeof reader.result === 'string') {
            const base64Data = reader.result.split(',')[1];
            if (base64Data) {
                resolve(base64Data);
            } else {
                 reject(new Error(`Không thể trích xuất dữ liệu base64 từ tệp "${file.name}".`));
            }
        } else {
            reject(new Error(`Không thể đọc tệp "${file.name}" dưới dạng URL dữ liệu.`));
        }
    };
    reader.onerror = () => {
      const errorMessage = reader.error?.message || `Lỗi không xác định khi đọc tệp "${file.name}".`;
      reject(new Error(errorMessage));
    };
});


const App: React.FC = () => {
  const [lessonDetails, setLessonDetails] = useState<LessonDetails>({
    topic: '',
    gradeLevel: 'Lớp 5',
    numberOfPeriods: '1',
    objectives: '',
    keyConcepts: '',
    tone: 'Hấp dẫn và Tương tác',
    activities: '',
    creativity: 'Cân bằng',
    verbosity: 'Chi tiết',
  });
  const [sourceFiles, setSourceFiles] = useState<File[]>([]);
  const [scriptContent, setScriptContent] = useState<string>('');
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGeneratingSlides, setIsGeneratingSlides] = useState<boolean>(false);
  const [isExtractingObjectives, setIsExtractingObjectives] = useState<boolean>(false);
  const [isExtractingConcepts, setIsExtractingConcepts] = useState<boolean>(false);
  const [isExtractingActivities, setIsExtractingActivities] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [slideError, setSlideError] = useState<string | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  useEffect(() => {
    if (sourceFiles.length === 0) {
      setExtractionError(null);
      return;
    }

    const extractData = async () => {
      setIsExtractingObjectives(true);
      setIsExtractingConcepts(true);
      setIsExtractingActivities(true);
      setExtractionError(null);
      try {
        const fileDataPromises = sourceFiles.map(async (file) => ({
          mimeType: file.type,
          data: await toBase64(file),
        }));
        const files = await Promise.all(fileDataPromises);
        
        const [extractedObjectives, extractedConcepts, extractedActivities] = await Promise.all([
            extractObjectivesFromFiles(files),
            extractKeyConceptsFromFiles(files),
            extractActivitiesFromFiles(files, lessonDetails)
        ]);

        setLessonDetails(prev => ({ 
            ...prev, 
            objectives: extractedObjectives || prev.objectives,
            keyConcepts: extractedConcepts || prev.keyConcepts,
            activities: extractedActivities || prev.activities,
        }));

      } catch (err) {
        console.error("Failed to extract data from files:", err);
        const message = err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định khi phân tích tệp.";
        setExtractionError(`Không thể phân tích tệp: ${message}. Vui lòng thử lại với tệp khác hoặc điền thủ công.`);
      } finally {
        setIsExtractingObjectives(false);
        setIsExtractingConcepts(false);
        setIsExtractingActivities(false);
      }
    };

    extractData();
  }, [sourceFiles]);

  const handleGenerateScript = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setScriptContent('');
    setSlides([]);
    setSlideError(null);
    try {
      let script: string;
      if (sourceFiles.length > 0) {
        const fileDataPromises = sourceFiles.map(async (file) => {
          const base64Data = await toBase64(file);
          return {
            mimeType: file.type,
            data: base64Data,
          };
        });
        const files = await Promise.all(fileDataPromises);
        script = await generatePresentationScript(lessonDetails, files);
      } else {
        script = await generatePresentationScript(lessonDetails);
      }
      setScriptContent(script);
    // FIX: Added curly braces around the catch block to fix a syntax error. This resolves all reported errors.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, [lessonDetails, sourceFiles]);

  const handleScriptUpdate = useCallback((updatedScript: string) => {
    setScriptContent(updatedScript);
    setSlides([]); // Invalidate existing slides
    setSlideError(null);
  }, []);
  
  const handleGenerateSlides = useCallback(async () => {
    if (!scriptContent) return;
    setIsGeneratingSlides(true);
    setSlideError(null);
    setSlides([]);
    try {
        const generatedSlides = await generateSlidesFromScript(scriptContent);
        setSlides(generatedSlides);
    } catch (err) {
        setSlideError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định khi tạo slides.');
    } finally {
        setIsGeneratingSlides(false);
    }
}, [scriptContent]);


  return (
    <div className="min-h-screen bg-slate-50 font-sans text-gray-800">
      <Header />
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[3fr_4fr] gap-8 items-start">
          <InputForm
            lessonDetails={lessonDetails}
            setLessonDetails={setLessonDetails}
            sourceFiles={sourceFiles}
            setSourceFiles={setSourceFiles}
            onGenerate={handleGenerateScript}
            isLoading={isLoading}
            isExtractingObjectives={isExtractingObjectives}
            isExtractingConcepts={isExtractingConcepts}
            isExtractingActivities={isExtractingActivities}
            extractionError={extractionError}
          />
          <OutputDisplay
            script={scriptContent}
            isLoading={isLoading}
            error={error}
            topic={lessonDetails.topic}
            slides={slides}
            isGeneratingSlides={isGeneratingSlides}
            onGenerateSlides={handleGenerateSlides}
            slideError={slideError}
            onScriptUpdate={handleScriptUpdate}
          />
        </div>
      </main>
      <footer className="text-center py-8 text-slate-500 text-sm">
        <p>Một công cụ mạnh mẽ dành cho giáo viên, phát triển bởi Gemini API.</p>
      </footer>
    </div>
  );
};

export default App;
