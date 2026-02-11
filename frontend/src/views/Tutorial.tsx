import { useState } from "react";
import Table from "../components/game/board/Table";
import BackgroundShapes from "../components/ui/BackgroundShapes";

import TutorialSidebar from "../components/tutorial/TutorialSidebar";
import TutorialGameProvider from "../components/tutorial/TutorialGameProvider";
import TutorialCompletionModal from "../components/tutorial/TutorialCompletionModal";
import { TUTORIAL_STEPS } from "../data/tutorialSteps";

type Expression = "neutral" | "happy" | "sad" | "excited";

export default function Tutorial() {
  const [stepIndex, setStepIndex] = useState(0);
  const [expression, setExpression] = useState<Expression>("neutral");
  const [completed, setCompleted] = useState(false);

  const handleNext = () => {
    if (stepIndex < TUTORIAL_STEPS.length - 1) {
      setStepIndex((p) => p + 1);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-gray-50 overflow-hidden font-sans text-slate-900">
      <BackgroundShapes />

      <TutorialGameProvider
        stepIndex={stepIndex}
        setStepIndex={setStepIndex}
        setExpression={setExpression}
        onComplete={() => setCompleted(true)}
      >
        <TutorialCompletionModal visible={completed} />

        <div className="flex-1 flex flex-col relative z-10 h-full overflow-hidden order-2 lg:order-1">
          <div className="flex-1 flex items-center justify-center p-4 min-h-0">
            <div className="w-full max-w-3xl flex items-center justify-center aspect-square">
              <Table />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96 flex-shrink-0 z-20 order-1 lg:order-2 h-auto lg:h-full">
          <TutorialSidebar
            step={TUTORIAL_STEPS[stepIndex]}
            totalSteps={TUTORIAL_STEPS.length}
            currentStepIndex={stepIndex}
            expression={expression}
            onNext={handleNext}
          />
        </div>
      </TutorialGameProvider>
    </div>
  );
}
