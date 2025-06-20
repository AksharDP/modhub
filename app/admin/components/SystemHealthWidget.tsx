"use client";

import { useState, useEffect } from "react";

interface HealthData {
  health: {
    score: number;
    status: string;
    checks: Record<string, {
      status: string;
      message: string;
    }>;
  };
  metrics: {
    users: number;
    mods: number;
    activeMods: number;
    system: {
      uptime: number;
      memory: {
        heapUsed: number;
        heapTotal: number;
      };
    };
  };
}

export default function SystemHealthWidget() {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealthData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/admin/health');
      
      if (!response.ok) {
        throw new Error('Failed to fetch health data');
      }
      
      const data = await response.json();
      setHealthData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealthData();
    
    // Refresh health data every 30 seconds
    const interval = setInterval(fetchHealthData, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'fair': return 'text-yellow-400';
      case 'poor': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
        <div className="text-red-400 text-center py-4">
          <p>❌ {error}</p>
          <button
            onClick={fetchHealthData}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!healthData) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">System Health</h3>
        <button
          onClick={fetchHealthData}
          className="text-gray-400 hover:text-white transition-colors"
          title="Refresh health data"
        >
          🔄
        </button>
      </div>

      {/* Health Score */}
      <div className="mb-4 text-center">
        <div className={`text-2xl font-bold ${getStatusColor(healthData.health.status)}`}>
          {healthData.health.score}/100
        </div>
        <div className={`text-sm ${getStatusColor(healthData.health.status)} capitalize`}>
          {healthData.health.status}
        </div>
      </div>

      {/* Health Checks */}
      <div className="space-y-2 mb-4">
        {Object.entries(healthData.health.checks).map(([key, check]) => (
          <div key={key} className="flex items-center space-x-2 text-sm">
            <span>{getStatusIcon(check.status)}</span>
            <span className="text-gray-300 capitalize">{key}:</span>
            <span className="text-gray-400 flex-1 truncate" title={check.message}>
              {check.message}
            </span>
          </div>
        ))}
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <div className="text-gray-400">Uptime</div>
          <div className="text-white font-medium">
            {formatUptime(healthData.metrics.system.uptime)}
          </div>
        </div>
        <div>
          <div className="text-gray-400">Memory</div>
          <div className="text-white font-medium">
            {Math.round((healthData.metrics.system.memory.heapUsed / healthData.metrics.system.memory.heapTotal) * 100)}%
          </div>
        </div>
      </div>
    </div>
  );
}
