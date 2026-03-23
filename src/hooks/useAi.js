import { useMutation } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

/**
 * Hook to generate an AI email sequence.
 */
export const useGenerateSequence = () => {
  return useMutation({
    mutationFn: async ({ goal, tone = 'professional', stepsCount = 3 }) => {
      const res = await fetch(`${API_URL}/ai/generate-sequence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, tone, stepsCount }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate sequence');
      return data.data;
    },
  });
};
