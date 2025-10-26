// tests/ui.test.js
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
// Ensure the chromedriver npm package is loaded and used by selenium.
// The chromedriver package includes the binary and exposes its path.
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const chromedriver = require("chromedriver");
  const service = new chrome.ServiceBuilder(chromedriver.path);
  chrome.setDefaultService(service);
  console.log("🔧 Using chromedriver from:", chromedriver.path);
} catch (err) {
  console.warn("⚠️ chromedriver package not found or failed to load:", err && err.message);
}
const { expect } = require("chai");
const serverModule = require("../server");

describe("UI Smoke Test (Full App)", function () {
  this.timeout(60000);
  let driver;
  let server;

  before(async function () {
    // Start the application server so Chrome can reach http://localhost:3000
    server = await serverModule.start();

    // Small delay to allow any middleware/DB warmups if necessary
    await new Promise((r) => setTimeout(r, 200));

    const options = new chrome.Options();

    // 🧠 For local Windows: show Chrome window
    if (process.platform === "win32") {
      options.addArguments("--start-maximized");
    } else {
      // 🧠 For Jenkins/Linux: use headless mode
      options.addArguments(
        "--headless=new",
        "--no-sandbox",
        "--disable-gpu",
        "--disable-dev-shm-usage"
      );
    }

    const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
    const fs = require("fs");
    if (fs.existsSync(chromePath)) {
      options.setChromeBinaryPath(chromePath);
      console.log("🔍 Found Chrome binary at", chromePath);
    } else {
      console.log("🔍 Chrome binary not found at", chromePath, "; using default.");
    }

    console.log("🚀 Launching Chrome...");
    driver = await new Builder()
      .forBrowser("chrome")
      .setChromeOptions(options)
      .build();

    const APP_URL = "http://localhost:3000";
    console.log(`🌐 Opening ${APP_URL} ...`);
    await driver.get(APP_URL);

    console.log("⌛ Waiting for page to load...");
    await driver.wait(until.elementLocated(By.css("body")), 15000);
    console.log("✅ Page loaded successfully!");
  });

  after(async function () {
    if (driver) {
      console.log("🧹 Closing browser...");
      await driver.quit();
    }
    if (server) {
      console.log("🧹 Stopping server...");
      // Call the module stop which is already defensive; ignore any errors silently.
      try {
        await serverModule.stop();
      } catch (err) {
        // intentionally empty — ignore errors during test cleanup
      }
    }
  });

  it("should display a page title", async function () {
    const title = await driver.getTitle();
    console.log("📄 Page title:", title);
    expect(title).to.be.a("string").and.not.empty;
  });

  it("should show a body element", async function () {
    const body = await driver.findElement(By.css("body"));
    const visible = await body.isDisplayed();
    expect(visible).to.be.true;
  });
});