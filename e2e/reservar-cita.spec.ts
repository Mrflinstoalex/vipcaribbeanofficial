import { test, expect } from "@playwright/test";

// Selector del único día habilitado en el calendario (el próximo miércoles)
const diaHabilitado = (page: any) =>
  page
    .locator('[role="gridcell"] button:not([disabled]):not([aria-disabled="true"])')
    .first();

/**
 * Hace clic en el día habilitado y espera a que aparezcan los horarios
 * antes de continuar, evitando race conditions con el render condicional.
 */
const seleccionarDia = async (page: any) => {
  await diaHabilitado(page).click();
  await page.getByText(/horarios disponibles/i).waitFor({ state: "visible" });
};

// Ayuda a llenar un Input de React con teclado real
const escribir = async (page: any, selector: string, valor: string) => {
  await page.locator(selector).click();
  await page.keyboard.type(valor, { delay: 40 });
};

test.describe("Página de Reservar Cita (/reservar-cita)", () => {
  test.beforeEach(async ({ page }) => {
    // Interceptar endpoints de WordPress para no depender de datos externos
    await page.route(/wp-json\/vipc\/v1\/blocked-dates/, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ blocked_dates: [] }),
      })
    );
    await page.route(/wp-json\/vipc\/v1\/locked-times/, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ locked_times: [] }),
      })
    );

    await page.goto("/reservar-cita");
    // Esperar a que termine la carga de disponibilidad:
    // confirma que React hidró + los mocks de WordPress respondieron.
    // Si el texto nunca aparece (carga instantánea), waitFor pasa de inmediato.
    await page.getByText(/cargando disponibilidad/i).waitFor({ state: "hidden", timeout: 15000 });
  });

  // ─── Renderizado ───────────────────────────────────────────────────────────

  test("carga la página correctamente", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /agenda tu/i })
    ).toBeVisible();
  });

  test("muestra las dos columnas del formulario", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /selecciona fecha y hora/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /información de contacto/i })
    ).toBeVisible();
  });

  test("muestra los campos de contacto", async ({ page }) => {
    await expect(page.locator("#nombre")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#telefono")).toBeVisible();
  });

  test("el botón 'Confirmar Reserva' está deshabilitado sin datos", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /confirmar reserva/i })
    ).toBeDisabled();
  });

  // ─── Calendario y horarios ─────────────────────────────────────────────────

  test("solo hay un día habilitado en el calendario (el próximo miércoles)", async ({ page }) => {
    const enabled = page.locator(
      '[role="gridcell"] button:not([disabled]):not([aria-disabled="true"])'
    );
    await expect(enabled).toHaveCount(1, { timeout: 10000 });
  });

  test("al seleccionar el miércoles aparecen los horarios disponibles", async ({ page }) => {
    await seleccionarDia(page);

    await expect(page.getByText(/horarios disponibles/i)).toBeVisible();
    await expect(page.getByRole("button", { name: "9:00 AM" })).toBeVisible();
    await expect(page.getByRole("button", { name: "12:00 PM" })).toBeVisible();
  });

  test("al seleccionar hora queda marcada visualmente", async ({ page }) => {
    await seleccionarDia(page);

    const boton930 = page.getByRole("button", { name: "9:30 AM" });
    await boton930.click();

    // El botón seleccionado recibe el estilo activo (tiene clase scale-105 / bg-primary)
    await expect(boton930).toHaveClass(/bg-primary/, { timeout: 5000 });
  });

  // ─── Flujo de envío (API mockeada) ─────────────────────────────────────────

  test("envía el formulario y muestra la pantalla de confirmación", async ({ page }) => {
    await page.route("/api/email/cita", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      })
    );

    await seleccionarDia(page);
    await page.getByRole("button", { name: "9:00 AM" }).click();

    await escribir(page, "#nombre", "María García");
    await escribir(page, "#email", "maria@test.com");
    await escribir(page, "#telefono", "8091234567");

    await page.getByRole("button", { name: /confirmar reserva/i }).click();

    await expect(
      page.getByRole("heading", { name: /¡cita reservada exitosamente!/i })
    ).toBeVisible({ timeout: 10000 });
  });

  test("la pantalla de confirmación muestra la hora reservada", async ({ page }) => {
    await page.route("/api/email/cita", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      })
    );

    await seleccionarDia(page);
    await page.getByRole("button", { name: "9:00 AM" }).click();

    await escribir(page, "#nombre", "María García");
    await escribir(page, "#email", "maria@test.com");
    await escribir(page, "#telefono", "8091234567");

    await page.getByRole("button", { name: /confirmar reserva/i }).click();

    await expect(
      page.getByRole("heading", { name: /¡cita reservada exitosamente!/i })
    ).toBeVisible({ timeout: 10000 });

    // Muestra la hora seleccionada y botón para volver
    await expect(page.getByText("9:00 AM")).toBeVisible();
    await expect(page.getByRole("link", { name: /volver al inicio/i })).toBeVisible();
  });

  test("muestra error general si la API falla con 500", async ({ page }) => {
    // Sin campo "message" para que el componente use el texto de fallback
    await page.route("/api/email/cita", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: true }),
      })
    );

    await seleccionarDia(page);
    await page.getByRole("button", { name: "9:00 AM" }).click();

    await escribir(page, "#nombre", "María García");
    await escribir(page, "#email", "maria@test.com");
    await escribir(page, "#telefono", "8091234567");

    await page.getByRole("button", { name: /confirmar reserva/i }).click();

    // .first() evita la violación de strict mode con el aria-live oculto de shadcn
    await expect(
      page.getByText(/no se pudo reservar la cita/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("muestra error de límite semanal (429)", async ({ page }) => {
    await page.route("/api/email/cita", (route) =>
      route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          code: "EMAIL_WEEKLY_LIMIT",
          message: "Límite semanal alcanzado",
        }),
      })
    );

    await seleccionarDia(page);
    await page.getByRole("button", { name: "9:00 AM" }).click();

    await escribir(page, "#nombre", "María García");
    await escribir(page, "#email", "maria@test.com");
    await escribir(page, "#telefono", "8091234567");

    await page.getByRole("button", { name: /confirmar reserva/i }).click();

    await expect(
      page.getByText(/ya existe una cita registrada/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("botón deshabilitado hasta completar todos los campos", async ({ page }) => {
    const boton = page.getByRole("button", { name: /confirmar reserva/i });

    // Sin nada → deshabilitado
    await expect(boton).toBeDisabled();

    // Con fecha sola → deshabilitado
    await diaHabilitado(page).click();
    await expect(boton).toBeDisabled();

    // Con fecha + hora → deshabilitado (esperar a que los slots aparezcan)
    await page.getByText(/horarios disponibles/i).waitFor({ state: "visible" });
    await page.getByRole("button", { name: "9:00 AM" }).click();
    await expect(boton).toBeDisabled();

    // Con todos los datos → habilitado
    await escribir(page, "#nombre", "Test");
    await escribir(page, "#email", "test@test.com");
    await escribir(page, "#telefono", "8091234567");

    await expect(boton).toBeEnabled({ timeout: 5000 });
  });
});
