const express = require("express");

const cors = require("cors");

const bodyParser = require("body-parser");

const RequestIp = require('@supercharge/request-ip');

const dataService = require("./modules/data-service.js");

const myData = dataService("connect string");

const app = express();

const jwt = require('jsonwebtoken');
const passport = require("passport");
const passportJWT = require("passport-jwt");

var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

// Configure its options
var jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme("jwt");



jwtOptions.secretOrKey = 'qweqwe';

var strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {
    console.log('payload received', jwt_payload);

    if (jwt_payload) {
        
        next(null, { _id: jwt_payload._id, 
            email: jwt_payload.email, 
            name: jwt_payload.name}); 
    } else {
        next(null, false);
    }
});
passport.use(strategy);

// add passport as application-level middleware
app.use(passport.initialize());

app.use(cors());

app.use(bodyParser.json());

const HTTP_PORT = process.env.PORT || 8080;

// POST /api/class (NOTE: This route must read the contents of the request body)
app.post("/api/class",passport.authenticate('jwt', { session: false }),(req,res)=>{
    myData.addNewClass(req.body).then((msg)=>{
        res.json({message: msg});
    }).catch((err)=>{
        res.json({message:`an error occurred: ${err}`});
    })
});

app.post("/api/userPro",(req,res)=>{
    myData.addNewUserDet(req.body).then((msg)=>{
        res.json({message: msg});
    }).catch((err)=>{
        res.json({message:`an error occurred: ${err}`});
    })
});

app.post("/api/register", (req, res) => {
    myData.registerUser(req.body)
        .then((msg) => {
            res.json({ "message": msg });
        }).catch((msg) => {
            res.json({ "message": msg });
        });
});

app.post("/api/instructor",(req,res)=>{
    myData.addNewInstructor(req.body).then((msg)=>{
        res.json({message: msg});
    }).catch((err)=>{
        res.json({message:`an error occurred: ${err}`});
    })
})

app.post("/api/login", (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    req.body.IPAddress = RequestIp.getClientIp(req);
    myData.checkUser(req.body)
        .then((user) => {
            var payload={
                _id: user._id,
                email:user.email,
                name:user.name
            };
            var token = jwt.sign(payload, jwtOptions.secretOrKey);
            res.json({ "message": "login successful", "token": token });
        }).catch((msg) => {
            res.status(422).json({ "message": msg });
        });
});

// GET /api/classes (NOTE: This route must accept the numeric query parameters "page" and "perPage", ie: /api/classes?page=1&perPage=5 )
app.get("/api/classes",(req,res)=>{
    
    myData.getAllClass(req.query.page,req.query.perPage).then((data)=>{
        res.json(data);
    }).catch((err)=>{
        res.json({message:`an error occurred: ${err}`});
    })
})

app.get("/api/instructors",(req,res)=>{
    
    myData.getAllInstructor(req.query.page,req.query.perPage).then((data)=>{
        res.json(data);
    }).catch((err)=>{
        res.json({message:`an error occurred: ${err}`});
    })
})

// GET /api/class (NOTE: This route must accept a numeric route parameter, ie: /api/class/5bd761dcae323e45a93ccfe8)

app.get("/api/class/:id",passport.authenticate('jwt', { session: false }),(req,res)=>{
    myData.getClassById(req.params.id).then((data)=>{
        res.json(data);
    }).catch((err)=>{
        res.json({message:`an error occurred: ${err}`});
    })
})

app.get("/api/instructorClass/:email",passport.authenticate('jwt', { session: false }),(req,res)=>{
    myData.getClassByInstructorEmail(req.params.email).then((data)=>{
        res.json(data);
    }).catch((err)=>{
        res.json({message:`an error occurred: ${err}`});
    })
})

app.get("/api/userPro/:email",passport.authenticate('jwt', { session: false }),(req,res)=>{
    myData.getUserDetByEmail(req.params.email).then((data)=>{
        res.json(data);
    }).catch((err)=>{
        res.json({message:`an error occurred: ${err}`});
    })
})

app.get("/api/instructor/:email",passport.authenticate('jwt', { session: false }),(req,res)=>{
    myData.getInstructorByEmail(req.params.email).then((data)=>{
        res.json(data);
    }).catch((err)=>{
        res.json({message:`an error occurred: ${err}`});
    })
})

// app.get("/api/instructor/:id",(req,res)=>{
//     myData.getInstructorByNumber(req.params.id).then((data)=>{
//         res.json(data);
//     }).catch((err)=>{
//         res.json({message:`an error occurred: ${err}`});
//     })
// })

// PUT /api/class (NOTE: This route must accept a numeric route parameter, ie: /api/class/5bd761dcae323e45a93ccfe8 as well as read the contents of the request body)
app.put("/api/class/:id",(req,res)=>{
   
    myData.updateClassById(req.body,req.params.id).then((msg)=>{
        res.json({message: msg});
    }).catch((err)=>{
        res.json({message:`an error occurred: ${err}`});
    })
});
app.put("/api/userPro/:email",(req,res)=>{
   
    myData.updateUserDetByEmail(req.body,req.params.email).then((msg)=>{
        res.json({message: msg});
    }).catch((err)=>{
        res.json({message:`an error occurred: ${err}`});
    })
});
app.put("/api/instructor/:id",(req,res)=>{
   
    myData.updateInstructorByNumber(req.body,req.params.id).then((msg)=>{
        res.json({message: msg});
    }).catch((err)=>{
        res.json({message:`an error occurred: ${err}`});
    })
});

// DELETE /api/class (NOTE: This route must accept a numeric route parameter, ie: /api/class/5bd761dcae323e45a93ccfe8)
app.delete("/api/class/:id",(req,res)=>{
    myData.deleteClassById(req.params.id).then((msg)=>{
        res.json({message: msg});
    }).catch((err)=>{
        res.json({message:`an error occurred: ${err}`});
    })
});

app.delete("/api/instructor/:id",(req,res)=>{
    myData.deleteInstructorByNumber(req.params.id).then((msg)=>{
        res.json({message: msg});
    }).catch((err)=>{
        res.json({message:`an error occurred: ${err}`});
    })
});


myData.initialize().then(()=>{
    app.listen(HTTP_PORT,()=>{
        console.log(`server listening on: ${HTTP_PORT}`);
    });
}).catch((err)=>{
    console.log(err);
});