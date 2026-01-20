'use client';

import posthog from 'posthog-js';
import { useEffect } from 'react';

export default function PostHogClient() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    if (!key || !host) return;

    posthog.init(key, {
      api_host: host,
      capture_pageview: true,
      autocapture: true,
    });
  }, []);

  return null;
}
