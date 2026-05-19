export function CollageTitle({ text }) {
  const characters = String(text || "")
    .slice(0, 18)
    .split("");

  return (
    <h1 className="collage-title" aria-label={text}>
      {characters.map((character, index) => (
        <span className={character === " " ? "letter space" : "letter"} aria-hidden="true" key={`${character}-${index}`}>
          {character === " " ? "\u00a0" : character}
        </span>
      ))}
    </h1>
  );
}
