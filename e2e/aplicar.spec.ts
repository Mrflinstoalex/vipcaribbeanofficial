import { test, expect } from "@playwright/test";

/**
 * Carga un archivo en el input#cv invocando directamente el handler
 * de React almacenado en __reactProps$... del nodo DOM.
 * Es necesario porque Playwright (CDP) no pasa por el sistema de
 * delegación de eventos de React 18 en las islas de Astro.
 */
const uploadCV = async (
  page: any,
  file: { name: string; mimeType: string; buffer: Buffer }
) => {
  await page.evaluate(
    ({ name, mimeType, content }: { name: string; mimeType: string; content: number[] }) => {
      const input = document.getElementById("cv") as HTMLInputElement;
      if (!input) throw new Error("Input #cv no encontrado");

      const propsKey = Object.keys(input).find((k) => k.startsWith("__reactProps$"));
      if (!propsKey) throw new Error("React props no encontrados en #cv");

      const onChange = (input as any)[propsKey]?.onChange;
      if (!onChange) throw new Error("onChange no encontrado en React props");

      const fileObj = new File([new Uint8Array(content)], name, { type: mimeType });
      const dt = new DataTransfer();
      dt.items.add(fileObj);
      Object.defineProperty(input, "files", { value: dt.files, configurable: true });

      onChange({ target: input, currentTarget: input });
    },
    { name: file.name, mimeType: file.mimeType, content: Array.from(file.buffer) }
  );
};

const CV_PDF = {
  name: "cv-prueba.pdf",
  mimeType: "application/pdf",
  buffer: Buffer.from("%PDF-1.4 1 0 obj<</Type/Catalog>>endobj"),
};

const CV_INVALIDO = {
  name: "foto.jpg",
  mimeType: "image/jpeg",
  buffer: Buffer.from("fake image data"),
};

test.describe("Página de Aplicar (/aplicar)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/aplicar");
    // Esperar a que React haya hidratado: #cv debe tener __reactProps$
    await page.waitForFunction(() => {
      const el = document.getElementById("cv");
      return el && Object.keys(el).some((k) => k.startsWith("__reactProps$"));
    }, { timeout: 15000 });
  });

  // ─── Renderizado ───────────────────────────────────────────────────────────

  test("carga la página correctamente", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: /aplica para tu sueño/i })
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /formulario de aplicación/i })
    ).toBeVisible();
  });

  test("muestra todos los campos del formulario", async ({ page }) => {
    await expect(page.locator("#nombre")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#telefono")).toBeVisible();
    await expect(page.getByText(/curriculum vitae/i)).toBeVisible();
    await expect(page.locator("#mensaje")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /enviar aplicación/i })
    ).toBeVisible();
  });

  // ─── Validaciones client-side ──────────────────────────────────────────────

  test("muestra error si se intenta enviar sin CV", async ({ page }) => {
    await page.locator("#nombre").click();
    await page.keyboard.type("Juan Pérez", { delay: 40 });
    await expect(page.locator("#nombre")).toHaveValue("Juan Pérez");

    await page.locator("#email").click();
    await page.keyboard.type("test@test.com", { delay: 40 });
    await expect(page.locator("#email")).toHaveValue("test@test.com");

    await page.locator("#telefono").click();
    await page.keyboard.type("8091234567", { delay: 40 });
    await expect(page.locator("#telefono")).toHaveValue("8091234567");

    // NO subimos CV
    await page.getByRole("button", { name: /enviar aplicación/i }).click();

    // .first() evita strict mode: shadcn duplica el texto en un aria-live oculto
    await expect(page.getByText(/cv requerido/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("rechaza archivos que no sean PDF o Word", async ({ page }) => {
    await uploadCV(page, CV_INVALIDO);

    await expect(page.getByText(/formato no válido/i).first()).toBeVisible({ timeout: 10000 });
    // El área de subida debe seguir mostrando el estado vacío
    await expect(page.getByText(/haz clic para subir tu cv/i)).toBeVisible();
  });

  // ─── Upload de CV ──────────────────────────────────────────────────────────

  test("muestra el nombre del archivo al subir un CV válido", async ({ page }) => {
    await uploadCV(page, CV_PDF);

    await expect(page.getByText("cv-prueba.pdf")).toBeVisible({ timeout: 10000 });
  });

  test("muestra el tamaño del archivo tras subirlo", async ({ page }) => {
    await uploadCV(page, CV_PDF);

    await expect(page.getByText(/\d+\.\d+ mb/i)).toBeVisible({ timeout: 10000 });
  });

  // ─── Flujo de envío (API mockeada) ─────────────────────────────────────────

  test("envía el formulario y muestra confirmación de éxito", async ({ page }) => {
    await page.route("/api/email/aplicar", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      })
    );

    await uploadCV(page, CV_PDF);
    await expect(page.getByText("cv-prueba.pdf")).toBeVisible({ timeout: 10000 });

    await page.locator("#nombre").click();
    await page.keyboard.type("Juan Pérez", { delay: 40 });
    await expect(page.locator("#nombre")).toHaveValue("Juan Pérez");

    await page.locator("#email").click();
    await page.keyboard.type("juan@test.com", { delay: 40 });
    await expect(page.locator("#email")).toHaveValue("juan@test.com");

    await page.locator("#telefono").click();
    await page.keyboard.type("8091234567", { delay: 40 });
    await expect(page.locator("#telefono")).toHaveValue("8091234567");

    await page.locator("#mensaje").click();
    await page.keyboard.type("Tengo experiencia en restaurantes.", { delay: 40 });

    await page.getByRole("button", { name: /enviar aplicación/i }).click();

    await expect(
      page.getByText(/aplicación enviada exitosamente/i).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("muestra error si la API falla", async ({ page }) => {
    await page.route("/api/email/aplicar", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ message: "Error interno del servidor" }),
      })
    );

    await uploadCV(page, CV_PDF);
    await expect(page.getByText("cv-prueba.pdf")).toBeVisible({ timeout: 10000 });

    await page.locator("#nombre").click();
    await page.keyboard.type("Juan Pérez", { delay: 40 });
    await expect(page.locator("#nombre")).toHaveValue("Juan Pérez");

    await page.locator("#email").click();
    await page.keyboard.type("juan@test.com", { delay: 40 });
    await expect(page.locator("#email")).toHaveValue("juan@test.com");

    await page.locator("#telefono").click();
    await page.keyboard.type("8091234567", { delay: 40 });
    await expect(page.locator("#telefono")).toHaveValue("8091234567");

    await page.getByRole("button", { name: /enviar aplicación/i }).click();

    await expect(page.getByText(/error al enviar/i).first()).toBeVisible({ timeout: 10000 });
  });

  test("resetea el formulario tras envío exitoso", async ({ page }) => {
    await page.route("/api/email/aplicar", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      })
    );

    await uploadCV(page, CV_PDF);
    await expect(page.getByText("cv-prueba.pdf")).toBeVisible({ timeout: 10000 });

    await page.locator("#nombre").click();
    await page.keyboard.type("Juan Pérez", { delay: 40 });
    await expect(page.locator("#nombre")).toHaveValue("Juan Pérez");

    await page.locator("#email").click();
    await page.keyboard.type("juan@test.com", { delay: 40 });
    await expect(page.locator("#email")).toHaveValue("juan@test.com");

    await page.locator("#telefono").click();
    await page.keyboard.type("8091234567", { delay: 40 });
    await expect(page.locator("#telefono")).toHaveValue("8091234567");

    await page.getByRole("button", { name: /enviar aplicación/i }).click();
    await expect(page.getByText(/aplicación enviada exitosamente/i).first()).toBeVisible({
      timeout: 10000,
    });

    // Formulario limpio
    await expect(page.locator("#nombre")).toHaveValue("");
    await expect(page.locator("#email")).toHaveValue("");
    await expect(page.locator("#telefono")).toHaveValue("");
    await expect(page.getByText(/haz clic para subir tu cv/i)).toBeVisible();
  });
});
