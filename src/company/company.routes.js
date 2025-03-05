import { Router } from "express";
import { check } from "express-validator";
import { validarCampos } from "../middlewares/validar-campos.js";
import { validarJWT } from "../middlewares/validar-jwt.js";
import { generateReport, getCompany, saveCompany , updateCompany } from "./company.controller.js";
import { existeUsuarioById } from "../helpers/db-validator.js";
import { uploadProfilePicture } from "../middlewares/multer-upload.js";

const router = Router();

router.post(
    "/add-company",
    [
        validarJWT,
        check('email', 'This is not a valid email').not().isEmpty(),
        validarCampos
    ],
    saveCompany

)

router.put(
    "/update-company/:id",
    [
        check("id", "No es un ID valido").isMongoId(),
        validarCampos
    ],
    updateCompany

)

router.get("/", getCompany)

router.get("/report", generateReport)











export default router;
