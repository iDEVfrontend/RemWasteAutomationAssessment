describe("RemWaste API - Authentication Tests", () => {
  const baseUrl = "https://remwaste-backend.onrender.com";
  let testEmail;
  let testPassword;
  let authToken;

  beforeEach(() => {
    // Generate unique test email for each test run
    const timestamp = Date.now();
    testEmail = `test.user.${timestamp}@remwaste.test`;
    testPassword = "TestPassword123!";
  });

  describe("User Registration", () => {
    it("POST /register - Should register new user successfully", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/register`,
        body: {
          email: testEmail,
          password: testPassword,
        },
        timeout: 15000,
      }).then((response) => {
        // Validate response status
        expect(response.status).to.eq(201);

        // Validate response headers
        expect(response.headers["content-type"]).to.include("application/json");

        // Validate response body
        expect(response.body).to.have.property(
          "message",
          "User created successfully"
        );
        expect(response.body).to.have.property("userId");
        expect(response.body.userId).to.be.a("number");

        cy.log(`User registered with ID: ${response.body.userId}`);
      });
    });

    it("POST /register - Should fail with missing email", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/register`,
        body: {
          password: testPassword,
        },
        failOnStatusCode: false,
        timeout: 10000,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property(
          "error",
          "Email and password are required"
        );
      });
    });

    it("POST /register - Should fail with missing password", () => {
      cy.request({
        method: "POST",
        url: `${baseUrl}/register`,
        body: {
          email: testEmail,
        },
        failOnStatusCode: false,
        timeout: 10000,
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body).to.have.property(
          "error",
          "Email and password are required"
        );
      });
    });
  });
});
describe("User Login", () => {
  beforeEach(() => {
    // Register user first for login tests
    cy.request({
      method: "POST",
      url: `${baseUrl}/register`,
      body: {
        email: testEmail,
        password: testPassword,
      },
    });
  });

  it("POST /login - Should login successfully with valid credentials", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/login`,
      body: {
        email: testEmail,
        password: testPassword,
      },
      timeout: 15000,
    }).then((response) => {
      // Validate response status
      expect(response.status).to.eq(200);

      // Validate response headers
      expect(response.headers["content-type"]).to.include("application/json");

      // Validate response body
      expect(response.body).to.have.property("message", "Login successful");
      expect(response.body).to.have.property("token");
      expect(response.body).to.have.property("user");

      // Validate token format (JWT)
      expect(response.body.token).to.be.a("string");
      expect(response.body.token.split(".")).to.have.length(3); // JWT has 3 parts

      // Validate user object
      expect(response.body.user).to.have.property("id");
      expect(response.body.user).to.have.property("email", testEmail);

      // Store token for other tests
      authToken = response.body.token;
      cy.log(`Login successful, token: ${authToken.substring(0, 20)}...`);
    });
  });

  it("POST /login - Should fail with invalid email", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/login`,
      body: {
        email: "invalid@email.com",
        password: testPassword,
      },
      failOnStatusCode: false,
      timeout: 10000,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property("error", "Invalid credentials");
    });
  });

  it("POST /login - Should fail with invalid password", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/login`,
      body: {
        email: testEmail,
        password: "wrongpassword",
      },
      failOnStatusCode: false,
      timeout: 10000,
    }).then((response) => {
      expect(response.status).to.eq(401);
      expect(response.body).to.have.property("error", "Invalid credentials");
    });
  });

  it("POST /login - Should fail with missing credentials", () => {
    cy.request({
      method: "POST",
      url: `${baseUrl}/login`,
      body: {},
      failOnStatusCode: false,
      timeout: 10000,
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.have.property(
        "error",
        "Email and password are required"
      );
    });
  });
});

describe("Duplicate Registration", () => {
  it("POST /register - Should fail when registering existing user", () => {
    // First registration
    cy.request({
      method: "POST",
      url: `${baseUrl}/register`,
      body: {
        email: testEmail,
        password: testPassword,
      },
    }).then(() => {
      // Attempt duplicate registration
      cy.request({
        method: "POST",
        url: `${baseUrl}/register`,
        body: {
          email: testEmail,
          password: testPassword,
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.eq(409);
        expect(response.body).to.have.property("error", "User already exists");
      });
    });
  });
});
