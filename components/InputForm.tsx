
import React, { useState } from 'react';
import type { LessonDetails } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { FileIcon } from './icons/FileIcon';
import { XIcon } from './icons/XIcon';
import { InfoIcon } from './icons/InfoIcon';
import { UploadIcon } from './icons/UploadIcon';


interface InputFormProps {
  lessonDetails: LessonDetails;
  setLessonDetails: React.Dispatch<React.SetStateAction<LessonDetails>>;
  sourceFiles: File[];
  setSourceFiles: React.Dispatch<React.SetStateAction<File[]>>;
  onGenerate: () => void;
  isLoading: boolean;
  isExtractingObjectives: boolean;
  isExtractingConcepts: boolean;
  isExtractingActivities: boolean;
  extractionError: string | null;
}

const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};


const InputForm: React.FC<InputFormProps> = ({ 
  lessonDetails, 
  setLessonDetails, 
  sourceFiles, 
  setSourceFiles, 
  onGenerate, 
  isLoading, 
  isExtractingObjectives,
  isExtractingConcepts,
  isExtractingActivities,
  extractionError
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setLessonDetails(prev => ({ ...prev, [name]: value }));
  };

  const processFiles = (files: File[]) => {
    const acceptedTypes = ["application/pdf", "image/png", "image/jpeg"];
    const validFiles = files.filter(file => {
      const fileType = file.type;
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      return acceptedTypes.includes(fileType) || (fileExtension === 'pdf' && fileType === '');
    });

    setSourceFiles(prevFiles => {
      const existingFileNames = new Set(prevFiles.map(f => f.name));
      const uniqueNewFiles = validFiles.filter(f => !existingFileNames.has(f.name));
      return [...prevFiles, ...uniqueNewFiles];
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = [...e.target.files];
      processFiles(newFiles);
      // Reset input value to allow re-uploading the same file
      e.target.value = '';
    }
  };

  const handleFileRemove = (fileToRemove: File) => {
    setSourceFiles(prevFiles => prevFiles.filter(file => file !== fileToRemove));
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
        return;
    }
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = [...e.dataTransfer.files];
      processFiles(newFiles);
      e.dataTransfer.clearData();
    }
  };

  const renderFieldLoader = (text: string) => (
    <div className="absolute inset-0 bg-slate-100/70 flex items-center justify-center rounded-lg backdrop-blur-sm">
      <div className="flex items-center text-sm text-slate-600">
        <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>{text}</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-8">
      
      {/* Step 1 */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-800 flex items-center">
          <span className="bg-indigo-600 text-white rounded-full h-6 w-6 text-sm font-bold inline-flex items-center justify-center mr-3">1</span>
          Nhập chi tiết bài học
        </h2>
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-slate-700 mb-1.5">Chủ đề bài học</label>
          <input
            type="text"
            id="topic"
            name="topic"
            value={lessonDetails.topic}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition"
            placeholder="Nhập vào đây"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="gradeLevel" className="block text-sm font-medium text-slate-700 mb-1.5">Cấp lớp</label>
            <select
              id="gradeLevel"
              name="gradeLevel"
              value={lessonDetails.gradeLevel}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition bg-white"
            >
              {Array.from({ length: 9 }, (_, i) => `Lớp ${i + 1}`).map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="numberOfPeriods" className="block text-sm font-medium text-slate-700 mb-1.5">Số tiết</label>
            <input
              type="number"
              id="numberOfPeriods"
              name="numberOfPeriods"
              value={lessonDetails.numberOfPeriods}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition"
              min="1"
              placeholder="1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="creativity" className="flex items-center text-sm font-medium text-slate-700 mb-1.5">
              Mức độ sáng tạo
              <div className="relative group ml-1.5">
                <InfoIcon className="w-4 h-4 text-slate-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                  Chọn mức độ sáng tạo cho các hoạt động và cách diễn đạt trong kịch bản.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                </div>
              </div>
            </label>
            <select id="creativity" name="creativity" value={lessonDetails.creativity} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition bg-white">
              <option>Thực tế</option>
              <option>Cân bằng</option>
              <option>Sáng tạo cao</option>
            </select>
          </div>
          <div>
            <label htmlFor="verbosity" className="flex items-center text-sm font-medium text-slate-700 mb-1.5">
              Mức độ chi tiết
               <div className="relative group ml-1.5">
                <InfoIcon className="w-4 h-4 text-slate-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-800 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                  Chọn độ dài và mức độ sâu của các giải thích trong kịch bản.
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                </div>
              </div>
            </label>
            <select id="verbosity" name="verbosity" value={lessonDetails.verbosity} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition bg-white">
              <option>Ngắn gọn</option>
              <option>Chi tiết</option>
              <option>Toàn diện</option>
            </select>
          </div>
          <div>
            <label htmlFor="tone" className="flex items-center text-sm font-medium text-slate-700 mb-1.5">
              Giọng điệu
              <div className="relative group ml-1.5">
                <InfoIcon className="w-4 h-4 text-slate-400 cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 bg-slate-800 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-10">
                  Lựa chọn phong cách ngôn ngữ cho kịch bản:
                  <ul className="list-disc list-inside mt-1 space-y-1 text-left">
                    <li><strong>Hấp dẫn:</strong> Thu hút học sinh bằng câu hỏi, trò chơi.</li>
                    <li><strong>Thân thiện:</strong> Dùng ngôn ngữ gần gũi như đang trò chuyện.</li>
                    <li><strong>Kể chuyện:</strong> Dẫn dắt bài học như một câu chuyện.</li>
                    <li><strong>Gợi mở:</strong> Đặt câu hỏi mở để kích thích tư duy.</li>
                    <li><strong>Đơn giản:</strong> Diễn đạt dễ hiểu, tập trung vào hình ảnh.</li>
                    <li><strong>Vui nhộn:</strong> Thêm yếu tố hài hước, tạo không khí vui vẻ.</li>
                    <li><strong>Khoa học:</strong> Dùng thuật ngữ chính xác, cấu trúc logic.</li>
                    <li><strong>Hướng dẫn:</strong> Trình bày từng bước rõ ràng, dễ làm theo.</li>
                  </ul>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                </div>
              </div>
            </label>
            <select
              id="tone"
              name="tone"
              value={lessonDetails.tone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition bg-white"
            >
              <option>Hấp dẫn và Tương tác</option>
              <option>Thân thiện và Gần gũi</option>
              <option>Kể chuyện và Gợi cảm hứng</option>
              <option>Khám phá và Gợi mở</option>
              <option>Đơn giản và Trực quan</option>
              <option>Hài hước và Vui nhộn</option>
              <option>Trang trọng và Khoa học</option>
              <option>Hướng dẫn chi tiết, từng bước</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="objectives" className="block text-sm font-medium text-slate-700 mb-1.5">Mục tiêu học tập</label>
          <div className="relative">
            <textarea id="objectives" name="objectives" value={lessonDetails.objectives} onChange={handleChange} rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition disabled:bg-slate-100 disabled:cursor-not-allowed" placeholder="Nhập vào đây hoặc tải tệp lên để AI tự động trích xuất" disabled={isExtractingObjectives}/>
            {isExtractingObjectives && renderFieldLoader('Đang trích xuất mục tiêu...')}
          </div>
           <p className="text-xs text-slate-500 mt-1.5">Nội dung do AI tạo ra có thể được chỉnh sửa lại tại đây.</p>
        </div>
        
        <div>
          <label htmlFor="keyConcepts" className="block text-sm font-medium text-slate-700 mb-1.5">Nội dung chính của bài</label>
          <div className="relative">
            <textarea id="keyConcepts" name="keyConcepts" value={lessonDetails.keyConcepts} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition disabled:bg-slate-100 disabled:cursor-not-allowed" placeholder="Nhập vào đây hoặc tải tệp lên để AI tự động trích xuất" disabled={isExtractingConcepts} />
            {isExtractingConcepts && renderFieldLoader('Đang trích xuất nội dung...')}
          </div>
          <p className="text-xs text-slate-500 mt-1.5">Nội dung do AI tạo ra có thể được chỉnh sửa lại tại đây.</p>
        </div>

        <div>
          <label htmlFor="activities" className="block text-sm font-medium text-slate-700 mb-1.5">Gợi ý Hoạt động trong lớp</label>
          <div className="relative">
            <textarea id="activities" name="activities" value={lessonDetails.activities} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-500 transition disabled:bg-slate-100 disabled:cursor-not-allowed" placeholder="Nhập vào đây hoặc tải tệp lên để AI tự động gợi ý" disabled={isExtractingActivities} />
            {isExtractingActivities && renderFieldLoader('Đang gợi ý hoạt động...')}
          </div>
          <p className="text-xs text-slate-500 mt-1.5">Nội dung do AI tạo ra có thể được chỉnh sửa lại tại đây.</p>
        </div>
      </div>

      {/* Step 2 */}
      <div 
        className="space-y-4 relative"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <h2 className="text-xl font-semibold text-slate-800 flex items-center">
            <span className="bg-indigo-600 text-white rounded-full h-6 w-6 text-sm font-bold inline-flex items-center justify-center mr-3">2</span>
            Tải lên tài liệu 
            <span className="text-base font-normal text-slate-500 ml-2">(Tùy chọn)</span>
        </h2>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-sm text-slate-600 mb-3">
              Cung cấp giáo án, trang sách, hoặc hình ảnh (PDF, PNG, JPG) để AI có thêm ngữ cảnh và tạo ra kịch bản chính xác hơn.
            </p>
             <label htmlFor="file-upload" className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-colors">
                <UploadIcon className="w-5 h-5 mr-2 text-slate-500" />
                <span>Chọn tệp hoặc kéo thả</span>
            </label>
            <input 
                type="file" 
                id="file-upload" 
                multiple 
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf, image/png, image/jpeg"
            />
        </div>
        
        {isDragging && (
          <div className="absolute inset-0 bg-indigo-500/10 border-2 border-dashed border-indigo-600 rounded-2xl pointer-events-none flex items-center justify-center">
            <p className="font-semibold text-indigo-600">Thả tệp vào đây để tải lên</p>
          </div>
        )}

        {extractionError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {extractionError}
          </div>
        )}

        {sourceFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="text-sm font-medium text-slate-700">Tệp đã tải lên:</h3>
            {sourceFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <FileIcon className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-sm text-slate-800 truncate font-medium">{file.name}</p>
                    <p className="text-xs text-slate-500">{formatBytes(file.size)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleFileRemove(file)}
                  className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition"
                  aria-label={`Xóa tệp ${file.name}`}
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Step 3 */}
      <div>
         <h2 className="text-xl font-semibold text-slate-800 flex items-center mb-4">
            <span className="bg-indigo-600 text-white rounded-full h-6 w-6 text-sm font-bold inline-flex items-center justify-center mr-3">3</span>
            Bắt đầu tạo
        </h2>
        <button
          onClick={onGenerate}
          disabled={isLoading || isExtractingObjectives || isExtractingConcepts || isExtractingActivities}
          className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 transition-all duration-300 ease-in-out flex items-center justify-center disabled:bg-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang xử lý...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5 mr-2" />
              Tạo kịch bản
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputForm;
