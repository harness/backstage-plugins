import React from 'react';
import { configApiRef, useApi } from '@backstage/core-plugin-api';

export const EmbedComponent = () => {
  const configApi = useApi(configApiRef);
  const embedUrl = configApi.getOptionalString('customPlugins.embed.url');
  if (!embedUrl) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          color: '#666',
          textAlign: 'center',
          padding: '20px',
        }}
      >
        Please configure embed.url in your app-config.yaml
      </div>
    );
  }

  return (
    <iframe
      title="Embedded Content"
      src={embedUrl}
      style={{
        border: 'none',
        width: '100%',
        height: '100vh',
      }}
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
      loading="lazy"
    />
  );
};
