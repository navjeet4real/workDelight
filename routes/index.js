const router = require('express').Router();
const authRoute = require('./userRoutes');

router.use('/auth', authRoute)


module.exports = router;