const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authController = require("../controllers/auth-controller");

jest.mock("../models/User.js");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

test("should return 200 for valid login", async () => {
    const req = {
        body: { email: "test@test.de", password: "secret123" },
    };

    const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    User.findOne.mockResolvedValue({
        _id: "u1",
        email: "test@test.de",
        role: "employee",
        password: "hashed-password",
    });

    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("mock-token");

    await authController.login(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
});
