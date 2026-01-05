import React from 'react';
import { Card, CardContent } from './ui/card';
import { Leaf } from 'lucide-react';

const Preloader = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <Card className="p-8 max-w-md mx-auto">
        <CardContent className="flex flex-col items-center space-y-6">
          {/* Animated Logo */}
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-200"></div>
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-green-600 absolute top-0 left-0"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Leaf className="h-6 w-6 text-green-600 animate-pulse" />
            </div>
          </div>
          
          {/* Loading Text */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Atlas Genesis
            </h3>
            <p className="text-gray-600">{message}</p>
          </div>
          
          {/* Progress Dots */}
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Preloader;