'use client';

type StorageMode = 'local' | 'session';

export default function ApiKeyGate({
  value,
  onChange,
  onSave,
  onReset,
  storageMode,
  onStorageModeChange,
}: {
  value: string;
  onChange: (next: string) => void;
  onSave: () => void;
  onReset: () => void;
  storageMode: StorageMode;
  onStorageModeChange: (next: StorageMode) => void;
}) {
  return (
    <main className="page-center">
      <section className="card gate-card">
        <p className="kicker">Secure Setup</p>
        <h1>🎓 한국 고등학생 대입 입시 정보 허브</h1>
        <p className="muted">
          Gemini API Key를 1회 등록하면 요약/질문 생성/전략 분석 기능을 안전하게 사용할 수 있어요.
        </p>

        <label className="label" htmlFor="api-key-input">
          Gemini API Key
        </label>
        <input
          id="api-key-input"
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="AIza..."
          className="input"
          autoComplete="off"
        />

        <div className="row" style={{ marginTop: 12 }}>
          <button
            type="button"
            className={`chip ${storageMode === 'local' ? 'chip-active' : ''}`}
            onClick={() => onStorageModeChange('local')}
          >
            localStorage
          </button>
          <button
            type="button"
            className={`chip ${storageMode === 'session' ? 'chip-active' : ''}`}
            onClick={() => onStorageModeChange('session')}
          >
            sessionStorage
          </button>
        </div>

        <div className="notice-box">
          <p>✅ API 키는 브라우저 저장소에만 저장되며 서버로 전송하지 않습니다.</p>
          <p>✅ 새로고침 후에도 선택한 저장 방식(local/session)이 유지됩니다.</p>
          <p>⚠️ 공용 PC에서는 사용 후 키 삭제를 권장합니다.</p>
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          <button type="button" className="btn primary" onClick={onSave}>
            저장하고 시작
          </button>
          <button type="button" className="btn" onClick={onReset}>
            초기화/삭제
          </button>
        </div>
      </section>
    </main>
  );
}
