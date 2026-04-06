import { test, expect, Page } from "@playwright/test";

// Párrafo contador "Mostrando X de Y"
const contador = (page: Page) =>
  page.locator("p").filter({ hasText: /^Mostrando \d+/ });

/**
 * Escribe en un input controlado de React 18 simulando teclado real.
 * fill() y pressSequentially() no siempre disparan el onChange de React;
 * keyboard.type() con delay garantiza que cada evento input sea procesado.
 */
const escribirEnInput = async (page: Page, placeholder: string, valor: string) => {
  const input = page.getByPlaceholder(new RegExp(placeholder, "i"));
  await input.click({ clickCount: 3 }); // seleccionar texto existente
  await page.keyboard.press("Backspace");  // limpiar
  await page.keyboard.type(valor, { delay: 40 }); // escribir con delay real
};

test.describe("Página de Resultados de Pre-Entrevistas", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/resultados");
  });

  test("carga la página correctamente", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /resultados de pre-entrevistas/i })
    ).toBeVisible();
  });

  test("muestra la sección de filtros", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /^filtros$/i })
    ).toBeVisible();
    await expect(page.getByRole("combobox").nth(0)).toBeVisible();
    await expect(page.getByRole("combobox").nth(1)).toBeVisible();
    await expect(page.getByRole("combobox").nth(2)).toBeVisible();
    await expect(
      page.getByPlaceholder(/nombre, posición, estado/i)
    ).toBeVisible();
  });

  test("muestra candidatos o el mensaje de sin datos", async ({ page }) => {
    const tieneDatos = await contador(page).isVisible();

    if (tieneDatos) {
      await expect(contador(page)).toBeVisible();
    } else {
      await expect(
        page.getByText(/aún no hay resultados de pre-entrevistas/i)
      ).toBeVisible();
    }
  });

  test("buscar por texto filtra los resultados", async ({ page }) => {
    const tieneDatos = await contador(page).isVisible();
    if (!tieneDatos) {
      test.skip(true, "No hay candidatos para filtrar");
      return;
    }

    const textoInicial = await contador(page).textContent();
    const totalInicial = parseInt(textoInicial?.match(/\d+/)?.[0] ?? "0");
    if (totalInicial === 0) return;

    const primerNombre = await page.locator("h3").first().textContent();
    const primeraPalabra = primerNombre?.trim().split(" ")[0] ?? "";
    if (!primeraPalabra) return;

    await escribirEnInput(page, "Nombre", primeraPalabra);

    // Esperar a que React re-renderice y el contador cambie
    await page.locator("p").filter({ hasText: /^Mostrando \d+/ }).waitFor({ state: "visible" });
    const textoFiltrado = await contador(page).textContent();
    const totalFiltrado = parseInt(textoFiltrado?.match(/\d+/)?.[0] ?? "0");

    expect(totalFiltrado).toBeLessThanOrEqual(totalInicial);
    expect(totalFiltrado).toBeGreaterThan(0);

    console.log(
      `Búsqueda "${primeraPalabra}": ${totalInicial} → ${totalFiltrado} candidatos`
    );
  });

  test("búsqueda sin resultados muestra el mensaje apropiado", async ({ page }) => {
    const tieneDatos = await contador(page).isVisible();
    if (!tieneDatos) {
      test.skip(true, "No hay candidatos");
      return;
    }

    await escribirEnInput(page, "Nombre", "xyzxyzxyz_noexiste_123");

    await page
      .getByText(/no se encontraron resultados con los filtros/i)
      .waitFor({ state: "visible", timeout: 10000 });
  });

  test("limpiar filtros restaura todos los candidatos", async ({ page }) => {
    const tieneDatos = await contador(page).isVisible();
    if (!tieneDatos) {
      test.skip(true, "No hay candidatos");
      return;
    }

    const textoInicial = await contador(page).textContent();

    await escribirEnInput(page, "Nombre", "xyzxyzxyz_noexiste_123");

    await page
      .getByText(/no se encontraron resultados/i)
      .waitFor({ state: "visible", timeout: 10000 });

    await page.getByRole("button", { name: /limpiar filtros/i }).click();

    await contador(page).waitFor({ state: "visible" });
    const textoFinal = await contador(page).textContent();
    expect(textoFinal).toBe(textoInicial);

    await expect(
      page.getByPlaceholder(/nombre, posición, estado/i)
    ).toHaveValue("");
  });

  test("filtrar por año usando el select", async ({ page }) => {
    const tieneDatos = await contador(page).isVisible();
    if (!tieneDatos) {
      test.skip(true, "No hay candidatos");
      return;
    }

    const textoInicial = await contador(page).textContent();
    const totalInicial = parseInt(textoInicial?.match(/\d+/)?.[0] ?? "0");
    if (totalInicial === 0) return;

    await page.getByRole("combobox").nth(0).click();

    const opciones = page
      .getByRole("option")
      .filter({ hasNotText: /todos los años/i });
    const totalOpciones = await opciones.count();

    if (totalOpciones === 0) {
      test.skip(true, "No hay años disponibles");
      return;
    }

    const primerAno = await opciones.first().textContent();
    await opciones.first().click();

    await contador(page).waitFor({ state: "visible" });
    const textoFiltrado = await contador(page).textContent();
    const totalFiltrado = parseInt(textoFiltrado?.match(/\d+/)?.[0] ?? "0");

    expect(totalFiltrado).toBeLessThanOrEqual(totalInicial);
    console.log(
      `Año "${primerAno?.trim()}": ${totalInicial} → ${totalFiltrado} candidatos`
    );
  });

  test("filtrar por mes usando el select", async ({ page }) => {
    const tieneDatos = await contador(page).isVisible();
    if (!tieneDatos) {
      test.skip(true, "No hay candidatos");
      return;
    }

    const textoInicial = await contador(page).textContent();
    const totalInicial = parseInt(textoInicial?.match(/\d+/)?.[0] ?? "0");
    if (totalInicial === 0) return;

    await page.getByRole("combobox").nth(1).click();

    const opciones = page
      .getByRole("option")
      .filter({ hasNotText: /todos los meses/i });
    const totalOpciones = await opciones.count();

    if (totalOpciones === 0) {
      test.skip(true, "No hay meses disponibles");
      return;
    }

    const primerMes = await opciones.first().textContent();
    await opciones.first().click();

    await contador(page).waitFor({ state: "visible" });
    const textoFiltrado = await contador(page).textContent();
    const totalFiltrado = parseInt(textoFiltrado?.match(/\d+/)?.[0] ?? "0");

    expect(totalFiltrado).toBeLessThanOrEqual(totalInicial);
    console.log(
      `Mes "${primerMes?.trim()}": ${totalInicial} → ${totalFiltrado} candidatos`
    );
  });

  test("filtrar por estado usando el select", async ({ page }) => {
    const tieneDatos = await contador(page).isVisible();
    if (!tieneDatos) {
      test.skip(true, "No hay candidatos");
      return;
    }

    const textoInicial = await contador(page).textContent();
    const totalInicial = parseInt(textoInicial?.match(/\d+/)?.[0] ?? "0");
    if (totalInicial === 0) return;

    await page.getByRole("combobox").nth(2).click();

    const opciones = page
      .getByRole("option")
      .filter({ hasNotText: /todos los estados/i });
    const totalOpciones = await opciones.count();

    if (totalOpciones === 0) {
      test.skip(true, "No hay estados disponibles");
      return;
    }

    const primerEstado = await opciones.first().textContent();
    await opciones.first().click();

    await contador(page).waitFor({ state: "visible" });
    const textoFiltrado = await contador(page).textContent();
    const totalFiltrado = parseInt(textoFiltrado?.match(/\d+/)?.[0] ?? "0");

    expect(totalFiltrado).toBeLessThanOrEqual(totalInicial);
    console.log(
      `Estado "${primerEstado?.trim()}": ${totalInicial} → ${totalFiltrado} candidatos`
    );
  });
});
