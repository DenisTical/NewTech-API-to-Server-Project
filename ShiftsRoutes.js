const express = require('express');
const router = express.Router();
const shiftController = require('../Controller/ShiftsController');
const userController = require('../Controller/UserController');

router.use(userController.protect);

router.post('/addShift', shiftController.addShift);
router.get('/getShiftById/:id', shiftController.getShiftById);
router.patch('/updateShiftById/:id', shiftController.updateShiftById);
router.get('/getAllShiftsCreatedByUser', shiftController.getAllShiftsCreatedByCurrentUser);

//Admin
router.get('/getAllShiftsFromAllUsers', userController.permission, shiftController.getAllShiftsFromAllUsers);
router.delete('/deleteShiftById/:id', userController.permission, shiftController.deleteShiftById);

module.exports = router;