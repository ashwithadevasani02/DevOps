// tests/ui.test.js
const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const { expect } = require("chai");

describe("UI Smoke Test (Full App)", function () {
  this.timeout(60000);
  let driver;

  before(async function () {
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

    options.setChromeBinaryPath(
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    );

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
