//Auth
//Dependencies
const jwt = require("jsonwebtoken");
//JWT Secret
const secret = "Hesoyam"; // Secret key used for JWT (you should use a more secure key)

// Function to create an access token for a user
module.exports.createAccessToken = (user) => {
    const data = {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin
    };
    return jwt.sign(data, secret, {}); // Sign the user data with the secret key and return the token
}

// Middleware to verify JWT token in the request headers
module.exports.verify = (req, res, next) => {
    console.log("This is from req.headers.authorization");
    console.log(req.headers.authorization);

    let token = req.headers.authorization;

    if (typeof token === "undefined") {
        return res.send({ auth: "Failed. No Token" }); // No token provided in the headers
    } else {
        token = token.slice(7, token.length); // Remove the "Bearer " prefix
        console.log(token);

        // Verify the token with the secret key
        jwt.verify(token, secret, function (err, decodedToken) {
            if (err) {
                return res.send({
                    auth: "Failed",
                    message: err.message
                }); // Token verification failed
            } else {
                console.log("Data that will be assigned to the req.user");
                console.log(decodedToken);
                req.user = decodedToken; // Attach decoded user data to the request object
                next(); // Proceed to the next middleware
            }
        });
    }
}

// Middleware to verify if the user is an admin
module.exports.verifyAdmin = (req, res, next) => {
    if (req.user.isAdmin) {
        next(); // User is an admin, proceed to the next middleware
    } else {
        return res.send({
            auth: "Failed",
            message: "Action Forbidden"
        }); // User is not an admin, deny access
    }
}