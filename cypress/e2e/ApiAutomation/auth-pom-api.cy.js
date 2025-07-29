// Authentication API Tests -
// Tests user registration and login functionality

import AuthApiService from "../../api/services/AuthApiService.js";
import TestDataModels from "../../api/models/TestDataModels.js";

describe("RemWaste API - Authentication Tests (POM)", () => {
  let authApi;
  let testUser;
  let errorMessages;

  before(() => {
    authApi = new AuthApiService();
    errorMessages = TestDataModels.getAuthErrorMessages();
  });

  beforeEach(() => {
    testUser = TestDataModels.getValidUser();
  });

  describe("User Registration", () => {
    it("Should register new user successfully", () => {
      authApi.registerUser(testUser.email, testUser.password).then((result) => {
        cy.log(`✅ User registered: ${result.userData.email}`);
        cy.log(`User ID: ${result.userId}`);

        expect(result.userId).to.be.a("number");
        expect(result.userData.email).to.eq(testUser.email);
      });
    });

    it("Should register user with minimal data", () => {
      authApi.registerUser().then((result) => {
        cy.log(
          `✅ User registered with generated data: ${result.userData.email}`
        );
        expect(result.userId).to.be.a("number");
      });
    });

    it("Should fail registration with missing email", () => {
      const invalidData = TestDataModels.getInvalidUserData().missingEmail;
      authApi
        .registerUserWithError(invalidData, errorMessages.MISSING_CREDENTIALS)
        .then(() => {
          cy.log("✅ Missing email validation passed");
        });
    });

    it("Should fail registration with missing password", () => {
      const invalidData = TestDataModels.getInvalidUserData().missingPassword;
      authApi
        .registerUserWithError(invalidData, errorMessages.MISSING_CREDENTIALS)
        .then(() => {
          cy.log("✅ Missing password validation passed");
        });
    });

    it("Should fail when registering duplicate user", () => {
      // First registration
      authApi.registerUser(testUser.email, testUser.password).then(() => {
        // Attempt duplicate registration
        authApi
          .registerUserWithError(testUser, errorMessages.USER_EXISTS)
          .then(() => {
            cy.log("✅ Duplicate user validation passed");
          });
      });
    });
  });

  describe("User Login", () => {
    beforeEach(() => {
      // Register user before each login test
      authApi.registerUser(testUser.email, testUser.password);
    });

    it("Should login successfully with valid credentials", () => {
      authApi.loginUser(testUser.email, testUser.password).then((result) => {
        cy.log(`✅ User logged in: ${result.user.email}`);
        cy.log(`Token: ${result.token.substring(0, 20)}...`);

        expect(result.token).to.be.a("string");
        expect(result.user.email).to.eq(testUser.email);
        expect(result.token.split(".")).to.have.length(3); // JWT format
      });
    });

    it("Should fail login with invalid email", () => {
      authApi
        .loginUserWithError(
          "invalid@email.com",
          testUser.password,
          errorMessages.INVALID_CREDENTIALS
        )
        .then(() => {
          cy.log("✅ Invalid email validation passed");
        });
    });

    it("Should fail login with invalid password", () => {
      authApi
        .loginUserWithError(
          testUser.email,
          "wrongpassword",
          errorMessages.INVALID_CREDENTIALS
        )
        .then(() => {
          cy.log("✅ Invalid password validation passed");
        });
    });

    it("Should fail login with missing credentials", () => {
      const emptyData = TestDataModels.getInvalidUserData().emptyData;
      authApi
        .loginUserWithError(
          emptyData.email,
          emptyData.password,
          errorMessages.MISSING_CREDENTIALS
        )
        .then(() => {
          cy.log("✅ Missing credentials validation passed");
        });
    });
  });

  describe("Complete Authentication Flow", () => {
    it("Should complete registration and login workflow", () => {
      authApi.createAndLoginUser().then((result) => {
        cy.log(`✅ Complete workflow: ${result.email}`);
        cy.log(
          `User ID: ${result.userId}, Token: ${result.token.substring(
            0,
            20
          )}...`
        );

        expect(result.email).to.include("@remwaste.test");
        expect(result.userId).to.be.a("number");
        expect(result.token).to.be.a("string");
        expect(result.user.id).to.eq(result.userId);
      });
    });
  });
});
