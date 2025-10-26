const request = require("supertest");
const expect = require("chai").expect;

describe("API Smoke Test", function () {
  it("should return status 200 for homepage", async function () {
    const res = await request("http://127.0.0.1:3000").get("/");
    expect(res.status).to.equal(200);
  });
});
