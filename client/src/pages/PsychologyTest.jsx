import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { getPsychologyTestPages } from "../components/pychologyTests/index";
import "../styles/PsychologyTest.css";

export default function PsychologyTest() {
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [pages, setPages] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    getPsychologyTestPages(answers, setAnswers).then(setPages);
  }, []);

  const handleNext = () => {
    const currentTest = pages[currentIndex];

    const hasRequiredEmpty = currentTest.test?.questions?.some((q) => {
      if (!q.require) return false;
      const val = answers[q.id];
      if (q.multiple) return !Array.isArray(val) || val.length === 0;
      return val === undefined || val === "";
    });

    if (hasRequiredEmpty) {
      alert("필수 질문에 모두 응답해주세요.");
      return;
    }

    if (currentIndex < pages.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const total = Object.values(answers).reduce((sum, v) => {
        if (Array.isArray(v)) {
          return sum + v.reduce((s, x) => s + Number(x), 0);
        }
        return sum + Number(v);
      }, 0);

      const result = {
        totalScore: total,
        analysis: "스트레스 수준이 보통입니다.",
        answers,
      };

      fetch("/auth/심리검사/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result),
      }).then(() => setResult(result));
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const progress = ((currentIndex + 1) / pages.length) * 100;

  if (result) {
    return (
      <div className="psychology-test-container">
        <h1>검사 완료</h1>
        <p>총점: {result.totalScore}</p>
        <p>{result.analysis}</p>
        <button onClick={() => setLocation("/")}>홈으로</button>
      </div>
    );
  }

  return (
    <div className="psychology-test-container">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {pages.length > 0 && pages[currentIndex].component(answers, setAnswers)}

      <div className="test-navigation">
        <button
          className="nav-button secondary"
          onClick={handlePrevious}
          disabled={currentIndex === 0}
        >
          이전
        </button>
        <button className="nav-button primary" onClick={handleNext}>
          {currentIndex === pages.length - 1 ? "제출" : "다음"}
        </button>
      </div>
    </div>
  );
}
