import User from '../users/user.model.js'
import Company from './company.model.js'
import ExcelJS from 'exceljs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { fstat } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));


export const saveCompany = async (req , res) => {
    try {
        const data = req.body;
        const user = await User.findOne({ email: data.email});
        console.log(user)
        if(!user){
            return res.status(404).json({
                success: false, 
                message:'El administrador no existe'
            })
        }
        
        const company = new Company({
            ...data,
            keeper: user._id
        });
        
        await company.save();

        res.status(200).json({
            success: true,
            message: 'The company was successfully added',
            userDetails: {
                message: `Welcome ${company.name} `
            },
            company
        })

    } catch (error) {
        res.status(500).json({
            success: false, 
            message: 'error saving company',
            error
        })
        
    }
    
}

export const updateCompany =  async (req, res = response ) => {
    try {
        const { id } = req.params;
        const {_id,  email, ...data} = req.body;

      const company =  await Company.findByIdAndUpdate(id, data, {new: true});

        res.status(200).json({
            success: true,
            message: 'The company was successfully updated',
            company
        })
    } catch (error) {
        res.status(500).json({
            success: false, 
            message: 'error updating company',
            error
        })
    }

}

export const getCompany = async (req, res) => {

    const {limite = 10, desde = 0, orden = "A-Z"} = req.query
    const query = {status: true};

    try {

        const company = await Company.find(query)
            .skip(Number(desde))
            .limit(Number(limite));


            const companyWhithOwnerNames = await Promise.all(company.map(async (company)=>{
                const owner = await User.findById(company.keeper);
                return {
                    ...company.toObject(),
                    keeper: owner ? owner.name : 'Administrador no Encotrado'
                }
            }));

            if (orden === "A-Z") {
                companyWhithOwnerNames.sort((a, b) => a.category.localeCompare(b.category));
            } else if (orden === "Z-A") {
                companyWhithOwnerNames.sort((a, b) => b.category.localeCompare(a.category));
            } else if (orden === "years") {
                companyWhithOwnerNames.sort((a, b) => a.years - b.years);
            }


            const total = await Company.countDocuments(query);
            res.status(200).json({
                success: true,
                total,
                pats: companyWhithOwnerNames
            })

            
        
    } catch (error) {
        res.status(500).json({
            success: false, 
            message: 'Error getting company',
            error
        })
        
    }
}
  

export const generateReport = async (req, res) =>{
    try{
        const companies = await Company.find();

        if(companies.length === 0){
            return res.status(404).json({
                success: false,
                message: 'There are no companies to generate the report'
            })
        }

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Companies Report');

        worksheet.columns = [
            { header: 'Name', key: 'nameCompany', width: 25 },
            { header: 'Impact', key: 'impactCompany', width: 50 },
            { header: 'Years', key: 'yearsCompany', width: 30 },
            { header: 'Category', key: 'categoryCompany', width: 15 },
        ]

        worksheet.getRow(1).eachCell((cell) => {
            cell.font = { 
                bold: true, 
                color: { argb: 'FFFFFF' },
                size: 12,
            }
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: '1D16E5' }
            }
            cell.alignment = { vertical: 'middle', horizontal: 'center' };
        })

        companies.forEach(company => {
            worksheet.addRow({
                nameCompany: company.name,
                impactCompany: company.impact,
                yearsCompany: company.years,
                categoryCompany: company.category
            })
        })

        const filePath = path.join(__dirname, `../../public/reports/companies-report-${Date.now()}.xlsx`);

        await workbook.xlsx.writeFile(filePath);

        return res.status(200).json({
            success: true,
            message: 'Report generated successfully',
            report: filePath
        })
    }catch(error){
        return res.status(500).json({ 
            success: false, 
            messge: "Error generating report", 
            error: error.message
        })
    }
}