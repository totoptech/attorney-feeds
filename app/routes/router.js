const express = require('express');
const router = express.Router();
const axios = require('axios');
const sequential = require('promise-sequential');
const Cases = require('../model/cases');
const {BrowardClerkBaseURI, auth_key, start_year, start_month, end_year, end_month, court_types} = require('../config/config');
const _month = (end_year - start_year) * 12 + end_month - start_month - 1;
var total_amount = 0;
function getCaseInfo(case_info){

    return {
        Case_Number: case_info.Case_Number,
        State_Reporting_Number: case_info.State_Reporting_Number,
        Caption: case_info.Caption,
        Case_Type: case_info.Case_Type,
        Case_Type_Code: case_info.Case_Type_Code,
        Court_Type: case_info.Court_Type,
        Court_Type_Code: case_info.Court_Type_Code,
        Filed_Date: case_info.Filed_Date,
        Created_Date: case_info.Created_Date,
        Disposition_Code: case_info.Disposition_Code,
        Disposition_Date: case_info.Disposition_Date,
        Disposition_Status: case_info.Disposition_Status,
        Court_Location: case_info.Court_Location,
        Magistrate_Name: case_info.Magistrate_Name,
        Judge_Name: case_info.Judge_Name,
        BCCN: case_info.BCCN
    }
}


function getDetails_CV(case_number){

    const tasks = [
        () => axios.get(BrowardClerkBaseURI + '/case/'+ case_number + '/parties.json?auth_key=' + auth_key),
        () => axios.get(BrowardClerkBaseURI + '/case/'+ case_number + '/events_and_documents.json?auth_key=' + auth_key),
        () => axios.get(BrowardClerkBaseURI + '/case/'+ case_number + '/dispositions.json?auth_key=' + auth_key)
    ]
    return sequential(tasks);
}
function saveCase_CV(case_info, items){
    var case_data = getCaseInfo(case_info);
    case_data.PartyList = items[0].data.PartyList;
    case_data.DocumentList = items[1].data.DocumentList;
    case_data.EventList = items[1].data.EventList;
    case_data.StatisticalClosureList = items[2].data.StatisticalClosureList;
    case_data.DispositionList = items[2].data.DispositionList;
    var _newCase = new Cases(case_data);
    return _newCase.save();
}

function updateCase_CV(case_number, items){
    var _newCase = { $set:{
        PartyList: items[0].data.PartyList,
        DocumentList: items[1].data.DocumentList,
        EventList: items[1].data.EventList,
        StatisticalClosureList: items[2].data.StatisticalClosureList,
        DispositionList: items[2].data.DispositionList
    }}
    return Cases.updateOne({Case_Number: case_number}, _newCase);
}

function getDetails_CR(case_number){
    const tasks = [
        () => axios.get(BrowardClerkBaseURI + '/case/'+ case_number + '/parties.json?auth_key=' + auth_key),
        () => axios.get(BrowardClerkBaseURI + '/case/'+ case_number + '/events_and_documents.json?auth_key=' + auth_key),
        () => axios.get(BrowardClerkBaseURI + '/case/'+ case_number + '/charges.json?auth_key=' + auth_key),
        () => axios.get(BrowardClerkBaseURI + '/case/'+ case_number + '/crim_dispositions.json?auth_key=' + auth_key)
    ]
    return sequential(tasks);
}

function saveCase_CR(case_info, items){
    var case_data = getCaseInfo(case_info);
    case_data.PartyList = items[0].data.PartyList;
    case_data.DocumentList = items[1].data.DocumentList;
    case_data.EventList = items[1].data.EventList;
    case_data.ChargeList = items[2].data.ChargeList;
    case_data.ChargeDispositionList = items[3].data.ChargeDispositionList;
    var _newCase = new Cases(case_data);
    return _newCase.save();
}

function updateCase_CR(case_number, items){
    var _newCase = { $set:{
        PartyList: items[0].data.PartyList,
        DocumentList: items[1].data.DocumentList,
        EventList: items[1].data.EventList,
        ChargeList: items[2].data.ChargeList,
        ChargeDispositionList: items[3].data.ChargeDispositionList
    }}
    return Cases.updateOne({Case_Number: case_number}, _newCase);

}

function saveCase_FAM(case_info){
    var case_data = getCaseInfo(case_info);
    var _newCase = new Cases(case_data);
    return _newCase.save();
}

function saveCase_FM(case_info){
    var case_data = getCaseInfo(case_info);
    var _newCase = new Cases(case_data);
    return _newCase.save();
}

async function diagnosis_Case(case_info, court_type){
    var is_dup = 0; // 0:Create Case, 1:Update Case, 2:No action
    const case_number = case_info.Case_Number;
    
    //Find the duplicated case data in Case Collection
    await Cases.findOne({Case_Number : case_number})
    .then(res =>{
        if(res)
        {
            if(res.Disposition_Code == 'Open')
                is_dup = 1;
            //Code = 'Closed'
            else
                is_dup = 2;
        }
    })
    console.log("CASE_NUMBER:",case_info.Case_Number, " COURT_TYPE:", court_type, " DUPLICATION_STATE", is_dup);
    //Create New Case
    if(is_dup == 0)
    {
        if(court_type == 'CV'){
            return getDetails_CV(case_number)
            .then(res => {
                console.log("SAVING CV DATA", case_number);
                return saveCase_CV(case_info, res)})
                .then(() => {
                    console.log("SAVED CV DATA", case_number)
                })
            .catch(err =>{
                console.log("ERROR",err);
            })
        }
        else if(court_type == 'FAM'){
            console.log("SAVING FAM DATA", case_number);
            return saveCase_FAM(case_info)
            .then(() => {
                console.log("SAVED FAM DATA", case_number);
            })
        }
        else{
            return getDetails_CR(case_number)
            .then(res => { 
                console.log("SAVING CR DATA", case_number);
                return saveCase_CR(case_info, res)})
                .then(() => {
                    console.log("SAVED CR DATA", case_number);
                })
            .catch(err =>{
                console.log("ERROR",err);
            })
        }
    }

    // Update Case
    if(is_dup == 1)
    {
        if(court_type == 'CV'){
            return getDetails_CV(case_number)
            .then(res => {
                console.log("UPDATING CV DATA", case_number);
                return updateCase_CV(case_number, res)})
                .then(() => {
                    console.log("UPDATED CV DATA", case_number);
                })
            .catch(err =>{
                console.log("ERROR",err);
            })
        }
        //Don't need to update in 'FAM' cases
        else if(court_type != 'FAM'){
            return getDetails_CR(case_number)
            .then(res => {
                console.log("UPDATING CR DATA", case_number);
                return updateCase_CR(case_number, res)})
                .then(() => {
                    console.log("UPDATED CR DATA", case_number);
                })
            .catch(err =>{
                console.log("ERROR",err);
            })
        }
    }
}
//Get Cases
async function loadPage( month, court_type, page){
    const _startmonth = (start_month + month - 1) % 12 + 1;
    const _startyear = start_year + parseInt((start_month + month - 1) / 12);

    const _endmonth = (start_month + month) % 12 + 1 ;
    const _endyear = start_year + parseInt((start_month + month)  / 12);
    
    const start_date = _startyear + '-' + _startmonth + '-2';
    const end_date = _endyear + '-' + _endmonth + '-1';
    const params = {
        court_type_code: court_type,
        date_to_use: 'filed',
        date: start_date + ',' + end_date,
        page_number: page,
        case_type_code: 'All',
        auth_key: auth_key,
    };
    // console.log("PARAMS", params);
    var response = await axios.get( BrowardClerkBaseURI + '/search_cases_filed.json', { params });
    var cases = response.data;
    // console.log("CASES", cases);
    for(var i = 0 ; i < cases.length; i ++){
        total_amount ++;
        console.log("AMOUNT", total_amount);
        await diagnosis_Case(cases[i], court_type);
    }

    if(cases.length == 200) {
        await loadPage(month, court_type, page + 1);
    }
    
}

//loop for court_type
async function queryCourtType(month) {
    for(var i = 0 ; i < court_types.length; i++)
    {
        await loadPage(month, court_types[i], 1);
    }
}

//loop for month
async function queryMonth() {
    for(var month = 0; month <= _month; month++)
    {
        await queryCourtType(month);
    }
    console.log("FINISHED", total_amount);
}


router.get('/', async function(req, res, next){
    
    queryMonth();
    return res.send('working');
})

module.exports = router;