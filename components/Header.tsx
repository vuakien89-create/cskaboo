import React from 'react';
import { LogoIcon } from './icons/LogoIcon';

const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <LogoIcon className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                Tạo kịch bản bài giảng V1 ( thử nghiệm)
              </h1>
              <p className="text-xs text-slate-500">Trợ lý AI dành cho giáo viên hiện đại</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;