export const TituloConHighlight = ({ texto, highlight }: { texto: string; highlight: string }) => {
  const palabras = texto.split(" ");

  // 1️⃣ Verificar si existe la palabra a resaltar
  const existeHighlight = palabras.includes(highlight);

  let palabraFinal = highlight;

  // 2️⃣ Si no existe, elegir una palabra aleatoria
  if (!existeHighlight) {
    const palabrasValidas = palabras.filter(p => p.length > 3); // evita "lo", "que", etc.
    palabraFinal =
      palabrasValidas[Math.floor(Math.random() * palabrasValidas.length)];
  }

  // 3️⃣ Separar el texto
  const partes = texto.split(palabraFinal);

  return (
    <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
      {partes[0]}
      <span className="text-gradient-coral">{palabraFinal}</span>
      {partes[1]}
    </h2>
  );
};
