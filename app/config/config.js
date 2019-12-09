module.exports = {
    dburl: 'mongodb+srv://contractor_0:contractor_temp_367@cluster0-nsgh6.gcp.mongodb.net/test?retryWrites=true&w=majority',
    // dburl: 'mongodb://localhost:27017/broward-clerk',
    BrowardClerkBaseURI : 'https://api.browardclerk.org/api',
    auth_key : 'YOUR AUTH KEY',
    
    // Court Types: CV, FAM, FEL, TM (PR, PP)
    court_types : ['CV', 'FAM', 'FEL', 'TM'],
    // court_types : ['CV'],
    start_year : 2014,
    start_month : 7,
    end_year : 2014,
    end_month : 8
}
