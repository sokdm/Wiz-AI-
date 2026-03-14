'use client';

import { useState, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { 
  ArrowLeftIcon, 
  CameraIcon, 
  PhotoIcon,
  XMarkIcon,
  SparklesIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import { useStore } from '../store/useStore';

export default function ImageSolver() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [solution, setSolution] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();
  const { isAuthenticated, user } = useStore();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Please login to access this feature</p>
          <button 
            onClick={() => router.push('/login')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (file) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG or PNG)');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setSolution(null);
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const solveImage = async () => {
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await api.post('/image-solver', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSolution(response.data);
      toast.success('Image processed successfully!');
    } catch (error) {
      if (error.response?.data?.upgrade) {
        toast.error('Daily image limit reached. Upgrade to Premium!');
      } else {
        toast.error(error.response?.data?.error || 'Failed to process image');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setImage(null);
    setPreview(null);
    setSolution(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Image Solver - Wiz AI</title>
      </Head>

      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <CameraIcon className="w-7 h-7 text-green-600" />
                Image Solver
              </h1>
              <p className="text-sm text-gray-600">Upload a photo of your homework</p>
            </div>
          </div>
          {user?.subscription?.plan === 'free' && (
            <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
              Free: {user?.dailyUsage?.imageSolves || 0}/3 daily
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          {!preview ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              <PhotoIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                Drag and drop your homework image here
              </p>
              <p className="text-gray-500 mb-6">or</p>
              <label className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />
                Choose File
              </label>
              <p className="text-sm text-gray-400 mt-4">Supports: JPG, PNG (Max 5MB)</p>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={clearImage}
                className="absolute -top-4 -right-4 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 z-10 shadow-lg"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
              <div className="mb-6 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-96 object-contain mx-auto"
                />
              </div>
              <button
                onClick={solveImage}
                disabled={loading}
                className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold text-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing with OCR + AI...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    Solve This Problem
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {solution && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <PhotoIcon className="w-5 h-5 text-gray-600" />
                Extracted Text
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm border">
                {solution.extractedText || 'No text detected'}
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Confidence: {solution.confidence?.toFixed(1)}%
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-green-500">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-green-600" />
                AI Solution
              </h3>
              <div className="prose prose-green max-w-none">
                <ReactMarkdown>{solution.solution}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
