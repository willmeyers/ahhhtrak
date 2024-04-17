import { useEffect, useState } from "react";

export const TickerText = ({ text }: { text: string }) => {
  const [animatedText, setAnimatedText] = useState<string>("");

  useEffect(() => {
    const targetText = text.toUpperCase();
    const currentText = targetText
      .split("")
      .map((char) => (char === " " || char === "," ? char : "A"));

    let indexes = [...currentText.keys()].filter(
      (index) => targetText[index] !== " " && targetText[index] !== ",",
    );

    const animate = (index: number) => {
      if (targetText[index] === " " || targetText[index] === ",") {
        return;
      }

      let nextCharCode = currentText[index].charCodeAt(0) + 1;
      if (nextCharCode > "Z".charCodeAt(0)) {
        nextCharCode = "A".charCodeAt(0);
      }
      const nextLetter = String.fromCharCode(nextCharCode);
      // @ts-expect-error Ignore because TypeScript does not recognize `index` as type number in this context, but we're confident it's safe.
      currentText[index] = nextLetter;

      if (nextLetter === targetText[index]) {
        indexes = indexes.filter((i) => i !== index); // Remove index when target letter is reached
      }

      setAnimatedText(currentText.join(""));
    };

    const interalId = setInterval(() => {
      if (indexes.length) {
        indexes.forEach((i) => animate(i));
      } else {
        clearInterval(interalId);
      }
    }, 15);

    return () => clearInterval(interalId);
  }, [text]);

  return <span>{animatedText}</span>;
};
