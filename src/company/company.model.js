import { Schema, model } from "mongoose";

const CompanySchema = Schema(
    {
        name: {
            type: String,
            required: true 
        },

        impact:{
            type: String,
            required:[true, "Use BAJO, MODERADO, ALTO, MUY_ALTO"],
            enum: ["BAJO", "MODERADO", "ALTO","MUY_ALTO"],

        },
        years:{
            type: String,
            required: [true, "Years Way is required"],
            maxLenght: [50, "cant be overcome 50 characters"]

        }, 
        category:{
            type: String,
            required: [true, "Category is required"],
            enum: ["MICROEMPRESA", "PEQUEÑA_EMPRESA", "MEDIANA_EMPRESA", "GRANDE_EMPRESA"],

        },

        keeper:{
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        status:{
            type: Boolean,
            default: true
        }
 },
    {
        timestamps: true,
        versionKey: false
    }
);

export default model("Company", CompanySchema);