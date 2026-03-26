import { useMutation } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

/**
 * Hook to generate an AI email sequence.
 */
export const useGenerateSequence = () => {
  return useMutation({
    mutationFn: async ({ goal, tone = 'professional', stepsCount = 3, variables = [] }) => {
      const res = await fetch(`${API_URL}/ai/generate-sequence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, tone, stepsCount, variables }),
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate sequence');
      return data.data;
    },
  });
};

/**
 * Hook to stream an AI email sequence generation in real-time.
 */
export const useStreamSequence = () => {
  return async ({ goal, tone = 'professional', stepsCount = 3, variables = [] }, onChunk, onEnd, onError) => {
    try {
      const queryParams = new URLSearchParams({
        goal,
        tone,
        stepsCount,
        variables: JSON.stringify(variables)
      }).toString();

      const response = await fetch(`${API_URL}/ai/generate-sequence-stream?${queryParams}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to start stream');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep partial line

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6).trim();
            if (dataStr === '[DONE]') {
              onEnd?.();
              return;
            }
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.response) {
                accumulated += parsed.response;
                onChunk?.(accumulated);
              }
            } catch {
              // Partial JSON in the token itself (rare but possible if token is split)
            }
          } else if (trimmed.startsWith('event: error')) {
            onError?.(new Error('Stream encountered an error'));
          }
        }
      }

      // Process any remaining tail
      if (buffer.startsWith('data: ')) {
        const dataStr = buffer.slice(6).trim();
        if (dataStr !== '[DONE]') {
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.response) {
              accumulated += parsed.response;
              onChunk?.(accumulated);
            }
          } catch (e) {
            console.log(e);

          }
        }
      }
      onEnd?.();
    } catch (err) {
      console.error('Stream Error:', err);
      onError?.(err);
    }
  };
};
