"use client";

import React, { useState, useEffect, useRef } from 'react';
import { storageStatusCache } from '../lib/storageStatusCache';

interface StorageStatusProps {
  showDetails?: boolean;
  statusData?: StorageStatusData | null;
}

interface StorageStatusData {
  configured: boolean;
  endpointType: string;
  missingVariables?: string[];
  error?: string;
}

export default function StorageStatus({ showDetails = false, statusData: propStatusData }: StorageStatusProps) {
  const [statusData, setStatusData] = useState<StorageStatusData | null>(propStatusData || null);
  const [loading, setLoading] = useState(!propStatusData);
  const fetchingRef = useRef(false);
  useEffect(() => {
    // Only fetch if no statusData was provided as prop and not already fetching
    if (!propStatusData && !fetchingRef.current) {
      fetchingRef.current = true;
      const fetchStorageStatus = async () => {
        try {
          const data = await storageStatusCache.getStorageStatus();
          setStatusData(data);
        } catch (error) {
          console.error('Failed to fetch storage status:', error);
          setStatusData({
            configured: false,
            endpointType: 'Unknown',
            missingVariables: ['Failed to check status'],
            error: 'Failed to fetch storage status'
          });
        } finally {
          setLoading(false);
          fetchingRef.current = false;
        }
      };

      fetchStorageStatus();
    }
  }, [propStatusData]);

  // Update local state when prop changes
  useEffect(() => {
    if (propStatusData) {
      setStatusData(propStatusData);
      setLoading(false);
    }
  }, [propStatusData]);

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Storage Configuration</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xl">⏳</span>
            <span className="font-medium text-gray-400">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!statusData) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Storage Configuration</h3>
          <div className="flex items-center space-x-2">
            <span className="text-xl">❌</span>
            <span className="font-medium text-red-400">Error</span>
          </div>
        </div>
      </div>
    );
  }

  const isConfigured = statusData.configured;

  if (isConfigured && !showDetails) {
    return null; // Don't show anything if storage is working properly
  }
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Storage Configuration</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xl">{isConfigured ? "☁️" : "⚠️"}</span>
          <span className={`font-medium ${isConfigured ? "text-green-400" : "text-orange-400"}`}>
            {isConfigured ? "Connected" : "Not Configured"}
          </span>
        </div>
      </div>
        <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Provider</span>
          <span className="text-white font-medium">{statusData.endpointType}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Status</span>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isConfigured ? 'bg-green-500' : 'bg-orange-500'
            }`} />
            <span className={`text-sm ${isConfigured ? "text-green-400" : "text-orange-400"}`}>
              {isConfigured ? 'Operational' : 'Needs Configuration'}
            </span>
          </div>
        </div>
        
        {!isConfigured && statusData.missingVariables && statusData.missingVariables.length > 0 && (
          <div className="mt-4 p-3 bg-orange-900/20 border border-orange-500/30 rounded-lg">
            <div className="flex items-start space-x-2">
              <span className="text-orange-400 mt-0.5">⚠️</span>
              <div className="flex-1">
                <p className="text-orange-300 font-medium text-sm mb-1">
                  Missing Environment Variables
                </p>
                <div className="flex flex-wrap gap-2">
                  {statusData.missingVariables.map((variable: string) => (
                    <code key={variable} className="px-2 py-1 bg-orange-800/40 text-orange-200 text-xs rounded">
                      {variable}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {statusData.error && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <div className="flex items-start space-x-2">
              <span className="text-red-400 mt-0.5">❌</span>
              <div className="flex-1">
                <p className="text-red-300 font-medium text-sm mb-1">
                  Error
                </p>
                <p className="text-red-200 text-sm">{statusData.error}</p>
              </div>
            </div>
          </div>
        )}
        
        {isConfigured && showDetails && (
          <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
            <div className="flex items-center space-x-2">
              <span className="text-green-400">✅</span>
              <p className="text-green-300 text-sm">
                Storage is properly configured and ready for file uploads
              </p>
            </div>
          </div>
        )}

        {!isConfigured && (
          <div className="mt-4 pt-3 border-t border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Quick Setup:</p>
            <div className="space-y-1 text-xs">
              <p className="text-gray-500">• Add missing environment variables to your .env file</p>
              <p className="text-gray-500">• Restart your development server</p>
              <p className="text-gray-500">• Visit <code className="bg-gray-700 px-1 rounded">/storage-test</code> to verify configuration</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
