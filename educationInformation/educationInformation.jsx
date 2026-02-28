import React, { useState, useEffect, useRef } from "react";

interface Scene {
  start: number;
  end: number;
  id: string;
}

const SCENES: Scene[] = [
  { start: 0, end: 5, id: "welcome" },
  { start: 5, end: 15, id: "practice" },
  { start: 15, end: 25, id: "protect" },
  { start: 25, end: 30, id: "start" },
];

const NARRATIONS: string[] = [
  "어르신, 금융 교실에 오신 것을 환영합니다! 오늘 공부 기대되시죠?",
  "잠깐! 실습할 때는 실제 성함이나 계좌번호 대신, 앱에 있는 연습용 정보를 꼭 사용해 주세요.",
  "친절한 선생님이라도 내 소중한 개인정보는 비밀! 연습용 정보로 배워야 마음 편히 공부할 수 있습니다.",
  "이제 안심하고 즐겁게 시작해 보세요!",
];

const SUBTITLES: string[] = [
  "환영",
  "연습용 정보",
  "개인정보 보호",
  "시작!",
];

const FinancialEducationAnimation: React.FC = () => {
  const [time, setTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentScene, setCurrentScene] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastSpokenScene = useRef<number>(-1);

  const speak = (text: string) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/\n/g, " "));
    utterance.lang = "ko-KR";
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const koreanVoice = voices.find((v) => v.lang.startsWith("ko"));
    if (koreanVoice) utterance.voice = koreanVoice;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  useEffect(() => {
    if (isPlaying && currentScene !== lastSpokenScene.current) {
      lastSpokenScene.current = currentScene;
      speak(NARRATIONS[currentScene]);
    }
  }, [currentScene, isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setTime((prev) => {
          if (prev >= 30) {
            setIsPlaying(false);
            window.speechSynthesis.cancel();
            return 30;
          }
          return prev + 0.05;
        });
      }, 60);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    const scene = SCENES.findIndex((s) => time >= s.start && time < s.end);
    if (scene !== -1) setCurrentScene(scene);
  }, [time]);

  const reset = () => {
    setTime(0);
    setIsPlaying(false);
    setCurrentScene(0);
    window.speechSynthesis.cancel();
    lastSpokenScene.current = -1;
  };

  const progress = (time / 30) * 100;
  const sceneProgress = SCENES[currentScene]
    ? (time - SCENES[currentScene].start) /
      (SCENES[currentScene].end - SCENES[currentScene].start)
    : 0;

  const sceneBg =
    currentScene === 0
      ? "linear-gradient(180deg, #E8F4FD 0%, #B8DCFA 50%, #89C4F4 100%)"
      : currentScene === 1
      ? "linear-gradient(180deg, #FFF8E1 0%, #FFE0B2 50%, #FFCC80 100%)"
      : currentScene === 2
      ? "linear-gradient(180deg, #E8F5E9 0%, #A5D6A7 50%, #81C784 100%)"
      : "linear-gradient(180deg, #E3F2FD 0%, #90CAF9 50%, #64B5F6 100%)";

  return (
    <div
      style={{
        minHeight: "100vh",
        minHeight: "100dvh",
        background: "#F5F5F5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        fontFamily: "'Noto Sans KR', 'Pretendard', sans-serif",
        overflow: "hidden",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;900&display=swap"
        rel="stylesheet"
      />

      {/* 모바일 전체화면 영상 영역 */}
      <div
        style={{
          width: "100%",
          maxWidth: "430px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          background: sceneBg,
          transition: "background 0.8s ease",
          overflow: "hidden",
        }}
      >
        {/* 상단 상태바 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px 8px",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div
            style={{
              background: "rgba(0,0,0,0.15)",
              borderRadius: "20px",
              padding: "6px 14px",
              fontSize: "13px",
              fontWeight: 700,
              color: "rgba(0,0,0,0.5)",
            }}
          >
            {Math.min(Math.floor(time), 30)}초 / 30초
          </div>
          <div
            style={{
              background: "rgba(0,0,0,0.15)",
              borderRadius: "20px",
              padding: "6px 14px",
              fontSize: "12px",
              fontWeight: 700,
              color: "rgba(0,0,0,0.5)",
            }}
          >
            금융교육 안내
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ padding: "0 20px", position: "relative", zIndex: 10 }}>
          <div
            style={{
              width: "100%",
              height: "4px",
              background: "rgba(0,0,0,0.1)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "#2E6DCF",
                borderRadius: "2px",
                transition: "width 0.1s linear",
              }}
            />
          </div>
        </div>

        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: `${16 + i * 8}px`,
              height: `${16 + i * 8}px`,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.3)",
              left: `${5 + i * 18}%`,
              top: `${20 + ((i * 37) % 50)}%`,
              animation: `floatBubble ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}

        {/* 메인 컨텐츠 영역 */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            position: "relative",
            zIndex: 5,
          }}
        >
          {/* Scene 1: Welcome */}
          {currentScene === 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                animation: "fadeSlideUp 0.6s ease-out",
              }}
            >
              <div
                style={{
                  width: "160px",
                  height: "160px",
                  marginBottom: "24px",
                  animation: "gentleBounce 2s ease-in-out infinite",
                }}
              >
                <svg viewBox="0 0 120 120" width="160" height="160">
                  <ellipse cx="60" cy="95" rx="30" ry="20" fill="#2E6DCF" />
                  <circle cx="60" cy="48" r="30" fill="#FFD9B3" />
                  <ellipse cx="48" cy="45" rx="4" ry={sceneProgress > 0.3 ? 1.5 : 4} fill="#2D2D2D" style={{ transition: "ry 0.3s" }} />
                  <ellipse cx="72" cy="45" rx="4" ry={sceneProgress > 0.3 ? 1.5 : 4} fill="#2D2D2D" style={{ transition: "ry 0.3s" }} />
                  <path d="M 46 56 Q 60 68 74 56" fill="none" stroke="#D4756A" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="38" cy="54" r="6" fill="rgba(255,150,150,0.4)" />
                  <circle cx="82" cy="54" r="6" fill="rgba(255,150,150,0.4)" />
                  <path d="M 30 40 Q 30 15 60 18 Q 90 15 90 40" fill="#5A3825" />
                  <g style={{ transformOrigin: "95px 75px", animation: "waveHand 0.8s ease-in-out infinite alternate" }}>
                    <circle cx="98" cy="70" r="8" fill="#FFD9B3" />
                    <rect x="88" y="72" width="10" height="16" rx="5" fill="#2E6DCF" />
                  </g>
                </svg>
              </div>
              <div
                style={{
                  background: "rgba(255,220,60,0.95)",
                  padding: "16px 48px",
                  borderRadius: "50px",
                  fontSize: "28px",
                  fontWeight: 900,
                  color: "#1A1A1A",
                  boxShadow: "0 4px 20px rgba(255,200,0,0.3)",
                  animation: "popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both",
                }}
              >
                반갑습니다! 😊
              </div>
            </div>
          )}

          {/* Scene 2: Practice Info */}
          {currentScene === 1 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "20px",
                width: "100%",
                animation: "fadeSlideUp 0.6s ease-out",
              }}
            >
              {/* 경고 메시지 */}
              <div
                style={{
                  background: "rgba(255,255,255,0.9)",
                  border: "3px solid #FF5722",
                  borderRadius: "20px",
                  padding: "20px",
                  width: "100%",
                  animation: sceneProgress > 0.2 ? "pulseAttention 1.5s ease-in-out infinite" : "none",
                }}
              >
                <div style={{ fontSize: "22px", fontWeight: 900, color: "#D84315", marginBottom: "8px" }}>
                  ⚠️ 잠깐만요!
                </div>
                <div style={{ fontSize: "17px", color: "#4E342E", fontWeight: 700, lineHeight: 1.6 }}>
                  실제 이름, 계좌번호 대신<br />
                  <span style={{ color: "#2E7D32", fontSize: "20px" }}>연습용 정보</span>를 사용해 주세요!
                </div>
              </div>

              {/* 폰 화면 예시 */}
              <div
                style={{
                  background: "#1A1A2E",
                  borderRadius: "24px",
                  padding: "10px",
                  width: "85%",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
                  animation: "phoneSlideIn 0.6s ease-out",
                }}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "18px",
                    padding: "18px",
                  }}
                >
                  <div
                    style={{
                      background: "#2E6DCF",
                      color: "#fff",
                      padding: "8px",
                      borderRadius: "10px",
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: "13px",
                      marginBottom: "14px",
                    }}
                  >
                    금융 교실 실습
                  </div>
                  <div style={{ marginBottom: "12px" }}>
                    <div style={{ color: "#888", fontSize: "12px", marginBottom: "4px" }}>이름</div>
                    <div
                      style={{
                        background: sceneProgress > 0.3 ? "rgba(76,175,80,0.15)" : "rgba(244,67,54,0.1)",
                        border: sceneProgress > 0.3 ? "2px solid #4CAF50" : "2px solid #F44336",
                        borderRadius: "10px",
                        padding: "10px 14px",
                        fontWeight: 700,
                        fontSize: "17px",
                        transition: "all 0.5s",
                        color: sceneProgress > 0.3 ? "#2E7D32" : "#C62828",
                      }}
                    >
                      {sceneProgress > 0.3 ? "✅ 홍길동" : "❌ 김영희"}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "#888", fontSize: "12px", marginBottom: "4px" }}>계좌번호</div>
                    <div
                      style={{
                        background: sceneProgress > 0.3 ? "rgba(76,175,80,0.15)" : "rgba(244,67,54,0.1)",
                        border: sceneProgress > 0.3 ? "2px solid #4CAF50" : "2px solid #F44336",
                        borderRadius: "10px",
                        padding: "10px 14px",
                        fontWeight: 700,
                        fontSize: "17px",
                        transition: "all 0.5s",
                        color: sceneProgress > 0.3 ? "#2E7D32" : "#C62828",
                      }}
                    >
                      {sceneProgress > 0.3 ? "✅ 1234-5678" : "❌ 110-XXX-XXXX"}
                    </div>
                  </div>
                </div>
              </div>

              {sceneProgress > 0.5 && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    animation: "fadeSlideUp 0.5s ease-out",
                    background: "rgba(255,255,255,0.85)",
                    borderRadius: "16px",
                    padding: "14px 20px",
                  }}
                >
                  <span style={{ fontSize: "28px" }}>✅</span>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "#2E7D32" }}>
                    홍길동 · 1234-5678 사용!
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Scene 3: Privacy Protection */}
          {currentScene === 2 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                animation: "fadeSlideUp 0.6s ease-out",
              }}
            >
              {/* Shield */}
              <div
                style={{
                  position: "relative",
                  marginBottom: "24px",
                  animation: "shieldAppear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                <svg viewBox="0 0 120 140" width="120" height="140">
                  <defs>
                    <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2E6DCF" />
                      <stop offset="100%" stopColor="#1B4F9E" />
                    </linearGradient>
                  </defs>
                  <path d="M 60 8 L 110 30 L 105 90 Q 90 125 60 135 Q 30 125 15 90 L 10 30 Z" fill="url(#shieldGrad)" stroke="#fff" strokeWidth="3" />
                  <text x="60" y="65" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">개인정보</text>
                  <text x="60" y="85" textAnchor="middle" fill="#FFD54F" fontSize="16" fontWeight="bold">보호</text>
                  <g transform="translate(44, 95)">
                    <rect x="4" y="8" width="24" height="18" rx="3" fill="#FFD54F" />
                    <path d="M 10 8 V 4 Q 10 -2 16 -2 Q 22 -2 22 4 V 8" fill="none" stroke="#FFD54F" strokeWidth="3" />
                    <circle cx="16" cy="18" r="3" fill="#1B4F9E" />
                  </g>
                </svg>
                {sceneProgress > 0.2 && (
                  <>
                    <div style={{ position: "absolute", inset: "-20px", borderRadius: "50%", border: "2px solid rgba(46,109,207,0.3)", animation: "pulseRing 2s ease-out infinite" }} />
                    <div style={{ position: "absolute", inset: "-20px", borderRadius: "50%", border: "2px solid rgba(46,109,207,0.3)", animation: "pulseRing 2s ease-out infinite 0.7s" }} />
                  </>
                )}
              </div>

              {/* 멘토 멘티 */}
              <div style={{ display: "flex", alignItems: "center", gap: "28px", marginBottom: "20px" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#2E6DCF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", marginBottom: "6px" }}>👩‍🏫</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#1B4F9E" }}>멘토</div>
                </div>
                <div style={{ fontSize: "28px", color: "#4CAF50" }}>🤝</div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#66BB6A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", marginBottom: "6px" }}>🧓</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#2E7D32" }}>어르신</div>
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.9)",
                  borderRadius: "20px",
                  padding: "18px 24px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "19px", fontWeight: 900, color: "#1B5E20", lineHeight: 1.7 }}>
                  친절한 선생님이라도<br />
                  내 소중한 개인정보는{" "}
                  <span style={{ background: "#FFD54F", padding: "3px 10px", borderRadius: "8px", color: "#1A1A1A" }}>
                    비밀!
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Scene 4: Let's Start */}
          {currentScene === 3 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                animation: "fadeSlideUp 0.6s ease-out",
              }}
            >
              <div style={{ marginBottom: "24px", animation: "gentleBounce 1.5s ease-in-out infinite" }}>
                <svg viewBox="0 0 120 120" width="150" height="150">
                  <ellipse cx="60" cy="98" rx="28" ry="18" fill="#2E6DCF" />
                  <circle cx="60" cy="48" r="28" fill="#FFD9B3" />
                  <path d="M 42 44 Q 48 38 54 44" fill="none" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 66 44 Q 72 38 78 44" fill="none" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M 44 56 Q 60 70 76 56" fill="none" stroke="#D4756A" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="36" cy="52" r="6" fill="rgba(255,150,150,0.4)" />
                  <circle cx="84" cy="52" r="6" fill="rgba(255,150,150,0.4)" />
                  <path d="M 30 40 Q 30 14 60 17 Q 90 14 90 40" fill="#5A3825" />
                  <g transform="translate(88, 60)" style={{ animation: "thumbsUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both" }}>
                    <rect x="-6" y="4" width="14" height="22" rx="6" fill="#FFD9B3" />
                    <rect x="-4" y="-14" width="10" height="20" rx="5" fill="#FFD9B3" />
                  </g>
                </svg>
              </div>

              <div
                style={{
                  background: "rgba(255,220,60,0.95)",
                  padding: "18px 44px",
                  borderRadius: "50px",
                  fontSize: "26px",
                  fontWeight: 900,
                  color: "#1A1A1A",
                  boxShadow: "0 6px 30px rgba(255,200,0,0.4)",
                  animation: "popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s both",
                  marginBottom: "14px",
                }}
              >
                자, 시작해볼까요? 👍
              </div>

              {sceneProgress > 0.3 && (
                <div style={{ fontSize: "17px", color: "#1565C0", fontWeight: 700, animation: "fadeSlideUp 0.5s ease-out" }}>
                  안심하고 즐겁게 배워요!
                </div>
              )}
            </div>
          )}
        </div>

        {/* 하단 자막 + 컨트롤 영역 */}
        <div style={{ position: "relative", zIndex: 10 }}>
          {/* 자막 */}
          <div
            style={{
              background: "rgba(0,0,0,0.7)",
              backdropFilter: "blur(8px)",
              padding: "16px 20px",
              minHeight: "70px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                color: "#fff",
                fontSize: "16px",
                lineHeight: 1.7,
                textAlign: "center",
                fontWeight: 400,
              }}
            >
              {NARRATIONS[currentScene]}
            </div>
          </div>

          {/* 씬 선택 */}
          <div
            style={{
              display: "flex",
              gap: "6px",
              padding: "12px 16px 8px",
              background: "#fff",
            }}
          >
            {SUBTITLES.map((sub, i) => (
              <div
                key={i}
                onClick={() => {
                  setTime(SCENES[i].start);
                  setCurrentScene(i);
                  lastSpokenScene.current = -1;
                  if (isPlaying) speak(NARRATIONS[i]);
                }}
                style={{
                  flex: 1,
                  padding: "10px 4px",
                  borderRadius: "12px",
                  background: currentScene === i ? "#2E6DCF" : "#F0F0F0",
                  color: currentScene === i ? "#fff" : "#888",
                  fontSize: "13px",
                  fontWeight: 700,
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.3s",
                }}
              >
                {sub}
              </div>
            ))}
          </div>

          {/* 재생 버튼 */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              padding: "8px 16px 24px",
              background: "#fff",
            }}
          >
            <button
              onClick={() => {
                if (isPlaying) {
                  window.speechSynthesis.cancel();
                  setIsPlaying(false);
                } else {
                  if (time >= 30) {
                    setTime(0);
                    setCurrentScene(0);
                    lastSpokenScene.current = -1;
                  }
                  lastSpokenScene.current = -1;
                  setIsPlaying(true);
                }
              }}
              style={{
                flex: 1,
                padding: "16px",
                borderRadius: "16px",
                border: "none",
                background: isPlaying ? "#E0E0E0" : "#2E6DCF",
                color: isPlaying ? "#555" : "#fff",
                fontSize: "17px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.3s",
                minHeight: "54px",
              }}
            >
              {isPlaying ? "⏸ 일시정지" : time >= 30 ? "▶ 다시 재생" : "▶ 재생"}
            </button>
            <button
              onClick={reset}
              style={{
                padding: "16px 24px",
                borderRadius: "16px",
                border: "2px solid #E0E0E0",
                background: "#fff",
                color: "#888",
                fontSize: "17px",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.3s",
                minHeight: "54px",
              }}
            >
              ↺
            </button>
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes gentleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes waveHand {
          from { transform: rotate(-15deg); }
          to { transform: rotate(15deg); }
        }
        @keyframes pulseAttention {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255,87,34,0.3); }
          50% { transform: scale(1.02); box-shadow: 0 0 20px 4px rgba(255,87,34,0.2); }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.8); opacity: 0.6; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        @keyframes shieldAppear {
          from { opacity: 0; transform: scale(0.3) rotate(-10deg); }
          to { opacity: 1; transform: scale(1) rotate(0deg); }
        }
        @keyframes thumbsUp {
          from { transform: rotate(30deg) scale(0); }
          to { transform: rotate(0deg) scale(1); }
        }
        @keyframes phoneSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatBubble {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default FinancialEducationAnimation;
