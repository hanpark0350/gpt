'use client';

import { useMemo, useState } from 'react';
import ApiKeyGate from '@/components/ApiKeyGate';
import { generateGeminiText, type ToolMode } from '@/lib/geminiClient';

type StorageMode = 'local' | 'session';

type TabConfig = {
  key: ToolMode;
  title: string;
  placeholder: string;
  badge: string;
};

const STORAGE_KEY = 'gemini_api_key';
const STORAGE_MODE_KEY = 'gemini_api_storage_mode';

const TABS: TabConfig[] = [
  {
    key: 'summary',
    title: '요약',
    placeholder: '전형요강/공지 원문을 붙여넣어 주세요.',
    badge: '핵심 정리',
  },
  {
    key: 'questions',
    title: '질문만들기',
    placeholder: '면접/자소서 주제, 학과, 경험을 입력해 주세요.',
    badge: '면접 대비',
  },
  {
    key: 'strategy',
    title: '전략',
    placeholder: '내신/수능/희망학과/비교과 상황을 자세히 적어 주세요.',
    badge: '지원 전략',
  },
];

function getStoredApiKey() {
  if (typeof window === 'undefined') return '';

  const mode =
    (window.localStorage.getItem(STORAGE_MODE_KEY) as StorageMode | null) ??
    'local';
  const storage = mode === 'session' ? window.sessionStorage : window.localStorage;
  return storage.getItem(STORAGE_KEY) ?? '';
}

export default function HomePage() {
  const [storageMode, setStorageMode] = useState<StorageMode>(() => {
    if (typeof window === 'undefined') return 'local';
    const saved = window.localStorage.getItem(STORAGE_MODE_KEY) as StorageMode | null;
    return saved ?? 'local';
  });
  const [apiKey, setApiKey] = useState<string>(() => getStoredApiKey());
  const [draftKey, setDraftKey] = useState<string>(() => getStoredApiKey());
  const [activeTab, setActiveTab] = useState<ToolMode>('summary');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const gateOpen = useMemo(() => apiKey.trim().length === 0, [apiKey]);

  const handleSaveApiKey = () => {
    const trimmed = draftKey.trim();
    if (!trimmed) {
      setError('API Key를 입력해 주세요.');
      return;
    }

    const storage = storageMode === 'session' ? window.sessionStorage : window.localStorage;
    window.localStorage.setItem(STORAGE_MODE_KEY, storageMode);
    storage.setItem(STORAGE_KEY, trimmed);

    const otherStorage = storageMode === 'session' ? window.localStorage : window.sessionStorage;
    otherStorage.removeItem(STORAGE_KEY);

    setApiKey(trimmed);
    setError('');
  };

  const handleDeleteApiKey = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(STORAGE_MODE_KEY);
    setApiKey('');
    setDraftKey('');
    setResult('');
    setError('저장된 API Key를 삭제했습니다.');
  };

  const handleRun = async () => {
    if (!apiKey) {
      setError('먼저 API Key를 저장해 주세요.');
      return;
    }
    if (!inputText.trim()) {
      setError('입력 텍스트를 작성해 주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const output = await generateGeminiText({
        apiKey,
        mode: activeTab,
        userInput: inputText.trim(),
        temperature: 0.4,
        maxOutputTokens: 1200,
      });
      setResult(output);
    } catch (err) {
      setResult('');
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  if (gateOpen) {
    return (
      <ApiKeyGate
        value={draftKey}
        onChange={setDraftKey}
        onSave={handleSaveApiKey}
        onReset={handleDeleteApiKey}
        storageMode={storageMode}
        onStorageModeChange={setStorageMode}
      />
    );
  }

  return (
    <main className="app-shell">
      <header className="header card">
        <div>
          <h1>📚 대입 입시 도우미</h1>
          <p className="muted">요약 · 질문 생성 · 전략 비교를 한 번에</p>
        </div>
        <button type="button" className="btn danger" onClick={handleDeleteApiKey}>
          키 삭제
        </button>
      </header>

      <section className="tabs card">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab ${activeTab === tab.key ? 'tab-active' : ''}`}
            onClick={() => {
              setActiveTab(tab.key);
              setResult('');
              setError('');
            }}
          >
            <span>{tab.title}</span>
            <span className="badge">{tab.badge}</span>
          </button>
        ))}
      </section>

      <section className="card">
        <label htmlFor="main-input" className="label">
          입력 내용
        </label>
        <textarea
          id="main-input"
          className="textarea"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={TABS.find((tab) => tab.key === activeTab)?.placeholder}
          rows={12}
        />

        <div className="row" style={{ marginTop: 12 }}>
          <button
            type="button"
            className="btn primary"
            onClick={handleRun}
            disabled={isLoading}
          >
            {isLoading ? '생성 중...' : '실행'}
          </button>
        </div>
      </section>

      {(result || error) && (
        <section className="card result-card">
          <h2>{error ? '오류' : '결과'}</h2>
          {error ? <p className="error-text">{error}</p> : <pre className="result-pre">{result}</pre>}
          <p className="tiny-note">전형/일정은 변동 가능, 최종 확인은 입학처/요강 원문에서 진행하세요.</p>
        </section>
      )}
    </main>
  );
}
