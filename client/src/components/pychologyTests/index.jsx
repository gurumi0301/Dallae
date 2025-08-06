// import 필요
import PsychologyTestPage from "./PsychologyTestPage";

export async function getPsychologyTestPages() {
  const modules = import.meta.glob("./tests/*.json", { eager: true });
  const tests = [];

  for (const path in modules) {
    const data = modules[path].default;

    const shuffledQuestions = data.questions.map((q, i) => ({
      ...q,
      id: q.id || `q-${i}`,
      options: q.options.map((opt, j) => ({
        ...opt,
        id: opt.id || `opt-${j}`,
        value: String(opt.value),
        type: opt.type || "radio",
      })),
    }));

    tests.push({
      id: data.id || path.split("/").pop().replace(".json", ""),
      name: data.name,
      target: data.target,
      questions: shuffledQuestions,
    });
  }

  return tests.map((test) => ({
    id: test.id,
    name: test.name,
    target: test.target,
    test,
    component: (answers, setAnswers) => (
      <PsychologyTestPage
        key={test.id}
        test={test}
        answers={answers}
        setAnswers={setAnswers}
      />
    ),
  }));
}
