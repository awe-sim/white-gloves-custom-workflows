import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './process-flow/App.tsx';
import { ReactFlowProvider } from 'reactflow';
import { RecoilRoot } from 'recoil';
import { ToastsProvider } from './process-flow/MySnackbar.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RecoilRoot>
      <ReactFlowProvider>
        <ToastsProvider>
          <App />
        </ToastsProvider>
      </ReactFlowProvider>
    </RecoilRoot>
  </React.StrictMode>,
);
