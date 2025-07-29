// Authentication API Service
// Handles user registration and login operations

import BaseApiService from './BaseApiService.js';

class AuthApiService extends BaseApiService {
  
  // POST /register - Register new user
  registerUser(email, password) {
    const userData = {
      email: email || this.generateUniqueEmail(),
      password: password || this.generateTestPassword()
    };

    return this.post('/register', userData).then(response => {
      this.validateResponse(response, 201);
      
      // Validate registration response
      expect(response.body).to.have.property('message', 'User created successfully');
      expect(response.body).to.have.property('userId');
      expect(response.body.userId).to.be.a('number');
      
      return {
        response: response,
        userData: userData,
        userId: response.body.userId
      };
    });
  }

  // POST /register with validation errors
  registerUserWithError(userData, expectedError) {
    return this.post('/register', userData, { 
      failOnStatusCode: false,
      timeout: this.failTimeout 
    }).then(response => {
      expect(response.status).to.be.oneOf([400, 409]);
      expect(response.body).to.have.property('error', expectedError);
      return response;
    });
  }

  // POST /login - Authenticate user
  loginUser(email, password) {
    const loginData = {
      email: email,
      password: password
    };

    return this.post('/login', loginData).then(response => {
      this.validateResponse(response, 200);
      
      // Validate login response
      expect(response.body).to.have.property('message', 'Login successful');
      expect(response.body).to.have.property('token');
      expect(response.body).to.have.property('user');
      
      // Validate JWT token format
      expect(response.body.token).to.be.a('string');
      expect(response.body.token.split('.')).to.have.length(3);
      
      // Validate user object
      expect(response.body.user).to.have.property('id');
      expect(response.body.user).to.have.property('email', email);
      
      return {
        response: response,
        token: response.body.token,
        user: response.body.user
      };
    });
  }

  // POST /login with invalid credentials
  loginUserWithError(email, password, expectedError) {
    const loginData = {
      email: email,
      password: password
    };

    return this.post('/login', loginData, { 
      failOnStatusCode: false,
      timeout: this.failTimeout 
    }).then(response => {
      expect(response.status).to.be.oneOf([400, 401]);
      expect(response.body).to.have.property('error', expectedError);
      return response;
    });
  }

  // Complete registration and login flow
  createAndLoginUser(email = null, password = null) {
    const testEmail = email || this.generateUniqueEmail();
    const testPassword = password || this.generateTestPassword();

    return this.registerUser(testEmail, testPassword).then(regResult => {
      return this.loginUser(testEmail, testPassword).then(loginResult => {
        return {
          email: testEmail,
          password: testPassword,
          userId: regResult.userId,
          token: loginResult.token,
          user: loginResult.user
        };
      });
    });
  }
}

export default AuthApiService;
