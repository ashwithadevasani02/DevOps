const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
// Use chromedriver package to locate the driver binary when it's not on PATH
const chromedriver = require("chromedriver");
const { start, stop } = require("../server");
const assert = require("assert");

let driver;

describe("UI Smoke Test (Full App)", function () {
  this.timeout(60000); // 60s timeout

  before(async () => {
    console.log("⏳ Starting server on port 3000...");
    await start(3000);
    console.log("✅ Server started");

    const options = new chrome.Options();
    options.addArguments("--headless", "--no-sandbox", "--disable-dev-shm-usage");

    try {
      console.log("⏳ Starting Chrome WebDriver...");

      // Ensure the chromedriver binary directory is on PATH so selenium's
      // Builder can locate it. This avoids relying on setChromeService /
      // setDefaultService APIs which vary between library versions.
      const path = require("path");
      const chromedriverDir = path.dirname(chromedriver.path);
      process.env.PATH = `${chromedriverDir}${path.delimiter}${process.env.PATH}`;

      driver = await new Builder()
        .forBrowser("chrome")
        .setChromeOptions(options)
        .build();

      console.log("✅ WebDriver started, navigating to app...");
      await driver.get("http://localhost:3000");

      // Wait for either a non-empty title or an <h1> to appear
      await driver.wait(async () => {
        const title = await driver.getTitle();
        if (title && title.trim().length > 0) return true;
        const elems = await driver.findElements(By.tagName("h1"));
        return elems.length > 0;
      }, 15000);

      console.log("✅ Page loaded (title or H1 present)");
    } catch (err) {
      console.error("Error during before() setup:", err);
      // Rethrow so mocha reports the hook failure
      throw err;
    }
  });

  it("should display a page title", async () => {
    const title = await driver.getTitle();
    console.log("🔍 Page title:", title);
    assert.ok(title && title.length > 0, "Page title should not be empty");
  });

  after(async () => {
    try {
      if (driver) {
        console.log("Shutting down WebDriver...");
        await driver.quit();
      }
    } catch (err) {
      console.warn("Warning while quitting WebDriver:", err && err.message ? err.message : err);
    }

    try {
      console.log("Stopping server...");
      await stop();
      console.log("Server stopped");
    } catch (err) {
      // Ignore server-not-running races
      if (err && err.code === "ERR_SERVER_NOT_RUNNING") {
        console.warn("Server was not running when attempting to stop (ignored).");
      } else {
        console.error("Error while stopping server:", err);
        throw err;
      }
    }
    // Ensure we always print a final confirmation that cleanup ran.
    // This helps when the process doesn't fully terminate or for CI logs.
    console.log("Server stopped (final)");
  });
});
