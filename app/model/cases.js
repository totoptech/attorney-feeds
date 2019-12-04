var mongoose = require('mongoose');
var caseSchema = new mongoose.Schema({
    Case_Number:{
        type: String,
        required: true,
    },
    State_Reporting_Number: String,
    Caption: String,
    Case_Type: String,
    Case_Type_Code: String,
    Court_Type: String,
    Court_Type_Code: String,
    Filed_Date: String,
    Created_Date: String,
    Disposition_Code: String,
    Disposition_Date: String,
    Disposition_Status: String,
    Court_Location: String,
    Magistrate_Name: String,
    Judge_Name: String,
    BCCN: String,
    //Details
    PartyList: Array,
    DocumentList: Array,
    EventList: Array,
    ChargeList: Array,
    ChargeDispositionList: Array,
    StatisticalClosureList: Array,
    DispositionList: Array
})

var Cases = mongoose.model('Cases', caseSchema);
module.exports = Cases;