// Google Analytics или другая аналитика

interface WindowWithGtag extends Window {
  gtag?: (
    command: 'config' | 'event',
    targetId: string,
    config?: Record<string, unknown>
  ) => void;
}

export const pageview = (url: string) => {
  if (typeof window !== 'undefined') {
    const win = window as WindowWithGtag;
    if (win.gtag) {
      win.gtag('config', process.env.NEXT_PUBLIC_GA_ID || '', {
        page_path: url,
      });
    }
  }
};

export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined') {
    const win = window as WindowWithGtag;
    if (win.gtag) {
      win.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    }
  }
};

// Specific event trackers
export const trackImageGeneration = (model: string) => {
  event({
    action: 'generate_image',
    category: 'AI Generation',
    label: model,
  });
};

export const trackTemplateUse = (templateId: string, templateType: string) => {
  event({
    action: 'use_template',
    category: 'Templates',
    label: `${templateType}-${templateId}`,
  });
};

export const trackImageDownload = (source: string) => {
  event({
    action: 'download_image',
    category: 'User Actions',
    label: source,
  });
};

export const trackSubscription = (plan: string) => {
  event({
    action: 'subscribe',
    category: 'Subscription',
    label: plan,
  });
};

