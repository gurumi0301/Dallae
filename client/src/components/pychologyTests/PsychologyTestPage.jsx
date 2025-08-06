// components/psychologyTests/PsychologyTestPage.jsx

export default function PsychologyTestPage({ test, answers, setAnswers }) {
  return (
    <div className="psychology-test-form">
      <h2 className="test-title">{test.name}</h2>
      <p className="test-target">{test.target} 대상</p>

      <div className="questions-group">
        {test.questions.map((q) => (
          <div key={q.id} className="question-card">
            <h3 className="question-text">{q.question}</h3>
            <div className="answer-options">
              {q.options.map((opt) => {
                const inputId = `${q.id}-${opt.id}`;
                const handleChange = (e) => {
                  const isMultiple =
                    q.multiple &&
                    (opt.type === "radio" || opt.type === "select");
                  const value = e.target.value;

                  setAnswers((prev) => {
                    const current = prev[q.id] || (isMultiple ? [] : "");

                    if (isMultiple) {
                      const selected = new Set(current);
                      if (selected.has(value)) {
                        selected.delete(value); // toggle off
                      } else {
                        selected.add(value);
                      }
                      return { ...prev, [q.id]: Array.from(selected) };
                    } else {
                      return { ...prev, [q.id]: value };
                    }
                  });
                };

                const isSelected = q.multiple
                  ? Array.isArray(answers[q.id]) &&
                    answers[q.id].includes(opt.value)
                  : String(answers[q.id]) === String(opt.value);

                return (
                  <label
                    key={opt.id}
                    className={`answer-option ${isSelected ? "selected" : ""}`}
                    htmlFor={inputId}
                  >
                    {opt.type === "text" && (
                      <input
                        id={inputId}
                        type="text"
                        value={answers[q.id] || ""}
                        placeholder={opt.name}
                        onChange={handleChange}
                        className="input-text"
                      />
                    )}

                    {opt.type === "textarea" && (
                      <textarea
                        id={inputId}
                        value={answers[q.id] || ""}
                        placeholder={opt.name}
                        onChange={handleChange}
                        className="input-textarea"
                      />
                    )}

                    {opt.type === "number" && (
                      <input
                        id={inputId}
                        type="number"
                        value={answers[q.id] || ""}
                        onChange={handleChange}
                        className="input-number"
                      />
                    )}

                    {opt.type === "checkbox" && (
                      <>
                        <input
                          id={inputId}
                          type="checkbox"
                          checked={String(answers[q.id]) === String(opt.value)}
                          onChange={handleChange}
                        />
                        <span>{opt.name}</span>
                      </>
                    )}

                    {opt.type === "radio" && (
                      <>
                        <input
                          id={inputId}
                          type="radio"
                          name={q.id}
                          value={opt.value}
                          checked={String(answers[q.id]) === String(opt.value)}
                          onChange={handleChange}
                        />
                        <span>{opt.name}</span>
                      </>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
