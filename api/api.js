const request = require('request-promise');
                require('dotenv').config();

module.exports.getBusiness = async (name, location) => {
    let options = {
        uri:"https://api.yelp.com/v3/businesses/search",
        headers: {
            Authorization: `Bearer ${process.env.YELP_API}`
        },
        qs: {
            location: location,
            term: name
        }, 
        method: "GET",
        json: true
            }
    try {
        let result = await request(options); 
        return result;
    } catch (error) {
        console.log(error);
    }
}

module.exports.getReviewById = async (id) => {
    let options = {
        uri:`https://api.yelp.com/v3/businesses/${id}/reviews`,
        headers: {
            Authorization: `Bearer ${process.env.YELP_API}`
        },
        method: "GET",
        json: true
            }
    try {
        let result = await request(options); 
        return result;
    } catch (error) {
        console.log(error);
    }
}