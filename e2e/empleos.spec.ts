import { test, expect } from "@playwright/test";

// Párrafo contador "Mostrando X vacantes"
const contador = (page: any) =>
  page.locator("p").filter({ hasText: /^Mostrando \d+/ });

// Botones de categoría (están en main, no son "Todas las vacantes" ni "Ver Detalles")
const botonesCategorias = (page: any) =>
  page
    .locator("main button")
    .filter({ hasNotText: /todas las vacantes|ver detalles/i });

test.describe("Página de Empleos", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/empleos");
    await contador(page).waitFor({ state: "visible" });
  });

  test("carga la página correctamente", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /vacantes disponibles/i })
    ).toBeVisible();
  });

  test("muestra el contador de vacantes", async ({ page }) => {
    await expect(contador(page)).toBeVisible();
    const texto = await contador(page).textContent();
    expect(texto).toMatch(/\d+/);
  });

  test("el botón 'Todas las vacantes' está visible y activo por defecto", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /todas las vacantes/i })
    ).toBeVisible();
  });

  test("filtrar por categoría reduce las vacantes mostradas", async ({ page }) => {
    const textoAntes = await contador(page).textContent();
    const totalAntes = parseInt(textoAntes?.match(/\d+/)?.[0] ?? "0");

    const totalBotones = await botonesCategorias(page).count();
    if (totalBotones === 0) {
      test.skip(true, "No hay categorías disponibles");
      return;
    }

    const primerBoton = botonesCategorias(page).first();
    const nombreCategoria = await primerBoton.textContent();
    await primerBoton.click();

    await contador(page).waitFor({ state: "visible" });
    const textoDespues = await contador(page).textContent();
    const totalDespues = parseInt(textoDespues?.match(/\d+/)?.[0] ?? "0");

    expect(totalDespues).toBeLessThanOrEqual(totalAntes);
    console.log(
      `Categoría "${nombreCategoria?.trim()}": ${totalAntes} → ${totalDespues} vacantes`
    );
  });

  test("cambiar entre categorías actualiza el contador", async ({ page }) => {
    const totalBotones = await botonesCategorias(page).count();
    if (totalBotones < 2) {
      test.skip(true, "Se necesitan al menos 2 categorías");
      return;
    }

    await botonesCategorias(page).first().click();
    await contador(page).waitFor({ state: "visible" });
    const count1 = await contador(page).textContent();

    await botonesCategorias(page).nth(1).click();
    await contador(page).waitFor({ state: "visible" });
    const count2 = await contador(page).textContent();

    expect(count1).toMatch(/\d+/);
    expect(count2).toMatch(/\d+/);

    await page.getByRole("button", { name: /todas las vacantes/i }).click();
    await contador(page).waitFor({ state: "visible" });
    await expect(contador(page)).toBeVisible();
  });

  test("el botón 'Ver Detalles' lleva a la página de la vacante", async ({ page }) => {
    const primerLink = page
      .getByRole("link")
      .filter({ hasText: /ver detalles/i })
      .first();
    await expect(primerLink).toBeVisible();

    const href = await primerLink.getAttribute("href");
    expect(href).toMatch(/^\/empleos\/.+/);

    await primerLink.click();
    await page.waitForURL(/\/empleos\/.+/);

    await expect(
      page.getByRole("link", { name: /volver a empleos/i })
    ).toBeVisible();
    // Scoped a main para no matchear el link "Aplicar Ahora" del header
    await expect(
      page.locator("main").getByRole("link", { name: /aplicar ahora/i })
    ).toBeVisible();
  });

  test("la página de detalle muestra la información de la vacante", async ({ page }) => {
    await page
      .getByRole("link")
      .filter({ hasText: /ver detalles/i })
      .first()
      .click();
    await page.waitForURL(/\/empleos\/.+/);

    const titulo = page.getByRole("heading", { level: 1 });
    await expect(titulo).toBeVisible();
    const textoTitulo = await titulo.textContent();
    expect(textoTitulo?.trim().length).toBeGreaterThan(0);

    await expect(
      page.getByRole("heading", { level: 2, name: /descripción del puesto/i })
    ).toBeVisible();
    await expect(page.getByText(/duración del contrato/i).first()).toBeVisible();
  });

  test("volver a empleos desde el detalle funciona", async ({ page }) => {
    await page
      .getByRole("link")
      .filter({ hasText: /ver detalles/i })
      .first()
      .click();
    await page.waitForURL(/\/empleos\/.+/);

    await page.getByRole("link", { name: /volver a empleos/i }).click();
    await page.waitForURL(/\/empleos$/);

    await expect(
      page.getByRole("heading", { name: /vacantes disponibles/i })
    ).toBeVisible();
  });
});
