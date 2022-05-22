import bcrypt from "bcryptjs";

export const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(12, (err, salt) => {
      if (err) {
        reject(err);
      }
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          reject(err);
        }
        resolve(hash);
      });
    });
  });
};

export const comparePassword = (password, hashedpassword) => {
  return bcrypt.compare(password, hashedpassword);
};

// export const optionHandler = (req, res, next) => {
//   if (req.method === "OPTIONS") {
//     console.log("!OPTIONS");
//     var headers = {};
//     // IE8 does not allow domains to be specified, just the *
//     // headers["Access-Control-Allow-Origin"] = req.headers.origin;
//     headers["Access-Control-Allow-Origin"] = "*";
//     headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
//     headers["Access-Control-Allow-Credentials"] = false;
//     headers["Access-Control-Max-Age"] = "86400"; // 24 hours
//     headers["Access-Control-Allow-Headers"] =
//       "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";
//     res.writeHead(200, headers);
//     res.end();
//   }
// };
