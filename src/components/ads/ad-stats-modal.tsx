"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AdStatsResponse } from "@/src/types";
import { adsService } from "@/src/services/ads.service";
import { Modal } from "@/src/components/ui/modal";
import { LoadingSpinner } from "@/src/components/ui/loading-spinner";

interface AdStatsModalProps {
  adId: string | null;
  onClose: () => void;
}

export function AdStatsModal({ adId, onClose }: AdStatsModalProps) {
  const [stats, setStats] = useState<AdStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!adId) return;
    setStats(null);
    setIsLoading(true);
    adsService
      .getStats(adId)
      .then(setStats)
      .catch(() => toast.error("Failed to load stats"))
      .finally(() => setIsLoading(false));
  }, [adId]);

  return (
    <Modal
      isOpen={adId !== null}
      onClose={onClose}
      title="Ad Analytics"
      size="lg"
    >
      <div className="p-6">
        {isLoading && (
          <div className="flex justify-center py-10">
            <LoadingSpinner size="md" />
          </div>
        )}

        {!isLoading && stats && (
          <div className="space-y-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                Total Clicks (All Time)
              </p>
              <p className="text-4xl font-bold text-gray-900">
                {stats.totalClicks.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
                Clicks — Last 30 Days
              </p>
              {stats.clicksByDay.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  No click data for this period.
                </p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={stats.clicksByDay}
                    margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(val: string) => {
                        const [, month, day] = val.split("-");
                        return `${month}/${day}`;
                      }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      allowDecimals={false}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(value) => [value, "Clicks"]}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Bar dataKey="count" fill="#4f46e5" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}

        {!isLoading && !stats && (
          <p className="text-center text-gray-400 py-10">
            No stats available.
          </p>
        )}
      </div>
    </Modal>
  );
}
